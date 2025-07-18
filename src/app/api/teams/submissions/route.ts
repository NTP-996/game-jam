import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET /api/teams/submissions - Get team's submission
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('team_id')

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

    let query = supabase
      .from('projects')
      .select('*')
      .not('team_id', 'is', null) // Only team projects

    // If team_id is specified, get that team's submission
    if (teamId) {
      query = query.eq('team_id', teamId)
    } else {
      // Get submissions for teams the user is a member of
      const { data: userMemberships } = await supabase
        .from('team_memberships')
        .select('team_id')
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (!userMemberships || userMemberships.length === 0) {
        return NextResponse.json({ submissions: [] })
      }

      const teamIds = userMemberships.map(m => m.team_id)
      query = query.in('team_id', teamIds)
    }

    const { data: submissions, error: submissionsError } = await query
      .order('created_at', { ascending: false })

    if (submissionsError) {
      console.error('Submissions fetch error:', submissionsError)
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
    }

    return NextResponse.json({ submissions: submissions || [] })
  } catch (error) {
    console.error('Submissions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/teams/submissions - Create or update team submission
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
    const {
      team_id,
      project_name,
      project_description,
      category,
      solana_integration,
      tech_stack,
      github_url,
      demo_url,
      game_host_url,
      video_url,
      banner_url,
      logo_url,
      screenshot_urls,
      challenges,
      features,
      status,
      is_final
    } = body

    // Validate required fields based on current projects schema
    if (!team_id || !project_name || !project_description || !category || !solana_integration || !github_url || !game_host_url || !video_url || !banner_url || !logo_url) {
      return NextResponse.json(
        { error: 'Team ID, project name, description, category, solana integration, github URL, game host URL, video URL, banner URL, and logo URL are required' }, 
        { status: 400 }
      )
    }

    // Check if user has permission to manage submissions for this team
    const { data: membership } = await supabase
      .from('team_memberships')
      .select('can_manage_submissions, team:teams!inner(leader_id)')
      .eq('team_id', team_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership || (!membership.can_manage_submissions && (membership.team as any)?.leader_id !== user.id)) {
      return NextResponse.json(
        { error: 'You do not have permission to manage submissions for this team' }, 
        { status: 403 }
      )
    }

    // Check if submission already exists for this team
    const { data: existingSubmission } = await supabase
      .from('projects')
      .select('id')
      .eq('team_id', team_id)
      .single()

    const submissionData = {
      team_id,
      creator_id: user.id,
      project_name: project_name.trim(),
      project_description: project_description.trim(),
      category: category.trim(),
      solana_integration: solana_integration.trim(),
      tech_stack: tech_stack || [],
      github_url: github_url.trim(),
      demo_url: demo_url?.trim() || null,
      game_host_url: game_host_url.trim(),
      video_url: video_url.trim(),
      banner_url: banner_url.trim(),
      logo_url: logo_url.trim(),
      screenshot_urls: screenshot_urls || [],
      challenges: challenges?.trim() || null,
      features: features || [],
      status: status || 'draft',
      is_final: Boolean(is_final),
      updated_at: new Date().toISOString()
    }

    let result
    if (existingSubmission) {
      // Update existing submission
      const { data: submission, error: updateError } = await supabase
        .from('projects')
        .update(submissionData)
        .eq('id', existingSubmission.id)
        .select('*')
        .single()

      if (updateError) {
        console.error('Submission update error:', updateError)
        return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
      }

      result = submission
    } else {
      // Create new submission
      const { data: submission, error: createError } = await supabase
        .from('projects')
        .insert({
          ...submissionData,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (createError) {
        console.error('Submission creation error:', createError)
        return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 })
      }

      result = submission
    }

    return NextResponse.json({ 
      submission: result, 
      message: existingSubmission ? 'Submission updated successfully' : 'Submission created successfully' 
    })
  } catch (error) {
    console.error('Submission API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 