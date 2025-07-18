-- Migration: Add Project Submissions Table
-- For individual project submissions (separate from team submissions)
-- Date: 2024-12-16

-- =====================================================
-- PROJECT SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.project_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- User reference
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic project information
  project_name VARCHAR(200) NOT NULL,
  project_description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  
  -- Solana integration (required)
  solana_integration TEXT NOT NULL,
  
  -- Technology stack (comma-separated string from form)
  tech_stack TEXT[], -- Array of technologies
  
  -- Project URLs
  github_url TEXT NOT NULL,
  demo_url TEXT, -- Optional project showcase URL
  game_host_url TEXT NOT NULL, -- Direct playable game URL
  video_url TEXT NOT NULL, -- Demo video URL
  
  -- Visual assets
  banner_url TEXT NOT NULL, -- Wide banner image for catalogue
  logo_url TEXT NOT NULL, -- Square logo for catalogue
  screenshot_urls TEXT[] NOT NULL DEFAULT '{}', -- Array of screenshot URLs
  
  -- Additional project details
  challenges TEXT, -- Challenges faced and solutions
  features TEXT[] DEFAULT '{}', -- Key features array
  
  -- Team members (for individual submissions, might still have collaborators)
  team_members TEXT[] DEFAULT '{}', -- Array of team member names/usernames
  
  -- Submission metadata
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'featured')),
  is_final BOOLEAN DEFAULT false,
  
  -- Hackathon edition
  hackathon_edition VARCHAR(10) DEFAULT '2025',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Users can view all submitted projects (for catalogue)
CREATE POLICY "Public can view submitted projects" ON public.project_submissions
  FOR SELECT USING (status IN ('submitted', 'approved', 'featured'));

-- Users can view their own projects regardless of status
CREATE POLICY "Users can view own projects" ON public.project_submissions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own projects
CREATE POLICY "Users can create projects" ON public.project_submissions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects (only if not final)
CREATE POLICY "Users can update own projects" ON public.project_submissions
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own projects (only drafts)
CREATE POLICY "Users can delete own draft projects" ON public.project_submissions
  FOR DELETE TO authenticated 
  USING (auth.uid() = user_id AND status = 'draft');

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_project_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_project_submissions_updated_at 
  BEFORE UPDATE ON public.project_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_project_updated_at();

-- Function to set submitted_at when status changes to submitted
CREATE OR REPLACE FUNCTION public.handle_project_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Set submitted_at when status changes to submitted for the first time
  IF NEW.status = 'submitted' AND OLD.status != 'submitted' AND NEW.submitted_at IS NULL THEN
    NEW.submitted_at = NOW();
    NEW.is_final = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for submission handling
CREATE TRIGGER handle_project_submission_trigger
  BEFORE UPDATE ON public.project_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_project_submission();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for user projects
