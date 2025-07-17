-- Fix Team Creation Issues
-- This addresses the duplicate membership constraint and team creation logic

-- =====================================================
-- 1. FIX TEAM MEMBERSHIP TRIGGER
-- =====================================================

-- Drop and recreate the trigger function to handle duplicates
DROP TRIGGER IF EXISTS add_team_creator_membership_trigger ON public.teams;
DROP FUNCTION IF EXISTS public.add_team_creator_membership();

-- Create improved function that handles duplicates
CREATE OR REPLACE FUNCTION public.add_team_creator_membership()
RETURNS TRIGGER AS $$
BEGIN
    -- Add the team creator as the first member with full permissions
    -- Use ON CONFLICT to handle potential duplicates
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
    )
    ON CONFLICT (team_id, user_id) 
    DO UPDATE SET
        role = 'Team Lead',
        status = 'active',
        can_invite = true,
        can_manage_submissions = true,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER add_team_creator_membership_trigger
    AFTER INSERT ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION public.add_team_creator_membership();

-- =====================================================
-- 2. CLEAN UP ANY EXISTING DUPLICATE MEMBERSHIPS
-- =====================================================

-- Remove any potential duplicate memberships that might be causing issues
DELETE FROM public.team_memberships 
WHERE id NOT IN (
    SELECT DISTINCT ON (team_id, user_id) id
    FROM public.team_memberships
    ORDER BY team_id, user_id, updated_at DESC
);

-- =====================================================
-- 3. UPDATE TEAM POLICIES TO BE MORE PERMISSIVE FOR READING
-- =====================================================

-- Update team select policy to allow members to see their teams
DROP POLICY IF EXISTS "teams_select_simple" ON public.teams;

CREATE POLICY "teams_select_improved" ON public.teams FOR SELECT USING (
    is_public = true 
    OR leader_id = auth.uid()
    OR id IN (
        SELECT team_id FROM public.team_memberships 
        WHERE user_id = auth.uid() AND status = 'active'
    )
);

-- =====================================================
-- 4. FIX TEAM MEMBERSHIP POLICIES TO ALLOW LEADERS TO MANAGE
-- =====================================================

-- Update membership policies to allow team leaders to manage memberships
DROP POLICY IF EXISTS "memberships_select_simple" ON public.team_memberships;
DROP POLICY IF EXISTS "memberships_insert_simple" ON public.team_memberships;

CREATE POLICY "memberships_select_improved" ON public.team_memberships FOR SELECT USING (
    user_id = auth.uid()
    OR team_id IN (
        SELECT id FROM public.teams WHERE leader_id = auth.uid()
    )
);

CREATE POLICY "memberships_insert_improved" ON public.team_memberships FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR team_id IN (
        SELECT id FROM public.teams WHERE leader_id = auth.uid()
    )
);

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.add_team_creator_membership() TO authenticated; 