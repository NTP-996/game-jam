-- Enhanced Profiles Table for Solana Game Jam
-- This schema includes all fields from the comprehensive profile page

-- Drop existing profiles table if it exists (use with caution in production)
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create enhanced profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Basic Profile Info
  email TEXT,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  
  -- Contact & Social Links
  github_url TEXT,
  twitter_url TEXT,
  discord_username TEXT,
  telegram_username TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  
  -- Personal Details
  location TEXT,
  timezone TEXT DEFAULT 'UTC+8',
  birth_date DATE,
  phone TEXT,
  
  -- Professional Information
  job_title TEXT,
  company TEXT,
  experience_level TEXT CHECK (experience_level IN (
    'Beginner (0-1 years)',
    'Intermediate (2-4 years)', 
    'Advanced (5-7 years)',
    'Expert (8+ years)'
  )),
  education TEXT,
  
  -- Hackathon Specific Fields
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  programming_languages TEXT[] DEFAULT '{}',
  frameworks TEXT[] DEFAULT '{}',
  previous_hackathons INTEGER DEFAULT 0,
  preferred_role TEXT CHECK (preferred_role IN (
    'Full-Stack Developer',
    'Frontend Developer', 
    'Backend Developer',
    'Game Developer',
    'UI/UX Designer',
    'Product Manager',
    'Blockchain Developer',
    'Data Scientist',
    'DevOps Engineer',
    'Mobile Developer'
  )),
  availability TEXT CHECK (availability IN (
    'Full-time (40+ hours/week)',
    'Part-time (20-40 hours/week)', 
    'Weekends only',
    'Limited (< 20 hours/week)'
  )),
  looking_for_team BOOLEAN DEFAULT false,
  
  -- Gaming & Game Development
  favorite_games TEXT[] DEFAULT '{}',
  game_dev_experience TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Allow users to view all profiles (for team discovery)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS on_auth_user_updated ON public.profiles;
CREATE TRIGGER on_auth_user_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    username,
    avatar_url
  )
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

-- Create trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_skills_idx ON public.profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS profiles_programming_languages_idx ON public.profiles USING GIN(programming_languages);
CREATE INDEX IF NOT EXISTS profiles_frameworks_idx ON public.profiles USING GIN(frameworks);
CREATE INDEX IF NOT EXISTS profiles_looking_for_team_idx ON public.profiles(looking_for_team);
CREATE INDEX IF NOT EXISTS profiles_preferred_role_idx ON public.profiles(preferred_role);
CREATE INDEX IF NOT EXISTS profiles_experience_level_idx ON public.profiles(experience_level);
CREATE INDEX IF NOT EXISTS profiles_location_idx ON public.profiles(location);

-- Create a view for public profile discovery (excludes private info)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  username,
  avatar_url,
  bio,
  github_url,
  twitter_url,
  discord_username,
  linkedin_url,
  website_url,
  location,
  timezone,
  job_title,
  company,
  experience_level,
  skills,
  programming_languages,
  frameworks,
  previous_hackathons,
  preferred_role,
  availability,
  looking_for_team,
  favorite_games,
  game_dev_experience,
  created_at
FROM public.profiles;

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- =====================================================
-- STORAGE BUCKET SETUP FOR AVATAR IMAGES
-- =====================================================

-- Create avatars bucket for profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage policies for avatars bucket

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public access to view all avatars
CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'avatars');

