-- Create room_scans table
CREATE TABLE public.room_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    status TEXT NOT NULL DEFAULT 'pending', -- pending, scanning, completed, failed
    room_data_json JSONB,
    model_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.room_scans ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert and select (since it's an open session link)
-- In a real app we might secure this better, but for this POC public access is fine.
CREATE POLICY "Enable read access for all users" ON public.room_scans FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.room_scans FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.room_scans FOR UPDATE USING (true);

-- Enable Realtime
alter publication supabase_realtime add table public.room_scans;

-- Create storage bucket for room models
INSERT INTO storage.buckets (id, name, public) 
VALUES ('room_models', 'room_models', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'room_models' );

CREATE POLICY "Enable upload for all" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'room_models' );
