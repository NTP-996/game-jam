import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Helper function to create authenticated Supabase client
async function createAuthenticatedClient(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized')
  }

  const token = authHeader.replace('Bearer ', '')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })
  
  // Verify the JWT token and get user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  return { supabase, user }
}

// GET /api/projects - Get user's projects or public catalogue
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') // 'user' | 'catalogue' | 'featured'
    const category = searchParams.get('category')
    const tech = searchParams.get('tech')
    const limit = searchParams.get('limit')

    // For public catalogue access, no auth required
    if (view === 'catalogue' || view === 'featured') {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      if (view === 'featured') {
        const { data, error } = await supabase
          .from('project_catalogue')
          .select('*')
          .eq('status', 'featured')
          .order('submitted_at', { ascending: false })
          .limit(limit ? parseInt(limit) : 6)
        
        if (error) {
          console.error('Featured projects fetch error:', error)
          return NextResponse.json({ error: 'Failed to fetch featured projects' }, { status: 500 })
        }
        
        return NextResponse.json({ projects: data })
      }

      // Regular catalogue view
      let query = supabase
        .from('project_catalogue')
        .select('*')

      if (category) {
        query = query.eq('category', category)
      }

      if (tech) {
        const technologies = tech.split(',').map(t => t.trim())
        const { data, error } = await supabase
          .rpc('search_projects_by_tech', { 
            search_technologies: technologies 
          })
        
        if (error) {
          console.error('Tech search error:', error)
          return NextResponse.json({ error: 'Failed to search projects' }, { status: 500 })
        }
        
        return NextResponse.json({ projects: data })
      }

      const { data, error } = await query
        .order('submitted_at', { ascending: false })
        .limit(limit ? parseInt(limit) : 50)

      if (error) {
        console.error('Catalogue fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
      }

      return NextResponse.json({ projects: data })
    }

    // For user's own projects, auth required
    const { supabase, user } = await createAuthenticatedClient(request)

    // Get individual projects (not team projects)
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('creator_id', user.id)
      .is('team_id', null) // Only individual projects
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('User projects fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    return NextResponse.json({ projects })

  } catch (error) {
    console.error('Projects API error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await createAuthenticatedClient(request)
    
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'project_name', 'project_description', 'category', 'solana_integration',
      'github_url', 'game_host_url', 'video_url', 'banner_url', 'logo_url'
    ]
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Ensure screenshot_urls is an array and filter out empty strings
    const screenshot_urls = Array.isArray(body.screenshot_urls) 
      ? body.screenshot_urls.filter(url => url && url.trim().length > 0)
      : []

    if (screenshot_urls.length === 0) {
      return NextResponse.json(
        { error: 'At least one screenshot URL is required' },
        { status: 400 }
      )
    }

    // Parse tech_stack if it's a string (comma-separated)
    let tech_stack = body.tech_stack || []
    if (typeof tech_stack === 'string') {
      tech_stack = tech_stack.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0)
    }

    // Check if user is part of a team to determine project type
    let team_id = null
    const { data: userMemberships } = await supabase
      .from('team_memberships')
      .select('team_id, can_manage_submissions, team:teams!inner(leader_id)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    // If user is in a team and can manage submissions or is the leader, make it a team project
    if (userMemberships && (userMemberships.can_manage_submissions || (userMemberships.team as any)?.leader_id === user.id)) {
      team_id = userMemberships.team_id
      
      // Check if team already has a project
      const { data: existingTeamProject } = await supabase
        .from('projects')
        .select('id')
        .eq('team_id', team_id)
        .single()

      if (existingTeamProject) {
        return NextResponse.json(
          { error: 'Team already has a project submission. Use the team submissions API to update it.' },
          { status: 400 }
        )
      }
    }

    const projectData = {
      creator_id: user.id,
      team_id, // Will be team ID if user is in a team, null for individual
      project_name: body.project_name,
      project_description: body.project_description,
      category: body.category,
      solana_integration: body.solana_integration,
      tech_stack,
      github_url: body.github_url,
      demo_url: body.demo_url || null,
      game_host_url: body.game_host_url,
      video_url: body.video_url,
      banner_url: body.banner_url,
      logo_url: body.logo_url,
      screenshot_urls,
      challenges: body.challenges || null,
      features: body.features || [],
      status: 'draft'
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select('*')
      .single()

    if (error) {
      console.error('Project creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      project,
      message: `${team_id ? 'Team' : 'Individual'} project created successfully` 
    })

  } catch (error) {
    console.error('Project creation API error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 