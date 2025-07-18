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

// POST /api/projects/[projectId]/submit - Submit project for judging
export async function POST(
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

    // Get the current project
    const { data: project, error: fetchError } = await supabase
      .from('project_submissions')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Check if already submitted
    if (project.status === 'submitted' || project.is_final) {
      return NextResponse.json(
        { error: 'Project has already been submitted' },
        { status: 400 }
      )
    }

    // Validate required fields for submission
    const requiredFields = [
      'project_name', 'project_description', 'category', 'solana_integration',
      'github_url', 'game_host_url', 'video_url', 'banner_url', 'logo_url'
    ]

    const missingFields = requiredFields.filter(field => !project[field])
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required fields for submission',
          missingFields
        },
        { status: 400 }
      )
    }

    // Validate tech stack
    if (!project.tech_stack || project.tech_stack.length === 0) {
      return NextResponse.json(
        { error: 'Tech stack is required for submission' },
        { status: 400 }
      )
    }

    // Validate screenshots
    if (!project.screenshot_urls || project.screenshot_urls.length === 0) {
      return NextResponse.json(
        { error: 'At least one screenshot is required for submission' },
        { status: 400 }
      )
    }

    // Submit the project
    const { data: submittedProject, error: submitError } = await supabase
      .from('project_submissions')
      .update({
        status: 'submitted',
        is_final: true,
        submitted_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (submitError) {
      console.error('Project submission error:', submitError)
      return NextResponse.json(
        { error: 'Failed to submit project' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      project: submittedProject,
      message: 'Project submitted successfully! It is now under review.'
    })

  } catch (error) {
    console.error('Project submission API error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 