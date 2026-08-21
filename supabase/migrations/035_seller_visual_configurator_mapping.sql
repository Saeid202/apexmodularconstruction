ALTER TABLE public.product_customization_groups
ADD COLUMN IF NOT EXISTS target_anchor_id UUID REFERENCES public.house_anchors(id) ON DELETE SET NULL;

ALTER TABLE public.product_customization_groups
ADD COLUMN IF NOT EXISTS visual_type TEXT
CHECK (visual_type IN ('door', 'window', 'wall-color', 'generic'))
DEFAULT 'generic';

ALTER TABLE public.product_customization_options
ADD COLUMN IF NOT EXISTS color_hex TEXT;

ALTER TABLE public.house_configurator_settings
ADD COLUMN IF NOT EXISTS base_image_width INTEGER,
ADD COLUMN IF NOT EXISTS base_image_height INTEGER;
