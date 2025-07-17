-- Fix Team System Database Issues
-- This script addresses foreign key relationships and RLS policy conflicts

-- =====================================================
-- 1. FIX API ROUTE TO NOT USE FOREIGN KEY JOINS
-- =====================================================
-- The issue is the API is trying to join profiles with team_overview
-- Let's update the team_overview view to include profile data directly

-- Drop and recreate team_overview with profile data included
DROP VIEW IF EXISTS public.team_overview CASCADE;

CREATE OR REPLACE VIEW public.team_overview AS
SELECT 
  t.id,
  t.name,
  t.description,
  t.looking_for,
  t.max_members,
  t.is_public,
  t.leader_id,
  t.created_at,
  t.updated_at,
  
  -- Leader profile info
  leader_profile.full_name as leader_name,
  leader_profile.avatar_url as leader_avatar_url,
  leader_profile.username as leader_username,
  
  -- Member count
  COUNT(tm.user_id) FILTER (WHERE tm.status = 'active') AS member_count,
  
  -- Derived fields
  (COUNT(tm.user_id) FILTER (WHERE tm.status = 'active') < t.max_members) AS is_recruiting,
  
  -- Members array with profile data
  COALESCE(
    ARRAY_AGG(
      JSON_BUILD_OBJECT(
        'user_id', tm.user_id,
        'role', tm.role,
        'can_invite', tm.can_invite,
        'can_manage_submissions', tm.can_manage_submissions,
        'joined_at', tm.joined_at,
        'name', member_profiles.full_name,
        'avatar_url', member_profiles.avatar_url,
        'username', member_profiles.username,
        'skills', COALESCE(member_profiles.skills, ARRAY[]::text[])
      ) ORDER BY tm.joined_at
    ) FILTER (WHERE tm.status = 'active'),
    ARRAY[]::json[]
  ) AS members

FROM public.teams t
LEFT JOIN public.profiles leader_profile ON t.leader_id = leader_profile.id
LEFT JOIN public.team_memberships tm ON t.id = tm.team_id AND tm.status = 'active'
LEFT JOIN public.profiles member_profiles ON tm.user_id = member_profiles.id
GROUP BY 
  t.id, t.name, t.description, t.looking_for, t.max_members, t.is_public, 
  t.leader_id, t.created_at, t.updated_at,
  leader_profile.full_name, leader_profile.avatar_url, leader_profile.username;

-- =====================================================
-- 2. FIX RLS POLICIES - REMOVE INFINITE RECURSION
-- =====================================================

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can read team memberships" ON public.team_memberships;
DROP POLICY IF EXISTS "Users can manage their own memberships" ON public.team_memberships;
DROP POLICY IF EXISTS "Team leaders can manage memberships" ON public.team_memberships;
DROP POLICY IF EXISTS "Members can read team memberships" ON public.team_memberships;

-- Create simplified, non-recursive policies
CREATE POLICY "team_memberships_select_policy" ON public.team_memberships
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT leader_id FROM public.teams WHERE id = team_id
    )
  );

CREATE POLICY "team_memberships_insert_policy" ON public.team_memberships
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT leader_id FROM public.teams WHERE id = team_id
    )
  );

CREATE POLICY "team_memberships_update_policy" ON public.team_memberships
  FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT leader_id FROM public.teams WHERE id = team_id
    )
  );

CREATE POLICY "team_memberships_delete_policy" ON public.team_memberships
  FOR DELETE USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT leader_id FROM public.teams WHERE id = team_id
    )
  );

-- =====================================================
-- 3. FIX TEAM INVITATIONS POLICIES
-- =====================================================

-- Drop existing invitation policies
DROP POLICY IF EXISTS "Users can read their invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Team leaders can manage invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Users can manage sent invitations" ON public.team_invitations;

