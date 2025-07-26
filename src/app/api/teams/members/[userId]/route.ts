import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// DELETE /api/teams/members/[userId] - Remove team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

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

    // Get the team membership to verify the user being removed and the team
    const { data: membershipToRemove, error: membershipError } = await supabase
      .from('team_memberships')
      .select('team_id, user_id, team:teams!inner(leader_id)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (membershipError || !membershipToRemove) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    const teamId = membershipToRemove.team_id
    const teamLeaderId = (membershipToRemove.team as any)?.leader_id

    // Check if the current user is the team leader
    if (teamLeaderId !== user.id) {
      return NextResponse.json({ error: 'Only team leaders can remove members' }, { status: 403 })
    }

    // Prevent team leader from removing themselves
    if (userId === user.id) {
      return NextResponse.json({ error: 'Team leaders cannot remove themselves' }, { status: 400 })
    }

    // Remove the team member
    const { error: removeError } = await supabase
      .from('team_memberships')
      .update({ status: 'removed', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('team_id', teamId)
      .eq('status', 'active')

    if (removeError) {
      console.error('Member removal error:', removeError)
      return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Team member removed successfully' 
    })

  } catch (error) {
    console.error('Remove member API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 