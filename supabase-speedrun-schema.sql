-- Speedrun 2024 Games Table for Supabase
-- Run this in your Supabase SQL Editor

-- Create the speedrun_2024_games table
CREATE TABLE IF NOT EXISTS public.speedrun_2024_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic game info
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  developer_name VARCHAR(200) NOT NULL,
  
  -- Links
  itch_url TEXT NOT NULL UNIQUE,
  github_url TEXT,
  demo_url TEXT,
  
  -- Media
  thumbnail_url TEXT NOT NULL,
  banner_url TEXT,
  screenshot_urls TEXT[] DEFAULT '{}',
  video_url TEXT,
  
  -- Game details
  tech_stack TEXT[] DEFAULT '{}',
  category VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  
  -- Itch.io specific data
  itch_id TEXT UNIQUE,
  published_date TIMESTAMP WITH TIME ZONE,
  downloads_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  
  -- Solana integration details
  solana_features TEXT[] DEFAULT '{}',
  solana_program_ids TEXT[] DEFAULT '{}',
  
  -- Metadata
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_speedrun_2024_games_developer ON public.speedrun_2024_games(developer_name);
CREATE INDEX IF NOT EXISTS idx_speedrun_2024_games_category ON public.speedrun_2024_games(category);
CREATE INDEX IF NOT EXISTS idx_speedrun_2024_games_tags ON public.speedrun_2024_games USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_speedrun_2024_games_tech_stack ON public.speedrun_2024_games USING GIN(tech_stack);
CREATE INDEX IF NOT EXISTS idx_speedrun_2024_games_featured ON public.speedrun_2024_games(is_featured);
CREATE INDEX IF NOT EXISTS idx_speedrun_2024_games_display_order ON public.speedrun_2024_games(display_order);
CREATE INDEX IF NOT EXISTS idx_speedrun_2024_games_published_date ON public.speedrun_2024_games(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_speedrun_2024_games_rating ON public.speedrun_2024_games(rating DESC);

-- Enable Row Level Security
ALTER TABLE public.speedrun_2024_games ENABLE ROW LEVEL SECURITY;

-- Allow public read access (these are public historical games)
CREATE POLICY "Public read access to speedrun 2024 games" ON public.speedrun_2024_games
  FOR SELECT USING (true);

-- Only authenticated users can insert/update (for admin purposes)
CREATE POLICY "Authenticated users can manage speedrun 2024 games" ON public.speedrun_2024_games
  FOR ALL TO authenticated USING (true);

-- Grant permissions
GRANT SELECT ON public.speedrun_2024_games TO anon;
GRANT ALL ON public.speedrun_2024_games TO authenticated; 