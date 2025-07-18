-- COMPLETE FRESH START - Solana Game Jam 2025
-- This completely resets everything and creates ONLY what we need
-- Includes all profile fields the UI expects from the start
-- Date: 2024-12-16

-- =====================================================
-- COMPLETE RESET - DROP EVERYTHING
-- =====================================================

-- Drop all views first (they depend on tables)
DROP VIEW IF EXISTS public.project_catalogue CASCADE;
DROP VIEW IF EXISTS public.user_projects CASCADE;
DROP VIEW IF EXISTS public.team_overview CASCADE;
DROP VIEW IF EXISTS public.user_teams CASCADE;
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.search_projects_by_tech(text[]) CASCADE;
DROP FUNCTION IF EXISTS public.get_project_recommendations(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.accept_team_invitation(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.add_team_leader_as_member() CASCADE;
DROP FUNCTION IF EXISTS public.add_team_creator_membership() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_project_submission() CASCADE;
DROP FUNCTION IF EXISTS public.get_project_banner_url(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.get_project_logo_url(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.get_project_screenshot_url(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_project_images() CASCADE;

-- Drop all tables in dependency order
DROP TABLE IF EXISTS public.team_invitations CASCADE;
DROP TABLE IF EXISTS public.team_memberships CASCADE;
DROP TABLE IF EXISTS public.team_submissions CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.project_submissions CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop storage buckets
DELETE FROM storage.buckets WHERE id IN ('game-banners', 'game-logos', 'game-screenshots');

-- =====================================================
-- PROFILES TABLE (with ALL fields the UI expects)
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  email TEXT,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  
  -- Contact & Social
  github_url TEXT,
  twitter_url TEXT,
  discord_username TEXT,
  telegram_username TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  
  -- Personal Details
  location TEXT,
  timezone TEXT DEFAULT 'UTC+8',
  birth_date TEXT,
  phone TEXT,
  
  -- Professional Info
  job_title TEXT,
  company TEXT,
  experience_level TEXT,
  education TEXT,
  
  -- Hackathon Specific
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  programming_languages TEXT[] DEFAULT '{}',
  frameworks TEXT[] DEFAULT '{}',
  previous_hackathons INTEGER DEFAULT 0,
  preferred_role TEXT,
  availability TEXT,
  looking_for_team BOOLEAN DEFAULT false,
  
  -- Gaming
  favorite_games TEXT[] DEFAULT '{}',
  game_dev_experience TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TEAMS TABLE
-- =====================================================
CREATE TABLE public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  
  -- Team settings
  max_members INTEGER DEFAULT 5 CHECK (max_members >= 1 AND max_members <= 10),
  is_public BOOLEAN DEFAULT true,
  is_recruiting BOOLEAN DEFAULT true,
  
  -- Team metadata
  looking_for TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
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
CREATE TABLE public.team_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Member role and status
  role VARCHAR(100) DEFAULT 'Member',
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
CREATE TABLE public.team_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Invitation details
  role VARCHAR(100) DEFAULT 'Member',
  message TEXT,
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Unique constraint: one pending invitation per user per team
  UNIQUE(team_id, invitee_id) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- PROJECTS TABLE (Unified for individual and team projects)
-- =====================================================
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Ownership
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  
  -- Project details
  project_name VARCHAR(200) NOT NULL,
  project_description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  
  -- Technical details
  solana_integration TEXT NOT NULL,
  tech_stack TEXT[] DEFAULT '{}',
  
  -- Links
  github_url TEXT NOT NULL,
  demo_url TEXT,
  game_host_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  
  -- Images (stored in Supabase storage)
  banner_url TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  screenshot_urls TEXT[] DEFAULT '{}',
  
  -- Optional details
  challenges TEXT,
  features TEXT[] DEFAULT '{}',
  
  -- Status management
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'featured', 'rejected')),
  is_final BOOLEAN DEFAULT false,
  
  -- Metadata
  hackathon_edition VARCHAR(10) DEFAULT '2025',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Game banners bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-banners',
  'game-banners',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Game logos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-logos',
  'game-logos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Game screenshots bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-screenshots',
  'game-screenshots',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_looking_for_team ON public.profiles(looking_for_team);
CREATE INDEX idx_profiles_skills ON public.profiles USING GIN(skills);
CREATE INDEX idx_profiles_interests ON public.profiles USING GIN(interests);
CREATE INDEX idx_profiles_programming_languages ON public.profiles USING GIN(programming_languages);
CREATE INDEX idx_profiles_frameworks ON public.profiles USING GIN(frameworks);
CREATE INDEX idx_profiles_favorite_games ON public.profiles USING GIN(favorite_games);
CREATE INDEX idx_profiles_location ON public.profiles(location);
CREATE INDEX idx_profiles_experience_level ON public.profiles(experience_level);
CREATE INDEX idx_profiles_preferred_role ON public.profiles(preferred_role);

CREATE INDEX idx_teams_leader_id ON public.teams(leader_id);
CREATE INDEX idx_teams_is_recruiting ON public.teams(is_recruiting);
CREATE INDEX idx_teams_created_at ON public.teams(created_at DESC);

CREATE INDEX idx_team_memberships_team_id ON public.team_memberships(team_id);
CREATE INDEX idx_team_memberships_user_id ON public.team_memberships(user_id);
CREATE INDEX idx_team_memberships_status ON public.team_memberships(status);

CREATE INDEX idx_team_invitations_invitee_id ON public.team_invitations(invitee_id);
CREATE INDEX idx_team_invitations_team_id ON public.team_invitations(team_id);
CREATE INDEX idx_team_invitations_status ON public.team_invitations(status);

CREATE INDEX idx_projects_creator_id ON public.projects(creator_id);
CREATE INDEX idx_projects_team_id ON public.projects(team_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_category ON public.projects(category);
CREATE INDEX idx_projects_tech_stack ON public.projects USING GIN(tech_stack);
CREATE INDEX idx_projects_submitted_at ON public.projects(submitted_at DESC) WHERE submitted_at IS NOT NULL;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- TEAMS POLICIES
CREATE POLICY "Public teams are viewable by everyone" ON public.teams
  FOR SELECT USING (is_public = true OR leader_id = auth.uid());

CREATE POLICY "Users can create teams" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Team leaders can manage teams" ON public.teams
  FOR ALL USING (auth.uid() = leader_id);

-- TEAM MEMBERSHIPS POLICIES
CREATE POLICY "Users can view team memberships" ON public.team_memberships
  FOR SELECT USING (auth.uid() = user_id OR team_id IN (
    SELECT id FROM public.teams WHERE leader_id = auth.uid()
  ));

CREATE POLICY "Team leaders can manage memberships" ON public.team_memberships
  FOR ALL USING (team_id IN (
    SELECT id FROM public.teams WHERE leader_id = auth.uid()
  ));

CREATE POLICY "Users can manage own membership" ON public.team_memberships
  FOR UPDATE USING (auth.uid() = user_id);

-- TEAM INVITATIONS POLICIES
CREATE POLICY "Users can view relevant invitations" ON public.team_invitations
  FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "Team leaders can send invitations" ON public.team_invitations
  FOR INSERT WITH CHECK (auth.uid() = inviter_id AND team_id IN (
    SELECT id FROM public.teams WHERE leader_id = auth.uid()
  ));

CREATE POLICY "Users can respond to invitations" ON public.team_invitations
  FOR UPDATE USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

-- PROJECTS POLICIES
CREATE POLICY "Public can view submitted projects" ON public.projects
  FOR SELECT USING (status IN ('submitted', 'approved', 'featured'));

CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Team members can view team projects" ON public.projects
  FOR SELECT USING (team_id IS NOT NULL AND team_id IN (
    SELECT team_id FROM public.team_memberships WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can manage own projects" ON public.projects
  FOR ALL USING (auth.uid() = creator_id);

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Game banners
CREATE POLICY "Users can upload their own banners" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'game-banners' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view all banners" ON storage.objects
  FOR SELECT USING (bucket_id = 'game-banners');

CREATE POLICY "Users can update their own banners" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'game-banners' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own banners" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'game-banners' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Game logos (same pattern)
CREATE POLICY "Users can upload their own logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'game-logos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view all logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'game-logos');

CREATE POLICY "Users can update their own logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'game-logos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'game-logos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Game screenshots (same pattern)
CREATE POLICY "Users can upload their own screenshots" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'game-screenshots' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view all screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'game-screenshots');

CREATE POLICY "Users can update their own screenshots" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'game-screenshots' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own screenshots" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'game-screenshots' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- TRIGGERS AND FUNCTIONS
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
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_memberships_updated_at BEFORE UPDATE ON public.team_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically add team leader as member
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

-- Function to accept team invitation
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
-- ESSENTIAL VIEWS ONLY
-- =====================================================

-- Team overview with member count
CREATE VIEW public.team_overview AS
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

-- Project catalogue for public viewing
CREATE VIEW public.project_catalogue AS
SELECT 
  p.id,
  p.project_name,
  p.project_description,
  p.category,
  p.banner_url,
  p.logo_url,
  p.game_host_url,
  p.demo_url,
  p.video_url,
  p.tech_stack,
  p.features,
  p.status,
  p.submitted_at,
  pr.full_name AS creator_name,
  pr.username AS creator_username,
  pr.avatar_url AS creator_avatar,
  CASE 
    WHEN p.team_id IS NOT NULL THEN t.name
    ELSE NULL
  END AS team_name
FROM public.projects p
JOIN public.profiles pr ON p.creator_id = pr.id
LEFT JOIN public.teams t ON p.team_id = t.id
WHERE p.status IN ('submitted', 'approved', 'featured')
ORDER BY p.submitted_at DESC;

-- =====================================================
-- GRANTS
-- =====================================================
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.teams TO authenticated;
GRANT ALL ON public.team_memberships TO authenticated;
GRANT ALL ON public.team_invitations TO authenticated;
GRANT ALL ON public.projects TO authenticated;

GRANT SELECT ON public.team_overview TO authenticated;
GRANT SELECT ON public.project_catalogue TO authenticated;

-- =====================================================
-- DONE!
-- =====================================================
-- Clean database with:
-- 1. Profiles table with ALL UI fields from the start
-- 2. Teams with full invitation system
-- 3. Projects for individuals and teams
-- 4. Essential views only
-- 5. Proper security and indexes 