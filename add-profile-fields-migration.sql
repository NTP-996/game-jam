-- Migration to add missing profile fields
-- This adds all the fields that the profile page UI expects
-- Date: 2024-12-16

-- Add missing contact & social fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Add personal details
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC+8';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add professional info
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_level TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education TEXT;

-- Add hackathon specific arrays
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS programming_languages TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS frameworks TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS previous_hackathons INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_role TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS availability TEXT;

-- Add gaming fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorite_games TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS game_dev_experience TEXT;

-- Add indexes for the new array fields
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON public.profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_profiles_programming_languages ON public.profiles USING GIN(programming_languages);
CREATE INDEX IF NOT EXISTS idx_profiles_frameworks ON public.profiles USING GIN(frameworks);
CREATE INDEX IF NOT EXISTS idx_profiles_favorite_games ON public.profiles USING GIN(favorite_games);

-- Add indexes for searchable text fields
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_experience_level ON public.profiles(experience_level);
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_role ON public.profiles(preferred_role);

-- Update the public profile view if it exists to include new fields
DROP VIEW IF EXISTS public.public_profiles CASCADE;
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  username,
  avatar_url,
  bio,
  location,
  skills,
  interests,
  programming_languages,
  frameworks,
  experience_level,
  preferred_role,
  looking_for_team,
  game_dev_experience,
  favorite_games,
  github_url,
  twitter_url,
  discord_username,
  website_url,
  created_at
FROM public.profiles
WHERE full_name IS NOT NULL AND username IS NOT NULL;

-- Grant permissions
GRANT SELECT ON public.public_profiles TO authenticated;

-- Done! The profiles table now has all fields the UI expects 