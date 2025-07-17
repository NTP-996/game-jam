-- Team System Database Schema for Solana Game Jam 2025
-- This includes teams, memberships, invitations, and submissions

-- =====================================================
-- TEAMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  
  -- Team settings
  max_members INTEGER DEFAULT 5 CHECK (max_members >= 1 AND max_members <= 10),
  is_public BOOLEAN DEFAULT true,
  is_recruiting BOOLEAN DEFAULT true,
  
  -- Team metadata
  looking_for TEXT[], -- Array of roles/skills they're looking for
  tags TEXT[], -- Array of tags (e.g., 'DeFi', 'Gaming', 'NFT')
  project_idea TEXT,
  
  -- Team leader
  leader_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Social links
  github_url TEXT,
  discord_server TEXT,
  website_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TEAM MEMBERSHIPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.team_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Member role and status
  role VARCHAR(100), -- e.g., 'Frontend Developer', 'Game Designer'
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'left')),
  
  -- Permissions
  can_invite BOOLEAN DEFAULT false,
  can_manage_submissions BOOLEAN DEFAULT false,
  
  -- Timestamps
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one membership per user per team
  UNIQUE(team_id, user_id)
);

-- =====================================================
-- TEAM INVITATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Invitation details
  role VARCHAR(100), -- Proposed role for the invitee
  message TEXT, -- Personal invitation message
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Unique constraint: one pending invitation per user per team
  UNIQUE(team_id, invitee_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- TEAM SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.team_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Project details
  project_name VARCHAR(200) NOT NULL,
  project_description TEXT NOT NULL,
  
  -- Game/Project links
  github_repo_url TEXT,
  demo_url TEXT,
  video_url TEXT,
  presentation_url TEXT,
  
  -- Game files
  game_build_files TEXT[], -- Array of file URLs
  screenshots TEXT[], -- Array of screenshot URLs
  
  -- Categories and tags
  category VARCHAR(100), -- e.g., 'DeFi Game', 'NFT Marketplace', 'GameFi'
  tags TEXT[], -- e.g., ['Solana', 'Unity', 'Web3']
  
  -- Solana integration (required for hackathon)
  solana_program_id TEXT, -- On-chain program address
  solana_features TEXT[], -- Features using Solana (e.g., 'NFTs', 'Tokens', 'DeFi')
  
  -- Submission status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  is_final BOOLEAN DEFAULT false,
  
  -- Hackathon specific
  hackathon_edition VARCHAR(10) DEFAULT '2025',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_submissions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR TEAMS
-- =====================================================

-- Public teams are viewable by everyone
CREATE POLICY "Public teams are viewable by everyone" ON public.teams
  FOR SELECT USING (is_public = true OR auth.uid() IN (
    SELECT user_id FROM public.team_memberships 
    WHERE team_id = teams.id AND status = 'active'
  ));

-- Users can create teams
CREATE POLICY "Users can create teams" ON public.teams
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = leader_id);

-- Team leaders and members can update team info
CREATE POLICY "Team leaders can update teams" ON public.teams
  FOR UPDATE TO authenticated USING (auth.uid() = leader_id);

-- Team leaders can delete teams
CREATE POLICY "Team leaders can delete teams" ON public.teams
  FOR DELETE TO authenticated USING (auth.uid() = leader_id);

-- =====================================================
-- RLS POLICIES FOR TEAM MEMBERSHIPS
-- =====================================================

-- Users can view memberships of teams they're in or public teams
CREATE POLICY "Users can view team memberships" ON public.team_memberships
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT user_id FROM public.team_memberships tm WHERE tm.team_id = team_memberships.team_id) OR
    team_id IN (SELECT id FROM public.teams WHERE is_public = true)
  );

-- Team leaders can manage memberships
CREATE POLICY "Team leaders can manage memberships" ON public.team_memberships
  FOR ALL TO authenticated USING (
    team_id IN (SELECT id FROM public.teams WHERE leader_id = auth.uid())
  );

-- Users can leave teams (update their own membership)
CREATE POLICY "Users can update their own membership" ON public.team_memberships
  FOR UPDATE TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES FOR TEAM INVITATIONS
-- =====================================================

-- Users can view invitations they sent or received
CREATE POLICY "Users can view relevant invitations" ON public.team_invitations
  FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

