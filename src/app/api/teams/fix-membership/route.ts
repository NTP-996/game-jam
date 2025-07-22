import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// POST /api/teams/fix-membership - Fix missing team leader memberships
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

    // Find teams where user is the leader but not a member
    const { data: teamsAsLeader, error: teamsError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('leader_id', user.id)

    if (teamsError) {
      console.error('Error fetching teams:', teamsError)
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
    }

    if (!teamsAsLeader || teamsAsLeader.length === 0) {
      return NextResponse.json({ message: 'No teams found where you are the leader' })
    }

    const fixedTeams = []

    for (const team of teamsAsLeader) {
      // Check if leader is already a member
      const { data: existingMembership } = await supabase
        .from('team_memberships')
        .select('id')
        .eq('team_id', team.id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!existingMembership) {
        // Add leader as a member
        const { error: membershipError } = await supabase
          .from('team_memberships')
          .insert({
            team_id: team.id,
            user_id: user.id,
            role: 'Leader',
            status: 'active',
            can_invite: true,
            can_manage_submissions: true
          })

        if (membershipError) {
          console.error(`Failed to add leadership membership for team ${team.id}:`, membershipError)
        } else {
          fixedTeams.push(team.name)
        }
      }
    }

    if (fixedTeams.length > 0) {
      return NextResponse.json({ 
        message: `Fixed leadership memberships for teams: ${fixedTeams.join(', ')}`,
        fixedTeams 
      })
    } else {
      return NextResponse.json({ 
        message: 'All team leaderships already have proper memberships' 
      })
    }

  } catch (error) {
    console.error('Fix membership API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 