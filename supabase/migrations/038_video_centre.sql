-- Migration: 038_video_centre.sql
-- Create video_centre table for modular construction video portfolio showcase

CREATE TABLE IF NOT EXISTS public.video_centre (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.video_centre ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all published videos
CREATE POLICY "Public Read Access" ON public.video_centre
  FOR SELECT USING (true);

-- Allow admins full control over videos
CREATE POLICY "Admin Write Access" ON public.video_centre
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add triggers for automatic updated_at updates if function exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
    CREATE TRIGGER update_video_centre_modtime
      BEFORE UPDATE ON public.video_centre
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;