-- Team members with invite permissions can create invitations
CREATE POLICY "Authorized users can send invitations" ON public.team_invitations
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = inviter_id AND (
      -- Team leader can always invite
      team_id IN (SELECT id FROM public.teams WHERE leader_id = auth.uid()) OR
      -- Or user has invite permissions
      auth.uid() IN (
        SELECT user_id FROM public.team_memberships 
        WHERE team_id = team_invitations.team_id AND can_invite = true AND status = 'active'
      )
    )
  );

-- Inviters can cancel invitations, invitees can accept/decline
CREATE POLICY "Users can respond to invitations" ON public.team_invitations
  FOR UPDATE TO authenticated USING (
    auth.uid() = inviter_id OR auth.uid() = invitee_id
  );

-- =====================================================
-- RLS POLICIES FOR TEAM SUBMISSIONS
-- =====================================================

-- Team members can view their team's submissions
CREATE POLICY "Team members can view submissions" ON public.team_submissions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_memberships 
      WHERE team_id = team_submissions.team_id AND status = 'active'
    )
  );

-- Team members with submission permissions can create/update submissions
CREATE POLICY "Authorized team members can manage submissions" ON public.team_submissions
  FOR ALL TO authenticated USING (
    team_id IN (SELECT id FROM public.teams WHERE leader_id = auth.uid()) OR
    auth.uid() IN (
      SELECT user_id FROM public.team_memberships 
      WHERE team_id = team_submissions.team_id AND can_manage_submissions = true AND status = 'active'
    )
  );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_memberships_updated_at BEFORE UPDATE ON public.team_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_submissions_updated_at BEFORE UPDATE ON public.team_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically add team leader as member when team is created
CREATE OR REPLACE FUNCTION public.add_team_leader_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.team_memberships (team_id, user_id, role, can_invite, can_manage_submissions)
  VALUES (NEW.id, NEW.leader_id, 'Team Leader', true, true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER add_leader_membership AFTER INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.add_team_leader_as_member();

-- Function to handle invitation acceptance
CREATE OR REPLACE FUNCTION public.accept_team_invitation(invitation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  invitation_record public.team_invitations%ROWTYPE;
  team_member_count INTEGER;
  team_max_members INTEGER;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation_record
  FROM public.team_invitations
  WHERE id = invitation_id AND invitee_id = auth.uid() AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if team has space
  SELECT COUNT(*), MAX(t.max_members)
  INTO team_member_count, team_max_members
  FROM public.team_memberships tm
  JOIN public.teams t ON t.id = tm.team_id
  WHERE tm.team_id = invitation_record.team_id AND tm.status = 'active'
  GROUP BY t.max_members;
  
  IF team_member_count >= team_max_members THEN
    RETURN FALSE;
  END IF;
  
  -- Accept invitation
  UPDATE public.team_invitations 
  SET status = 'accepted', responded_at = NOW()
  WHERE id = invitation_id;
  
  -- Add user to team
  INSERT INTO public.team_memberships (team_id, user_id, role)
  VALUES (invitation_record.team_id, invitation_record.invitee_id, invitation_record.role);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USEFUL VIEWS
-- =====================================================

-- View for team details with member count
CREATE OR REPLACE VIEW public.team_overview AS
SELECT 
  t.*,
  COUNT(tm.user_id) FILTER (WHERE tm.status = 'active') AS member_count,
  ARRAY_AGG(
    JSON_BUILD_OBJECT(
      'user_id', tm.user_id,
      'role', tm.role,
      'can_invite', tm.can_invite,
      'can_manage_submissions', tm.can_manage_submissions,
      'joined_at', tm.joined_at
    ) ORDER BY tm.joined_at
  ) FILTER (WHERE tm.status = 'active') AS members
FROM public.teams t
LEFT JOIN public.team_memberships tm ON t.id = tm.team_id AND tm.status = 'active'
GROUP BY t.id;

-- View for user's team information
CREATE OR REPLACE VIEW public.user_teams AS
SELECT 
  t.*,
  tm.role,
  tm.can_invite,
  tm.can_manage_submissions,
  tm.joined_at,
  (t.leader_id = tm.user_id) AS is_leader
FROM public.teams t
JOIN public.team_memberships tm ON t.id = tm.team_id
WHERE tm.status = 'active';

-- Grant necessary permissions
GRANT ALL ON public.teams TO authenticated;
GRANT ALL ON public.team_memberships TO authenticated;
GRANT ALL ON public.team_invitations TO authenticated;
GRANT ALL ON public.team_submissions TO authenticated;
GRANT SELECT ON public.team_overview TO authenticated;
GRANT SELECT ON public.user_teams TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_team_invitation TO authenticated; 