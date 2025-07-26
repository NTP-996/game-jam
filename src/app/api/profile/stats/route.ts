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

    // Get user's profile first
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('skills, preferred_role, looking_for_team')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get total number of profiles
    const { count: totalProfiles, error: totalError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get profiles looking for team
    const { count: lookingForTeam, error: teamError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('looking_for_team', true)

    // Get profiles with same skills
    let similarSkillsCount = 0
    if (userProfile.skills && userProfile.skills.length > 0) {
      const { count: skillsCount, error: skillsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .overlaps('skills', userProfile.skills)
        .neq('id', user.id)

      if (!skillsError) {
        similarSkillsCount = skillsCount || 0
      }
    }

    // Get profiles with same role
    let sameRoleCount = 0
    if (userProfile.preferred_role) {
      const { count: roleCount, error: roleError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('preferred_role', userProfile.preferred_role)
        .neq('id', user.id)

      if (!roleError) {
        sameRoleCount = roleCount || 0
      }
    }

    // Get most popular skills
    const { data: skillsData, error: skillsStatsError } = await supabase
      .from('profiles')
      .select('skills')
      .not('skills', 'is', null)

    let popularSkills: { skill: string; count: number }[] = []
    if (!skillsStatsError && skillsData) {
      const skillCounts: Record<string, number> = {}
      
      skillsData.forEach(profile => {
        if (profile.skills) {
          profile.skills.forEach((skill: string) => {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1
          })
        }
      })

      popularSkills = Object.entries(skillCounts)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    }

    // Get role distribution
    const { data: rolesData, error: rolesStatsError } = await supabase
      .from('profiles')
      .select('preferred_role')
      .not('preferred_role', 'is', null)

    let roleDistribution: { role: string; count: number }[] = []
    if (!rolesStatsError && rolesData) {
      const roleCounts: Record<string, number> = {}
      
      rolesData.forEach(profile => {
        if (profile.preferred_role) {
          roleCounts[profile.preferred_role] = (roleCounts[profile.preferred_role] || 0) + 1
        }
      })

      roleDistribution = Object.entries(roleCounts)
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count)
    }

    const stats = {
      totalProfiles: totalProfiles || 0,
      lookingForTeam: lookingForTeam || 0,
      similarSkillsCount,
      sameRoleCount,
      popularSkills,
      roleDistribution,
      userLookingForTeam: userProfile.looking_for_team,
      recommendations: Math.min(similarSkillsCount, 20) // Available recommendations
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Profile stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 