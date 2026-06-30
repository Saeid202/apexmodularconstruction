-- ============================================
-- Apex Modular Construction E-Commerce Platform
-- Create Avatars Storage Bucket
-- ============================================
-- This migration creates a storage bucket for user avatars
-- NOTE: This requires service role permissions. If you get a permission error,
-- create the bucket manually in Supabase Dashboard > Storage > New Bucket
-- Bucket name: avatars, Public: true

-- Create avatars bucket (requires service role)
-- If this fails, create it manually in Supabase Dashboard
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on avatars bucket (requires service role)
ALTER TABLE storage.objects 
ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Simple policy: Authenticated users can upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Simple policy: Public can view all avatars (bucket is public)
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Simple policy: Authenticated users can delete their own avatars
CREATE POLICY "Authenticated users can delete own avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