-- Create simplified invitation policies
CREATE POLICY "team_invitations_select_policy" ON public.team_invitations
  FOR SELECT USING (
    auth.uid() = invitee_id OR 
    auth.uid() = inviter_id OR
    auth.uid() IN (
      SELECT leader_id FROM public.teams WHERE id = team_id
    )
  );

CREATE POLICY "team_invitations_insert_policy" ON public.team_invitations
  FOR INSERT WITH CHECK (
    auth.uid() = inviter_id OR
    auth.uid() IN (
      SELECT leader_id FROM public.teams WHERE id = team_id
    )
  );

CREATE POLICY "team_invitations_update_policy" ON public.team_invitations
  FOR UPDATE USING (
    auth.uid() = invitee_id OR 
    auth.uid() = inviter_id OR
    auth.uid() IN (
      SELECT leader_id FROM public.teams WHERE id = team_id
    )
  );

CREATE POLICY "team_invitations_delete_policy" ON public.team_invitations
  FOR DELETE USING (
    auth.uid() = inviter_id OR
    auth.uid() IN (
      SELECT leader_id FROM public.teams WHERE id = team_id
    )
  );

-- =====================================================
-- 4. UPDATE TEAM POLICIES FOR CONSISTENCY
-- =====================================================

-- Drop existing team policies
DROP POLICY IF EXISTS "Anyone can read public teams" ON public.teams;
DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
DROP POLICY IF EXISTS "Team leaders can update teams" ON public.teams;
DROP POLICY IF EXISTS "Team leaders can delete teams" ON public.teams;

-- Create consistent team policies
CREATE POLICY "teams_select_policy" ON public.teams
  FOR SELECT USING (
    is_public = true OR 
    auth.uid() = leader_id OR
    auth.uid() IN (
      SELECT user_id FROM public.team_memberships 
      WHERE team_id = id AND status = 'active'
    )
  );

CREATE POLICY "teams_insert_policy" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "teams_update_policy" ON public.teams
  FOR UPDATE USING (auth.uid() = leader_id);

CREATE POLICY "teams_delete_policy" ON public.teams
  FOR DELETE USING (auth.uid() = leader_id);

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions on the new view
GRANT SELECT ON public.team_overview TO authenticated;
GRANT SELECT ON public.user_teams TO authenticated;

-- Ensure profiles table has proper permissions
GRANT SELECT ON public.profiles TO authenticated;

-- =====================================================
-- 6. CREATE HELPER FUNCTION FOR USER TEAM LOOKUP
-- =====================================================

-- Function to get user's current team
CREATE OR REPLACE FUNCTION public.get_user_team(user_uuid UUID)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  team_description TEXT,
  team_looking_for TEXT[],
  team_max_members INTEGER,
  team_is_public BOOLEAN,
  team_leader_id UUID,
  team_created_at TIMESTAMPTZ,
  member_count BIGINT,
  user_role TEXT,
  user_can_invite BOOLEAN,
  user_can_manage_submissions BOOLEAN,
  is_leader BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.description,
    t.looking_for,
    t.max_members,
    t.is_public,
    t.leader_id,
    t.created_at,
    tv.member_count,
    tm.role,
    tm.can_invite,
    tm.can_manage_submissions,
    (t.leader_id = user_uuid) as is_leader
  FROM public.teams t
  JOIN public.team_memberships tm ON t.id = tm.team_id
  JOIN public.team_overview tv ON t.id = tv.id
  WHERE tm.user_id = user_uuid 
    AND tm.status = 'active'
  LIMIT 1;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_team TO authenticated;

-- =====================================================
-- 7. CREATE SIMPLE TEAM STATS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_team_stats()
RETURNS TABLE (
  total_teams BIGINT,
  recruiting_teams BIGINT,
  total_members BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_teams,
    COUNT(*) FILTER (WHERE member_count < max_members AND is_public = true) as recruiting_teams,
    COALESCE(SUM(member_count), 0) as total_members
  FROM public.team_overview;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_team_stats TO authenticated; 