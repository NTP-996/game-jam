-- EMERGENCY RLS POLICY FIX
-- This completely removes all problematic policies and creates simple, non-recursive ones

-- =====================================================
-- 1. DISABLE RLS AND DROP ALL POLICIES
-- =====================================================

-- Disable RLS temporarily to avoid recursion issues
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "teams_select_policy" ON public.teams;
DROP POLICY IF EXISTS "teams_insert_policy" ON public.teams;
DROP POLICY IF EXISTS "teams_update_policy" ON public.teams;
DROP POLICY IF EXISTS "teams_delete_policy" ON public.teams;

DROP POLICY IF EXISTS "team_memberships_select_policy" ON public.team_memberships;
DROP POLICY IF EXISTS "team_memberships_insert_policy" ON public.team_memberships;
DROP POLICY IF EXISTS "team_memberships_update_policy" ON public.team_memberships;
DROP POLICY IF EXISTS "team_memberships_delete_policy" ON public.team_memberships;

DROP POLICY IF EXISTS "team_invitations_select_policy" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_insert_policy" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_update_policy" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_delete_policy" ON public.team_invitations;

-- Drop any other policies that might exist
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename IN ('teams', 'team_memberships', 'team_invitations')
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, 
            CASE 
                WHEN pol.policyname LIKE '%team_membership%' THEN 'team_memberships'
                WHEN pol.policyname LIKE '%team_invitation%' THEN 'team_invitations'
                ELSE 'teams'
            END);
    END LOOP;
END $$;

-- =====================================================
-- 2. CREATE SIMPLE, NON-RECURSIVE POLICIES
-- =====================================================

-- TEAMS POLICIES - Simple and direct
CREATE POLICY "teams_select_simple" ON public.teams FOR SELECT USING (
    is_public = true OR leader_id = auth.uid()
);

CREATE POLICY "teams_insert_simple" ON public.teams FOR INSERT WITH CHECK (
    leader_id = auth.uid()
);

CREATE POLICY "teams_update_simple" ON public.teams FOR UPDATE USING (
    leader_id = auth.uid()
);

CREATE POLICY "teams_delete_simple" ON public.teams FOR DELETE USING (
    leader_id = auth.uid()
);

-- TEAM MEMBERSHIPS POLICIES - Very simple
CREATE POLICY "memberships_select_simple" ON public.team_memberships FOR SELECT USING (
    user_id = auth.uid()
);

CREATE POLICY "memberships_insert_simple" ON public.team_memberships FOR INSERT WITH CHECK (
    user_id = auth.uid()
);

CREATE POLICY "memberships_update_simple" ON public.team_memberships FOR UPDATE USING (
    user_id = auth.uid()
);

CREATE POLICY "memberships_delete_simple" ON public.team_memberships FOR DELETE USING (
    user_id = auth.uid()
);

-- TEAM INVITATIONS POLICIES - Simple
CREATE POLICY "invitations_select_simple" ON public.team_invitations FOR SELECT USING (
    invitee_id = auth.uid() OR inviter_id = auth.uid()
);

CREATE POLICY "invitations_insert_simple" ON public.team_invitations FOR INSERT WITH CHECK (
    inviter_id = auth.uid()
);

CREATE POLICY "invitations_update_simple" ON public.team_invitations FOR UPDATE USING (
    invitee_id = auth.uid() OR inviter_id = auth.uid()
);

CREATE POLICY "invitations_delete_simple" ON public.team_invitations FOR DELETE USING (
    inviter_id = auth.uid()
);

-- =====================================================
-- 3. RE-ENABLE RLS
-- =====================================================

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. GRANT BASIC PERMISSIONS
-- =====================================================

GRANT ALL ON public.teams TO authenticated;
GRANT ALL ON public.team_memberships TO authenticated;
GRANT ALL ON public.team_invitations TO authenticated;
GRANT ALL ON public.team_submissions TO authenticated;

-- =====================================================
-- 5. CREATE TRIGGER FOR AUTO TEAM MEMBERSHIP
-- =====================================================

-- Function to automatically add team creator as member
CREATE OR REPLACE FUNCTION public.add_team_creator_membership()
RETURNS TRIGGER AS $$
BEGIN
    -- Add the team creator as the first member with full permissions
    INSERT INTO public.team_memberships (
        team_id,
        user_id,
        role,
        status,
        can_invite,
        can_manage_submissions
    ) VALUES (
        NEW.id,
        NEW.leader_id,
        'Team Lead',
        'active',
        true,
        true
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS add_team_creator_membership_trigger ON public.teams;

-- Create trigger
CREATE TRIGGER add_team_creator_membership_trigger
    AFTER INSERT ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION public.add_team_creator_membership();

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.add_team_creator_membership() TO authenticated; 