CREATE INDEX IF NOT EXISTS idx_project_submissions_user_id ON public.project_submissions(user_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_project_submissions_status ON public.project_submissions(status);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_project_submissions_category ON public.project_submissions(category);

-- Index for hackathon edition
CREATE INDEX IF NOT EXISTS idx_project_submissions_hackathon ON public.project_submissions(hackathon_edition);

-- Index for tech stack search (GIN for array operations)
CREATE INDEX IF NOT EXISTS idx_project_submissions_tech_stack ON public.project_submissions USING GIN(tech_stack);

-- Index for submission date ordering
CREATE INDEX IF NOT EXISTS idx_project_submissions_submitted_at ON public.project_submissions(submitted_at DESC) WHERE submitted_at IS NOT NULL;

-- =====================================================
-- USEFUL VIEWS
-- =====================================================

-- View for public project catalogue
CREATE OR REPLACE VIEW public.project_catalogue AS
SELECT 
  ps.id,
  ps.project_name,
  ps.project_description,
  ps.category,
  ps.banner_url,
  ps.logo_url,
  ps.game_host_url,
  ps.demo_url,
  ps.video_url,
  ps.tech_stack,
  ps.features,
  ps.status,
  ps.submitted_at,
  p.full_name AS creator_name,
  p.username AS creator_username,
  p.avatar_url AS creator_avatar
FROM public.project_submissions ps
JOIN public.profiles p ON ps.user_id = p.id
WHERE ps.status IN ('submitted', 'approved', 'featured')
ORDER BY ps.submitted_at DESC;

-- View for user's project dashboard
CREATE OR REPLACE VIEW public.user_projects AS
SELECT 
  ps.*,
  p.full_name,
  p.username,
  p.avatar_url
FROM public.project_submissions ps
JOIN public.profiles p ON ps.user_id = p.id;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to search projects by technology
CREATE OR REPLACE FUNCTION public.search_projects_by_tech(search_technologies TEXT[])
RETURNS TABLE (
  project_id UUID,
  project_name VARCHAR(200),
  project_description TEXT,
  category VARCHAR(100),
  banner_url TEXT,
  logo_url TEXT,
  game_host_url TEXT,
  tech_stack TEXT[],
  creator_name TEXT,
  tech_match_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.project_name,
    ps.project_description,
    ps.category,
    ps.banner_url,
    ps.logo_url,
    ps.game_host_url,
    ps.tech_stack,
    p.full_name,
    (
      SELECT COUNT(*)::INTEGER 
      FROM unnest(ps.tech_stack) AS tech 
      WHERE tech = ANY(search_technologies)
    ) AS tech_match_count
  FROM public.project_submissions ps
  JOIN public.profiles p ON ps.user_id = p.id
  WHERE ps.status IN ('submitted', 'approved', 'featured')
    AND ps.tech_stack && search_technologies  -- Array overlap operator
  ORDER BY tech_match_count DESC, ps.submitted_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get featured projects
CREATE OR REPLACE FUNCTION public.get_featured_projects(limit_count INTEGER DEFAULT 6)
RETURNS TABLE (
  project_id UUID,
  project_name VARCHAR(200),
  project_description TEXT,
  category VARCHAR(100),
  banner_url TEXT,
  logo_url TEXT,
  game_host_url TEXT,
  video_url TEXT,
  tech_stack TEXT[],
  creator_name TEXT,
  creator_username TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.project_name,
    ps.project_description,
    ps.category,
    ps.banner_url,
    ps.logo_url,
    ps.game_host_url,
    ps.video_url,
    ps.tech_stack,
    p.full_name,
    p.username,
    ps.submitted_at
  FROM public.project_submissions ps
  JOIN public.profiles p ON ps.user_id = p.id
  WHERE ps.status = 'featured'
  ORDER BY ps.submitted_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get projects by category
CREATE OR REPLACE FUNCTION public.get_projects_by_category(project_category VARCHAR(100))
RETURNS TABLE (
  project_id UUID,
  project_name VARCHAR(200),
  project_description TEXT,
  banner_url TEXT,
  logo_url TEXT,
  game_host_url TEXT,
  tech_stack TEXT[],
  creator_name TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.project_name,
    ps.project_description,
    ps.banner_url,
    ps.logo_url,
    ps.game_host_url,
    ps.tech_stack,
    p.full_name,
    ps.submitted_at
  FROM public.project_submissions ps
  JOIN public.profiles p ON ps.user_id = p.id
  WHERE ps.category = project_category
    AND ps.status IN ('submitted', 'approved', 'featured')
  ORDER BY ps.submitted_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANTS
-- =====================================================

-- Grant permissions to authenticated users
GRANT ALL ON public.project_submissions TO authenticated;
GRANT SELECT ON public.project_catalogue TO authenticated;
GRANT SELECT ON public.project_catalogue TO anon; -- Allow public access to catalogue
GRANT SELECT ON public.user_projects TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.search_projects_by_tech TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_projects_by_tech TO anon;
GRANT EXECUTE ON FUNCTION public.get_featured_projects TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_featured_projects TO anon;
GRANT EXECUTE ON FUNCTION public.get_projects_by_category TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_projects_by_category TO anon;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.project_submissions IS 'Individual project submissions for Solana Game Jam with catalogue-ready assets';
COMMENT ON COLUMN public.project_submissions.tech_stack IS 'Array of technologies used in the project (parsed from comma-separated input)';
COMMENT ON COLUMN public.project_submissions.banner_url IS 'Wide banner image URL for project catalogue display (16:9 ratio recommended)';
COMMENT ON COLUMN public.project_submissions.logo_url IS 'Square logo image URL for project catalogue display (512x512 recommended)';
COMMENT ON COLUMN public.project_submissions.game_host_url IS 'Direct URL to playable game (must work in browser)';
COMMENT ON COLUMN public.project_submissions.screenshot_urls IS 'Array of screenshot image URLs for project showcase';
COMMENT ON VIEW public.project_catalogue IS 'Public view of all submitted projects for the game catalogue';
COMMENT ON FUNCTION public.search_projects_by_tech IS 'Search projects by technology stack with relevance ranking';
COMMENT ON FUNCTION public.get_featured_projects IS 'Get featured projects for homepage/catalogue highlights';
COMMENT ON FUNCTION public.get_projects_by_category IS 'Get all projects in a specific category'; 