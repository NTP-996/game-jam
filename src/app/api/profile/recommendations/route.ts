import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

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

    // Use the database function for recommendations
    const { data: recommendations, error: recommendationError } = await supabase
      .rpc('get_team_recommendations', { user_id: user.id })

    if (recommendationError) {
      console.error('Recommendation error:', recommendationError)
      return NextResponse.json(
        { error: 'Failed to get recommendations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Recommendation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Alternative implementation if the database function doesn't work
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

    // Get current user's profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('skills, preferred_role, programming_languages, frameworks')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get all profiles looking for team members
    const { data: candidates, error: candidatesError } = await supabase
      .from('public_profiles')
      .select('*')
      .eq('looking_for_team', true)
      .neq('id', user.id)

    if (candidatesError) {
      console.error('Candidates fetch error:', candidatesError)
      return NextResponse.json(
        { error: 'Failed to fetch candidates' },
        { status: 500 }
      )
    }

    // Calculate compatibility scores
    const recommendations = candidates.map(candidate => {
      let score = 0

      // Different role bonus (complementary skills)
      if (candidate.preferred_role && candidate.preferred_role !== userProfile.preferred_role) {
        score += 10
      }

      // Shared skills bonus
      if (userProfile.skills && candidate.skills) {
        const sharedSkills = userProfile.skills.filter(skill => 
          candidate.skills.includes(skill)
        )
        score += sharedSkills.length * 2
      }

      // Shared programming languages bonus
      if (userProfile.programming_languages && candidate.programming_languages) {
        const sharedLangs = userProfile.programming_languages.filter(lang => 
          candidate.programming_languages.includes(lang)
        )
        score += sharedLangs.length * 1.5
      }

      // Shared frameworks bonus
      if (userProfile.frameworks && candidate.frameworks) {
        const sharedFrameworks = userProfile.frameworks.filter(framework => 
          candidate.frameworks.includes(framework)
        )
        score += sharedFrameworks.length * 1.5
      }

      return {
        ...candidate,
        compatibility_score: Math.round(score)
      }
    })

    // Sort by compatibility score and return top 20
    const sortedRecommendations = recommendations
      .sort((a, b) => b.compatibility_score - a.compatibility_score)
      .slice(0, 20)

    return NextResponse.json({ recommendations: sortedRecommendations })
  } catch (error) {
    console.error('Manual recommendation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 