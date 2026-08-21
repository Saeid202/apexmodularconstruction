-- Create a bucket for temporary catalog uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('temp-catalogs', 'temp-catalogs', false)
ON CONFLICT (id) DO NOTHING;

-- Allow sellers to upload to their own folder in the temp-catalogs bucket
CREATE POLICY "Sellers can upload catalogs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'temp-catalogs');

CREATE POLICY "Sellers can read their own catalogs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'temp-catalogs');
