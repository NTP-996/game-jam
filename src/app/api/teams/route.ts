import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET /api/teams - List all public teams or user's teams
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'public' // 'public', 'my', 'available'
    const search = searchParams.get('search') || ''
    const tags = searchParams.get('tags')?.split(',') || []

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

    let query = supabase.from('team_overview').select(`
      *,
      members
    `)

    // Apply filters based on mode
    if (mode === 'my') {
      // Get teams where user is a member (including as leader)
      const { data: userMemberships } = await supabase
        .from('team_memberships')
        .select('team_id')
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (userMemberships && userMemberships.length > 0) {
        const teamIds = userMemberships.map(m => m.team_id)
        query = query.in('id', teamIds)
      } else {
        // User has no teams, return empty result
        return NextResponse.json({ teams: [] })
      }
    } else if (mode === 'available') {
      // Get teams that are recruiting and user is not a member of
      query = query.eq('is_recruiting', true).eq('is_public', true)
    } else {
      // Public teams
      query = query.eq('is_public', true)
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply tags filter
    if (tags.length > 0) {
      query = query.overlaps('tags', tags)
    }

    const { data: teams, error: teamsError } = await query.order('created_at', { ascending: false })

    if (teamsError) {
      console.error('Teams fetch error:', teamsError)
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
    }

    // Enrich teams with detailed member information if they have members
    const enrichedTeams = await Promise.all(
      (teams || []).map(async (team) => {
        if (team.members && team.members.length > 0) {
          // Get detailed member info from profiles
          const memberIds = team.members.map((m: any) => m.user_id)
          
          const { data: memberProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, username')
            .in('id', memberIds)

          // Merge team membership data with profile data
          const enrichedMembers = team.members.map((member: any) => {
            const profile = memberProfiles?.find(p => p.id === member.user_id)
            
            return {
              user_id: member.user_id,
              name: profile?.full_name || profile?.username || 'Unknown Member',
              avatar_url: profile?.avatar_url,
              role: member.role || 'Member',
              permissions: {
                can_invite: member.can_invite || false,
                can_manage_submissions: member.can_manage_submissions || false
              },
              joined_at: member.joined_at
            }
          })

          return {
            ...team,
            members: enrichedMembers
          }
        }
        return team
      })
    )

    return NextResponse.json({ teams: enrichedTeams })
  } catch (error) {
    console.error('Teams API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/teams - Create a new team
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

    // Check if user already has a team (as member or leader)
    const { data: existingMembership } = await supabase
      .from('team_memberships')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (existingMembership) {
      return NextResponse.json(
        { error: 'You can only be a member of one team at a time' }, 
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      name,
      description,
      looking_for,
      tags,
      project_idea,
      max_members,
      is_public,
      github_url,
      discord_server
    } = body

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
    }

    // Create team
    const { data: team, error: createError } = await supabase
      .from('teams')
      .insert({
        name: name.trim(),
        description: description?.trim() || '',
        looking_for: looking_for || [],
        tags: tags || [],
        project_idea: project_idea?.trim() || '',
        max_members: max_members || 5,
        is_public: is_public !== false, // Default to true
        is_recruiting: true,
        leader_id: user.id,
        github_url: github_url?.trim() || null,
        discord_server: discord_server?.trim() || null
      })
      .select()
      .single()

    if (createError) {
      console.error('Team creation error:', createError)
      if (createError.code === '23505') {
        // Check if it's a team name duplicate or membership duplicate
        if (createError.message?.includes('team_name')) {
          return NextResponse.json({ error: 'Team name already exists' }, { status: 400 })
        } else {
          // Likely a membership constraint issue, which should be handled by the trigger
          return NextResponse.json({ error: 'Team creation conflict. Please try again.' }, { status: 400 })
        }
      }
      return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
    }

    return NextResponse.json({ team, message: 'Team created successfully' })
  } catch (error) {
    console.error('Team creation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 