-- Function to generate avatar URL
CREATE OR REPLACE FUNCTION public.get_avatar_url(user_id UUID, filename TEXT DEFAULT NULL)
RETURNS TEXT AS $$
BEGIN
  IF filename IS NULL THEN
    -- Return default avatar if no filename provided
    RETURN COALESCE(
      (SELECT avatar_url FROM public.profiles WHERE id = user_id),
      '/assets/mentors/belac.jpg' -- Default avatar
    );
  ELSE
    -- Return Supabase storage URL for the avatar
    RETURN CONCAT(
      'https://your-project-ref.supabase.co/storage/v1/object/public/avatars/',
      user_id::text,
      '/',
      filename
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to handle avatar upload and update profile
CREATE OR REPLACE FUNCTION public.update_user_avatar(
  user_id UUID,
  new_avatar_url TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update the profile with new avatar URL
  UPDATE public.profiles 
  SET avatar_url = new_avatar_url, updated_at = NOW()
  WHERE id = user_id;
  
  -- Return success status
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old avatar when new one is uploaded
CREATE OR REPLACE FUNCTION public.cleanup_old_avatar()
RETURNS TRIGGER AS $$
DECLARE
  old_filename TEXT;
  old_path TEXT;
BEGIN
  -- Only proceed if avatar_url actually changed
  IF OLD.avatar_url IS DISTINCT FROM NEW.avatar_url THEN
    -- Extract filename from old avatar URL if it's a storage URL
    IF OLD.avatar_url LIKE '%/storage/v1/object/public/avatars/%' THEN
      old_path := SUBSTRING(OLD.avatar_url FROM '/avatars/(.*)');
      
      -- Delete old avatar file from storage
      -- Note: This would need to be implemented via a database function or edge function
      -- For now, we'll just log the cleanup needed
      RAISE NOTICE 'Old avatar cleanup needed for path: %', old_path;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to cleanup old avatars
CREATE TRIGGER cleanup_old_avatar_trigger
  AFTER UPDATE OF avatar_url ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.cleanup_old_avatar();

-- Helper function to validate avatar file type
CREATE OR REPLACE FUNCTION public.is_valid_avatar_type(filename TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN filename ~* '\.(jpg|jpeg|png|webp|gif)$';
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing (optional)
-- You can uncomment this section if you want sample data

/*
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  username,
  bio,
  github_url,
  twitter_url,
  discord_username,
  telegram_username,
  linkedin_url,
  website_url,
  location,
  timezone,
  job_title,
  company,
  experience_level,
  education,
  skills,
  programming_languages,
  frameworks,
  previous_hackathons,
  preferred_role,
  availability,
  looking_for_team,
  favorite_games,
  game_dev_experience
) VALUES (
  'sample-uuid-here', -- Replace with actual user UUID
  'developer@example.com',
  'Sample Developer',
  'sampledev',
  'Passionate game developer building the future on Solana',
  'https://github.com/sampledev',
  'https://x.com/sampledev',
  'sampledev#1234',
  '@sampledev',
  'https://linkedin.com/in/sampledev',
  'https://sampledev.com',
  'Singapore',
  'UTC+8',
  'Full-Stack Developer',
  'Tech Startup',
  'Intermediate (2-4 years)',
  'Computer Science, NUS',
  ARRAY['Solana', 'Rust', 'TypeScript', 'Game Development', 'Unity'],
  ARRAY['JavaScript', 'TypeScript', 'Rust', 'Python', 'C#'],
  ARRAY['React', 'Next.js', 'Unity', 'Express.js'],
  3,
  'Full-Stack Developer',
  'Part-time (20-40 hours/week)',
  true,
  ARRAY['Valorant', 'League of Legends', 'Minecraft'],
  'Built 2 indie games with Unity, experienced in game mechanics and monetization'
) ON CONFLICT (id) DO NOTHING;
*/

-- Create function to search profiles by skills (useful for team matching)
CREATE OR REPLACE FUNCTION public.search_profiles_by_skills(search_skills TEXT[])
RETURNS TABLE (
  profile_id UUID,
  full_name TEXT,
  username TEXT,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[],
  preferred_role TEXT,
  looking_for_team BOOLEAN,
  skill_match_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.username,
    p.avatar_url,
    p.bio,
    p.skills,
    p.preferred_role,
    p.looking_for_team,
    (
      SELECT COUNT(*)::INTEGER 
      FROM unnest(p.skills) AS skill 
      WHERE skill = ANY(search_skills)
    ) AS skill_match_count
  FROM public.profiles p
  WHERE p.skills && search_skills  -- Array overlap operator
  ORDER BY skill_match_count DESC, p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get team recommendations for a user
CREATE OR REPLACE FUNCTION public.get_team_recommendations(user_id UUID)
RETURNS TABLE (
  profile_id UUID,
  full_name TEXT,
  username TEXT,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[],
  preferred_role TEXT,
  compatibility_score INTEGER
) AS $$
DECLARE
  user_skills TEXT[];
  user_role TEXT;
BEGIN
  -- Get current user's skills and role
  SELECT skills, preferred_role INTO user_skills, user_role
  FROM public.profiles 
  WHERE id = user_id;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.username,
    p.avatar_url,
    p.bio,
    p.skills,
    p.preferred_role,
    (
      -- Calculate compatibility score based on complementary skills and different roles
      CASE 
        WHEN p.preferred_role != user_role THEN 10 
        ELSE 0 
      END +
      (
        SELECT COUNT(*)::INTEGER * 2
        FROM unnest(p.skills) AS skill 
        WHERE skill = ANY(user_skills)
      )
    ) AS compatibility_score
  FROM public.profiles p
  WHERE p.id != user_id 
    AND p.looking_for_team = true
    AND p.preferred_role IS NOT NULL
  ORDER BY compatibility_score DESC, p.created_at DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Comments explaining the schema
COMMENT ON TABLE public.profiles IS 'Enhanced user profiles for Solana Game Jam with comprehensive hackathon-specific fields';
COMMENT ON COLUMN public.profiles.skills IS 'Array of general skills like Solana, Game Development, UI/UX';
COMMENT ON COLUMN public.profiles.programming_languages IS 'Array of programming languages like JavaScript, Rust, Python';
COMMENT ON COLUMN public.profiles.frameworks IS 'Array of frameworks and tools like React, Unity, Next.js';
COMMENT ON COLUMN public.profiles.looking_for_team IS 'Whether the user is actively looking for team members';
COMMENT ON FUNCTION public.search_profiles_by_skills IS 'Search profiles by matching skills with ranking by match count';
COMMENT ON FUNCTION public.get_team_recommendations IS 'Get team member recommendations based on complementary skills and roles'; 