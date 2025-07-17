import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET /api/teams/invitations - Get user's invitations (sent and received)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all' // 'sent', 'received', 'all'

    // Get auth token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get invitations first
    let invitationsQuery = supabase
      .from('team_invitations')
      .select('*')

    // Filter by type
    if (type === 'sent') {
      invitationsQuery = invitationsQuery.eq('inviter_id', user.id)
    } else if (type === 'received') {
      invitationsQuery = invitationsQuery.eq('invitee_id', user.id)
    } else {
      invitationsQuery = invitationsQuery.or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)
    }

    const { data: invitations, error: invitationsError } = await invitationsQuery
      .order('created_at', { ascending: false })

    if (invitationsError) {
      console.error('Invitations fetch error:', invitationsError)
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
    }

    // Enrich invitations with team and profile data manually
    const enrichedInvitations = await Promise.all(
      (invitations || []).map(async (invitation) => {
        // Get team info
        const { data: team } = await supabase
          .from('teams')
          .select('id, name, description')
          .eq('id', invitation.team_id)
          .single()

        // Get inviter profile
        const { data: inviterProfile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, username')
          .eq('id', invitation.inviter_id)
          .single()

        return {
          ...invitation,
          team_name: team?.name || 'Unknown Team',
          invited_by_name: inviterProfile?.full_name || 'Unknown User'
        }
      })
    )

    return NextResponse.json({ invitations: enrichedInvitations })
  } catch (error) {
    console.error('Invitations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/teams/invitations - Send a team invitation
export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { team_id, invitee_id, role, message } = body

    // Validate required fields
    if (!team_id || !invitee_id || !role) {
      return NextResponse.json(
        { error: 'Team ID, invitee ID, and role are required' }, 
        { status: 400 }
      )
    }

    // Check if invitee exists
    const { data: inviteeProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', invitee_id)
      .single()

    if (!inviteeProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has permission to invite (team leader or member with invite permission)
    const { data: permission } = await supabase
      .from('team_memberships')
      .select('can_invite, team:teams!inner(leader_id)')
      .eq('team_id', team_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!permission || (!permission.can_invite && permission.team.leader_id !== user.id)) {
      return NextResponse.json(
        { error: 'You do not have permission to invite members to this team' }, 
        { status: 403 }
      )
    }

    // Check if invitee is already a team member
    const { data: existingMember } = await supabase
      .from('team_memberships')
      .select('id')
      .eq('team_id', team_id)
      .eq('user_id', invitee_id)
      .eq('status', 'active')
      .single()

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this team' }, 
        { status: 400 }
      )
    }

    // Check if there's already a pending invitation
    const { data: existingInvitation } = await supabase
      .from('team_invitations')
      .select('id')
      .eq('team_id', team_id)
      .eq('invitee_id', invitee_id)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation is already pending for this user' }, 
        { status: 400 }
      )
    }

    // Check team capacity
    const { data: teamInfo } = await supabase
      .from('team_overview')
      .select('max_members, member_count')
      .eq('id', team_id)
      .single()

    if (teamInfo && teamInfo.member_count >= teamInfo.max_members) {
      return NextResponse.json(
        { error: 'Team is at maximum capacity' }, 
        { status: 400 }
      )
    }

    // Create invitation
    const { data: invitation, error: createError } = await supabase
      .from('team_invitations')
      .insert({
        team_id,
        inviter_id: user.id,
        invitee_id,
        role,
        message: message?.trim() || null
      })
      .select(`
        *,
        teams!inner(id, name, description),
        inviter:profiles!inviter_id(id, full_name, avatar_url, username),
        invitee:profiles!invitee_id(id, full_name, avatar_url, username)
      `)
      .single()

    if (createError) {
      console.error('Invitation creation error:', createError)
      return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 })
    }

    return NextResponse.json({ invitation, message: 'Invitation sent successfully' })
  } catch (error) {
    console.error('Invitation creation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 