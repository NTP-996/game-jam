import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  try {
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Create Supabase client with the token
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Create Supabase client with the token
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    // Validate required fields
    const {
      full_name,
      username,
      bio,
      github_url,
      twitter_url,
      discord_username,
      telegram_username,
      linkedin_url,
      website_url,
      location,
      timezone,
      birth_date,
      phone,
      job_title,
      company,
      experience_level,
      education,
      skills,
      interests,
      programming_languages,
      frameworks,
      previous_hackathons,
      preferred_role,
      availability,
      looking_for_team,
      favorite_games,
      game_dev_experience
    } = body

    // Prepare update data with proper null handling for dates and enum fields
    const updateData = {
      full_name,
      username,
      bio,
      github_url,
      twitter_url,
      discord_username,
      telegram_username,
      linkedin_url,
      website_url,
      location,
      timezone,
      birth_date: birth_date && birth_date.trim() !== '' ? birth_date : null,
      phone,
      job_title,
      company,
      experience_level: experience_level && experience_level.trim() !== '' ? experience_level : null,
      education,
      skills: skills || [],
      interests: interests || [],
      programming_languages: programming_languages || [],
      frameworks: frameworks || [],
      previous_hackathons: previous_hackathons || 0,
      preferred_role: preferred_role && preferred_role.trim() !== '' ? preferred_role : null,
      availability: availability && availability.trim() !== '' ? availability : null,
      looking_for_team: Boolean(looking_for_team),
      favorite_games: favorite_games || [],
      game_dev_experience,
      updated_at: new Date().toISOString()
    }

    // Update profile
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      profile,
      message: 'Profile updated successfully' 
    })
  } catch (error) {
    console.error('Profile update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 