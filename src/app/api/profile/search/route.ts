import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { skills, roles, availability, experience_levels, location } = body

    // Build the query
    let query = supabase
      .from('public_profiles')
      .select('*')
      .neq('id', user.id) // Exclude current user

    // Filter by skills if provided
    if (skills && skills.length > 0) {
      query = query.overlaps('skills', skills)
    }

    // Filter by preferred roles if provided
    if (roles && roles.length > 0) {
      query = query.in('preferred_role', roles)
    }

    // Filter by availability if provided
    if (availability && availability.length > 0) {
      query = query.in('availability', availability)
    }

    // Filter by experience levels if provided
    if (experience_levels && experience_levels.length > 0) {
      query = query.in('experience_level', experience_levels)
    }

    // Filter by location if provided
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    // Execute query
    const { data: profiles, error: searchError } = await query
      .order('created_at', { ascending: false })
      .limit(50)

    if (searchError) {
      console.error('Profile search error:', searchError)
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({ profiles })
  } catch (error) {
    console.error('Profile search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const lookingForTeam = searchParams.get('looking_for_team')
    const role = searchParams.get('role')
    const location = searchParams.get('location')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build the query
    let query = supabase
      .from('public_profiles')
      .select('*')
      .neq('id', user.id) // Exclude current user

    // Filter by team seeking status
    if (lookingForTeam === 'true') {
      query = query.eq('looking_for_team', true)
    }

    // Filter by role
    if (role) {
      query = query.eq('preferred_role', role)
    }

    // Filter by location
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    // Execute query
    const { data: profiles, error: searchError } = await query
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 100)) // Cap at 100

    if (searchError) {
      console.error('Profile browse error:', searchError)
      return NextResponse.json(
        { error: 'Browse failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({ profiles })
  } catch (error) {
    console.error('Profile browse API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 