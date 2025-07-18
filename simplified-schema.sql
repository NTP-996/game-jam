-- Simplified Game Jam Schema
-- Eliminates redundancy and focuses on core functionality
-- Date: 2024-12-16

-- =====================================================
-- PROFILES TABLE (Simplified)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  email TEXT,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  
  -- Contact (only what's needed)
  github_url TEXT,
  discord_username TEXT,
  twitter_url TEXT,
  
  -- Game jam specific
  skills TEXT[], -- Simple array instead of multiple arrays
  looking_for_team BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROJECTS TABLE (Unified - handles both individual and team projects)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Ownership
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_team_project BOOLEAN DEFAULT false,
  team_name TEXT, -- Simple team name, no complex team management
  team_members TEXT[], -- Array of member names/usernames
  
  -- Project details
  project_name VARCHAR(200) NOT NULL,
  project_description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  
  -- Technical details
  solana_integration TEXT NOT NULL,
  tech_stack TEXT[],
  
  -- Links
  github_url TEXT NOT NULL,
  demo_url TEXT,
  game_host_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  
  -- Images (stored in Supabase storage)
  banner_url TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  screenshot_urls TEXT[] NOT NULL DEFAULT '{}',
  
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
-- STORAGE BUCKETS (Keep these - they're good)
-- =====================================================
-- These are handled by the storage SQL file we already created

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_looking_for_team ON public.profiles(looking_for_team);

CREATE INDEX IF NOT EXISTS idx_projects_creator_id ON public.projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_is_team_project ON public.projects(is_team_project);
CREATE INDEX IF NOT EXISTS idx_projects_tech_stack ON public.projects USING GIN(tech_stack);
CREATE INDEX IF NOT EXISTS idx_projects_submitted_at ON public.projects(submitted_at DESC) WHERE submitted_at IS NOT NULL;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Public can view submitted projects" ON public.projects
  FOR SELECT USING (status IN ('submitted', 'approved', 'featured'));

CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Users can manage own projects" ON public.projects
  FOR ALL USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-set submitted_at when status changes to submitted
CREATE OR REPLACE FUNCTION public.handle_project_submission()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'submitted' AND OLD.status != 'submitted' AND NEW.submitted_at IS NULL THEN
    NEW.submitted_at = NOW();
    NEW.is_final = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_project_submission_trigger
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_project_submission();

-- =====================================================
-- DROP EXISTING VIEWS (to avoid column conflicts)
-- =====================================================
DROP VIEW IF EXISTS public.project_catalogue CASCADE;
DROP VIEW IF EXISTS public.user_projects CASCADE;

-- =====================================================
-- VIEWS FOR CONVENIENCE
-- =====================================================

-- Public project catalogue (with creator info)
CREATE OR REPLACE VIEW public.project_catalogue AS
SELECT 
  p.id,
  p.project_name,
  p.project_description,
  p.category,
  p.is_team_project,
  p.team_name,
  p.team_members,
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
  pr.avatar_url AS creator_avatar
FROM public.projects p
JOIN public.profiles pr ON p.creator_id = pr.id
WHERE p.status IN ('submitted', 'approved', 'featured')
ORDER BY p.submitted_at DESC;

-- User's projects view
CREATE OR REPLACE VIEW public.user_projects AS
SELECT 
  p.*,
  pr.full_name,
  pr.username,
  pr.avatar_url
FROM public.projects p
JOIN public.profiles pr ON p.creator_id = pr.id;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Search projects by technology
CREATE OR REPLACE FUNCTION public.search_projects_by_tech(search_technologies TEXT[])
RETURNS TABLE (
  project_id UUID,
  project_name VARCHAR(200),
  description TEXT,
  category VARCHAR(100),
  banner_url TEXT,
  logo_url TEXT,
  game_host_url TEXT,
  tech_stack TEXT[],
  creator_name TEXT,
  is_team_project BOOLEAN,
  team_name TEXT,
  tech_match_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.project_name,
    p.description,
    p.category,
    p.banner_url,
    p.logo_url,
    p.game_host_url,
    p.tech_stack,
    pr.full_name,
    p.is_team_project,
    p.team_name,
    (
      SELECT COUNT(*)::INTEGER 
      FROM unnest(p.tech_stack) AS tech 
      WHERE tech = ANY(search_technologies)
    ) AS tech_match_count
  FROM public.projects p
  JOIN public.profiles pr ON p.creator_id = pr.id
  WHERE p.status IN ('submitted', 'approved', 'featured')
    AND p.tech_stack && search_technologies
  ORDER BY tech_match_count DESC, p.submitted_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get featured projects
CREATE OR REPLACE FUNCTION public.get_featured_projects(limit_count INTEGER DEFAULT 6)
RETURNS SETOF public.project_catalogue AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.project_catalogue
  WHERE status = 'featured'
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANTS
-- =====================================================
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.projects TO authenticated;
GRANT SELECT ON public.project_catalogue TO authenticated, anon;
GRANT SELECT ON public.user_projects TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_projects_by_tech TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_featured_projects TO authenticated, anon;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE public.profiles IS 'Simplified user profiles for game jam participants';
COMMENT ON TABLE public.projects IS 'Unified table for both individual and team project submissions';
COMMENT ON COLUMN public.projects.is_team_project IS 'Whether this is a team project or individual project';
COMMENT ON COLUMN public.projects.team_name IS 'Simple team name for team projects';
COMMENT ON COLUMN public.projects.team_members IS 'Array of team member names for team projects';
COMMENT ON VIEW public.project_catalogue IS 'Public view of all submitted projects for the game catalogue'; 