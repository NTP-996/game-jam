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

// GET /api/projects/[projectId] - Get specific project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Check if this is a public request (no auth header)
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      // Public access - only allow viewing submitted/approved projects
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      const { data: project, error } = await supabase
        .from('project_catalogue')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Project not found or not publicly available' },
            { status: 404 }
          )
        }
        console.error('Public project fetch error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch project' },
          { status: 500 }
        )
      }

      return NextResponse.json({ project })
    }

    // Authenticated access - can view own projects regardless of status
    const { supabase, user } = await createAuthenticatedClient(request)

    const { data: project, error } = await supabase
      .from('project_submissions')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
      console.error('Project fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch project' },
        { status: 500 }
      )
    }

    // Check if user owns this project or if it's publicly viewable
    if (project.user_id !== user.id && !['submitted', 'approved', 'featured'].includes(project.status)) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ project })

  } catch (error) {
    console.error('Project fetch API error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/projects/[projectId] - Update specific project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const { supabase, user } = await createAuthenticatedClient(request)

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Check if project exists and user owns it
    const { data: existingProject, error: fetchError } = await supabase
      .from('project_submissions')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingProject) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Don't allow updates to final submissions unless it's just status change
    const body = await request.json()
    if (existingProject.is_final && existingProject.status !== 'draft' && !body.statusOnly) {
      return NextResponse.json(
        { error: 'Cannot modify final submissions' },
        { status: 403 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    // Only update provided fields
    if (body.project_name !== undefined) updateData.project_name = body.project_name
    if (body.project_description !== undefined) updateData.project_description = body.project_description
    if (body.category !== undefined) updateData.category = body.category
    if (body.solana_integration !== undefined) updateData.solana_integration = body.solana_integration
    if (body.github_url !== undefined) updateData.github_url = body.github_url
    if (body.demo_url !== undefined) updateData.demo_url = body.demo_url
    if (body.game_host_url !== undefined) updateData.game_host_url = body.game_host_url
    if (body.video_url !== undefined) updateData.video_url = body.video_url
    if (body.banner_url !== undefined) updateData.banner_url = body.banner_url
    if (body.logo_url !== undefined) updateData.logo_url = body.logo_url
    if (body.challenges !== undefined) updateData.challenges = body.challenges
    if (body.features !== undefined) updateData.features = body.features
    if (body.team_members !== undefined) updateData.team_members = body.team_members

    // Handle tech_stack
    if (body.tech_stack !== undefined) {
      let tech_stack = body.tech_stack
      if (typeof tech_stack === 'string') {
        tech_stack = tech_stack.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0)
      }
      updateData.tech_stack = tech_stack
    }

    // Handle screenshot_urls
    if (body.screenshot_urls !== undefined) {
      const screenshot_urls = Array.isArray(body.screenshot_urls) 
        ? body.screenshot_urls.filter(url => url && url.trim().length > 0)
        : []
      updateData.screenshot_urls = screenshot_urls
    }

    // Handle status changes
    if (body.status !== undefined) {
      updateData.status = body.status
    }

    const { data: project, error } = await supabase
      .from('project_submissions')
      .update(updateData)
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Project update error:', error)
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      project,
      message: 'Project updated successfully' 
    })

  } catch (error) {
    console.error('Project update API error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/projects/[projectId] - Delete specific project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const { supabase, user } = await createAuthenticatedClient(request)

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Check if project exists and is a draft
    const { data: existingProject, error: fetchError } = await supabase
      .from('project_submissions')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingProject) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Only allow deletion of draft projects
    if (existingProject.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only delete draft projects' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('project_submissions')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Project deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Project deleted successfully' 
    })

  } catch (error) {
    console.error('Project deletion API error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 