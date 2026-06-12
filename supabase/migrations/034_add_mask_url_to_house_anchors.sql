ALTER TABLE public.house_anchors
ADD COLUMN IF NOT EXISTS mask_url TEXT;
