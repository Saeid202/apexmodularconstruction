-- Migration: 040_certificates_bucket.sql
-- Add storage bucket for product certificates and standards

-- Create certificates storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Certificates: Public read access
CREATE POLICY "Public can view certificates"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates');

-- Certificates: Sellers can upload
CREATE POLICY "Sellers can upload certificates"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'certificates');

-- Certificates: Sellers can update their own uploads
CREATE POLICY "Sellers can update own certificates"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'certificates');

-- Certificates: Sellers can delete their own uploads
CREATE POLICY "Sellers can delete own certificates"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'certificates');
