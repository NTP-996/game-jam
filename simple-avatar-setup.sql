-- Simple avatar bucket setup (run this in Supabase SQL Editor)

-- Create or update the avatars bucket
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

-- The storage policies need to be set up through the Supabase Dashboard
-- Go to Storage > avatars bucket > Configuration > Policies
-- Or try the simplified policies below if the above works 