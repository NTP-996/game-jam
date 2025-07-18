-- Project Images Storage Setup
-- Creates buckets for game banners and logos with proper security policies
-- Date: 2024-12-16

-- =====================================================
-- CREATE STORAGE BUCKETS
-- =====================================================

-- Create game-banners bucket for wide banner images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-banners',
  'game-banners', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Create game-logos bucket for square logo images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-logos',
  'game-logos', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- Create game-screenshots bucket for screenshot images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-screenshots',
  'game-screenshots', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- =====================================================
-- STORAGE POLICIES FOR GAME BANNERS
-- =====================================================

-- Allow authenticated users to upload banners for their projects
CREATE POLICY "Users can upload game banners" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'game-banners' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own banners
CREATE POLICY "Users can update their game banners" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'game-banners' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own banners
CREATE POLICY "Users can delete their game banners" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'game-banners' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public access to view all banners
CREATE POLICY "Public banner access" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'game-banners');

-- =====================================================
-- STORAGE POLICIES FOR GAME LOGOS
-- =====================================================

-- Allow authenticated users to upload logos for their projects
CREATE POLICY "Users can upload game logos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'game-logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own logos
CREATE POLICY "Users can update their game logos" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'game-logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own logos
CREATE POLICY "Users can delete their game logos" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'game-logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public access to view all logos
CREATE POLICY "Public logo access" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'game-logos');

-- =====================================================
-- STORAGE POLICIES FOR GAME SCREENSHOTS
-- =====================================================

-- Allow authenticated users to upload screenshots for their projects
CREATE POLICY "Users can upload game screenshots" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'game-screenshots' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own screenshots
CREATE POLICY "Users can update their game screenshots" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'game-screenshots' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own screenshots
CREATE POLICY "Users can delete their game screenshots" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'game-screenshots' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public access to view all screenshots
CREATE POLICY "Public screenshot access" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'game-screenshots');

-- =====================================================
-- HELPER FUNCTIONS FOR IMAGE MANAGEMENT
-- =====================================================

-- Function to generate banner URL for a project
CREATE OR REPLACE FUNCTION public.get_project_banner_url(user_id UUID, filename TEXT)
RETURNS TEXT AS $$
BEGIN
  IF filename IS NULL OR filename = '' THEN
    RETURN NULL;
  END IF;
  
  RETURN CONCAT(
    current_setting('app.settings.supabase_url', true),
    '/storage/v1/object/public/game-banners/',
    user_id::text,
    '/',
    filename
  );
END;
$$ LANGUAGE plpgsql;

-- Function to generate logo URL for a project
CREATE OR REPLACE FUNCTION public.get_project_logo_url(user_id UUID, filename TEXT)
RETURNS TEXT AS $$
BEGIN
  IF filename IS NULL OR filename = '' THEN
    RETURN NULL;
  END IF;
  
  RETURN CONCAT(
    current_setting('app.settings.supabase_url', true),
    '/storage/v1/object/public/game-logos/',
    user_id::text,
    '/',
    filename
  );
END;
$$ LANGUAGE plpgsql;

-- Function to generate screenshot URL for a project
CREATE OR REPLACE FUNCTION public.get_project_screenshot_url(user_id UUID, filename TEXT)
RETURNS TEXT AS $$
BEGIN
  IF filename IS NULL OR filename = '' THEN
    RETURN NULL;
  END IF;
  
  RETURN CONCAT(
    current_setting('app.settings.supabase_url', true),
    '/storage/v1/object/public/game-screenshots/',
    user_id::text,
    '/',
    filename
  );
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old images when project is deleted
CREATE OR REPLACE FUNCTION public.cleanup_project_images()
RETURNS TRIGGER AS $$
DECLARE
  banner_filename TEXT;
  logo_filename TEXT;
  screenshot_filename TEXT;
BEGIN
  -- Extract filenames from URLs if they're storage URLs
  IF OLD.banner_url LIKE '%/storage/v1/object/public/game-banners/%' THEN
    banner_filename := SUBSTRING(OLD.banner_url FROM '/game-banners/[^/]+/(.*)');
    IF banner_filename IS NOT NULL THEN
      -- Delete banner file (would need edge function or external cleanup)
      RAISE NOTICE 'Banner cleanup needed: %', banner_filename;
    END IF;
  END IF;
  
  IF OLD.logo_url LIKE '%/storage/v1/object/public/game-logos/%' THEN
    logo_filename := SUBSTRING(OLD.logo_url FROM '/game-logos/[^/]+/(.*)');
    IF logo_filename IS NOT NULL THEN
      -- Delete logo file (would need edge function or external cleanup)
      RAISE NOTICE 'Logo cleanup needed: %', logo_filename;
    END IF;
  END IF;
  
  -- Handle screenshot cleanup (array of URLs)
  IF OLD.screenshot_urls IS NOT NULL THEN
    FOREACH screenshot_filename IN ARRAY OLD.screenshot_urls
    LOOP
      IF screenshot_filename LIKE '%/storage/v1/object/public/game-screenshots/%' THEN
        screenshot_filename := SUBSTRING(screenshot_filename FROM '/game-screenshots/[^/]+/(.*)');
        IF screenshot_filename IS NOT NULL THEN
          RAISE NOTICE 'Screenshot cleanup needed: %', screenshot_filename;
        END IF;
      END IF;
    END LOOP;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to cleanup images when project is deleted
CREATE TRIGGER cleanup_project_images_trigger
  BEFORE DELETE ON public.project_submissions
  FOR EACH ROW EXECUTE FUNCTION public.cleanup_project_images();

-- Function to validate image file types
CREATE OR REPLACE FUNCTION public.is_valid_image_type(filename TEXT, bucket_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  CASE bucket_name
    WHEN 'game-banners' THEN
      RETURN filename ~* '\.(jpg|jpeg|png|webp)$';
    WHEN 'game-logos' THEN
      RETURN filename ~* '\.(jpg|jpeg|png|webp|svg)$';
    WHEN 'game-screenshots' THEN
      RETURN filename ~* '\.(jpg|jpeg|png|webp)$';
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION public.get_project_banner_url IS 'Generate full URL for project banner image stored in Supabase storage';
COMMENT ON FUNCTION public.get_project_logo_url IS 'Generate full URL for project logo image stored in Supabase storage';
COMMENT ON FUNCTION public.get_project_screenshot_url IS 'Generate full URL for project screenshot image stored in Supabase storage';
COMMENT ON FUNCTION public.cleanup_project_images IS 'Cleanup project images when project is deleted (logs cleanup needed)';
COMMENT ON FUNCTION public.is_valid_image_type IS 'Validate image file types for different buckets'; 