import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// PUT /api/teams/invitations/[invitationId] - Respond to invitation (accept/decline)
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const { invitationId } = await params

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
    const { action } = body // 'accept' or 'decline'

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "accept" or "decline"' }, 
        { status: 400 }
      )
    }

    // Get invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from('team_invitations')
      .select(`
        *,
        teams!inner(id, name, max_members, member_count:team_memberships(count))
      `)
      .eq('id', invitationId)
      .eq('invitee_id', user.id)
      .eq('status', 'pending')
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found or already responded to' }, 
        { status: 404 }
      )
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' }, 
        { status: 400 }
      )
    }

    if (action === 'accept') {
      // Use the database function to accept invitation (handles capacity check)
      const { data: acceptResult, error: acceptError } = await supabase
        .rpc('accept_team_invitation', { invitation_id: invitationId })

      if (acceptError || !acceptResult) {
        console.error('Accept invitation error:', acceptError)
        return NextResponse.json(
          { error: 'Failed to accept invitation. Team might be at capacity.' }, 
          { status: 400 }
        )
      }

      // Get updated team info
      const { data: teamInfo } = await supabase
        .from('team_overview')
        .select('*')
        .eq('id', invitation.team_id)
        .single()

      return NextResponse.json({ 
        message: 'Invitation accepted successfully',
        team: teamInfo
      })
    } else {
      // Decline invitation
      const { error: declineError } = await supabase
        .from('team_invitations')
        .update({ 
          status: 'declined', 
          responded_at: new Date().toISOString() 
        })
        .eq('id', invitationId)

      if (declineError) {
        console.error('Decline invitation error:', declineError)
        return NextResponse.json({ error: 'Failed to decline invitation' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Invitation declined' })
    }
  } catch (error) {
    console.error('Invitation response API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/teams/invitations/[invitationId] - Cancel invitation
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const { invitationId } = await params

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

    // Cancel invitation (only inviter can cancel)
    const { error: cancelError } = await supabase
      .from('team_invitations')
      .update({ 
        status: 'cancelled', 
        responded_at: new Date().toISOString() 
      })
      .eq('id', invitationId)
      .eq('inviter_id', user.id)
      .eq('status', 'pending')

    if (cancelError) {
      console.error('Cancel invitation error:', cancelError)
      return NextResponse.json({ error: 'Failed to cancel invitation' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Invitation cancelled successfully' })
  } catch (error) {
    console.error('Cancel invitation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 