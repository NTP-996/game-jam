-- Solana Speedrun 2024 Games Schema
-- Separate table for historical hackathon games from itch.io

-- =====================================================
-- SPEEDRUN 2024 GAMES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.speedrun_2024_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic game info
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  developer_name VARCHAR(200) NOT NULL,
  
  -- Links
  itch_url TEXT NOT NULL UNIQUE, -- Original itch.io URL
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
  itch_id TEXT UNIQUE, -- itch.io game ID
  published_date TIMESTAMP WITH TIME ZONE,
  downloads_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0, -- Average rating out of 5
  rating_count INTEGER DEFAULT 0,
  
  -- Solana integration details
  solana_features TEXT[] DEFAULT '{}', -- e.g., ['NFTs', 'Tokens', 'DeFi', 'On-chain Gaming']
  solana_program_ids TEXT[] DEFAULT '{}', -- Array of Solana program addresses
  
  -- Metadata
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0, -- For custom ordering
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_speedrun_2024_games_developer ON public.speedrun_2024_games(developer_name);
CREATE INDEX IF NOT EXISTS idx_speedrun_2024_games_category ON public.speedrun_2024_games(category);
CREATE INDEX IF NOT EXISTS idx_speedrun_2024_games_tags ON public.speedrun_2024_games USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_speedrun_2024_games_tech_stack ON public.speedrun_2024_games USING GIN(tech_stack);
CREATE INDEX IF NOT EXISTS idx_speedrun_2024_games_featured ON public.speedrun_2024_games(is_featured);
CREATE INDEX IF NOT EXISTS idx_speedrun_2024_games_display_order ON public.speedrun_2024_games(display_order);
CREATE INDEX IF NOT EXISTS idx_speedrun_2024_games_published_date ON public.speedrun_2024_games(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_speedrun_2024_games_rating ON public.speedrun_2024_games(rating DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.speedrun_2024_games ENABLE ROW LEVEL SECURITY;

-- Allow public read access (these are public historical games)
CREATE POLICY "Public read access to speedrun 2024 games" ON public.speedrun_2024_games
  FOR SELECT USING (true);

-- Only authenticated users can insert/update (for admin purposes)
CREATE POLICY "Authenticated users can manage speedrun 2024 games" ON public.speedrun_2024_games
  FOR ALL TO authenticated USING (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to search games by name or developer
CREATE OR REPLACE FUNCTION public.search_speedrun_2024_games(search_term TEXT)
RETURNS SETOF public.speedrun_2024_games AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.speedrun_2024_games
  WHERE 
    name ILIKE '%' || search_term || '%' OR
    developer_name ILIKE '%' || search_term || '%' OR
    description ILIKE '%' || search_term || '%'
  ORDER BY 
    CASE WHEN is_featured THEN 0 ELSE 1 END,
    rating DESC,
    published_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get games by category
CREATE OR REPLACE FUNCTION public.get_speedrun_2024_games_by_category(game_category TEXT)
RETURNS SETOF public.speedrun_2024_games AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.speedrun_2024_games
  WHERE category = game_category OR game_category = 'all'
  ORDER BY 
    CASE WHEN is_featured THEN 0 ELSE 1 END,
    display_order,
    rating DESC,
    published_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get featured games
CREATE OR REPLACE FUNCTION public.get_featured_speedrun_2024_games()
RETURNS SETOF public.speedrun_2024_games AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.speedrun_2024_games
  WHERE is_featured = true
  ORDER BY display_order, rating DESC, published_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get random game for featured display
CREATE OR REPLACE FUNCTION public.get_random_speedrun_2024_game()
RETURNS public.speedrun_2024_games AS $$
DECLARE
  random_game public.speedrun_2024_games;
BEGIN
  SELECT *
  INTO random_game
  FROM public.speedrun_2024_games
  ORDER BY RANDOM()
  LIMIT 1;
  
  RETURN random_game;
END;
$$ LANGUAGE plpgsql;

-- Function to update game statistics
CREATE OR REPLACE FUNCTION public.update_speedrun_2024_game_stats(
  game_id UUID,
  new_downloads INTEGER DEFAULT NULL,
  new_rating DECIMAL(3,2) DEFAULT NULL,
  new_rating_count INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.speedrun_2024_games
  SET 
    downloads_count = COALESCE(new_downloads, downloads_count),
    rating = COALESCE(new_rating, rating),
    rating_count = COALESCE(new_rating_count, rating_count),
    updated_at = NOW()
  WHERE id = game_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_speedrun_2024_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER speedrun_2024_games_updated_at
  BEFORE UPDATE ON public.speedrun_2024_games
  FOR EACH ROW EXECUTE FUNCTION public.handle_speedrun_2024_updated_at();

-- =====================================================
-- PERMISSIONS
-- =====================================================
GRANT SELECT ON public.speedrun_2024_games TO anon;
GRANT ALL ON public.speedrun_2024_games TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_speedrun_2024_games TO anon;
GRANT EXECUTE ON FUNCTION public.get_speedrun_2024_games_by_category TO anon;
GRANT EXECUTE ON FUNCTION public.get_featured_speedrun_2024_games TO anon;
GRANT EXECUTE ON FUNCTION public.get_random_speedrun_2024_game TO anon;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE public.speedrun_2024_games IS 'Historical games from Solana Speedrun 3 hackathon on itch.io';
COMMENT ON COLUMN public.speedrun_2024_games.itch_url IS 'Original itch.io game URL';
COMMENT ON COLUMN public.speedrun_2024_games.itch_id IS 'Unique itch.io game identifier';
COMMENT ON COLUMN public.speedrun_2024_games.display_order IS 'Custom ordering for featured games (lower = higher priority)';
COMMENT ON COLUMN public.speedrun_2024_games.solana_features IS 'Array of Solana features used in the game';
COMMENT ON COLUMN public.speedrun_2024_games.solana_program_ids IS 'Array of Solana program addresses used'; 