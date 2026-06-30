-- Add enhanced hero section fields for two-column split layout
-- Supports headline, subtext, benefits, dual CTAs, and layout options

ALTER TABLE hero_slides
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS subtext text,
  ADD COLUMN IF NOT EXISTS benefits jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cta_secondary_text text,
  ADD COLUMN IF NOT EXISTS cta_secondary_link text,
  ADD COLUMN IF NOT EXISTS layout_type text NOT NULL DEFAULT 'split',
  ADD COLUMN IF NOT EXISTS background_overlay boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS trust_line text;

-- Add check constraint for layout_type
ALTER TABLE hero_slides
  ADD CONSTRAINT hero_slides_layout_type_check 
  CHECK (layout_type IN ('split', 'centered', 'image-only'));

-- Add comments
COMMENT ON COLUMN hero_slides.headline IS 'Primary H1 headline for hero section';
COMMENT ON COLUMN hero_slides.subtext IS 'Supporting text explaining value proposition';
COMMENT ON COLUMN hero_slides.benefits IS 'JSON array of key benefit bullets (max 3)';
COMMENT ON COLUMN hero_slides.cta_secondary_text IS 'Secondary CTA button text';
COMMENT ON COLUMN hero_slides.cta_secondary_link IS 'Secondary CTA button link';
COMMENT ON COLUMN hero_slides.layout_type IS 'Layout: split (two-column), centered (overlay), or image-only';
COMMENT ON COLUMN hero_slides.background_overlay IS 'Dark overlay on image for text readability';
COMMENT ON COLUMN hero_slides.trust_line IS 'Trust indicators displayed below CTAs';
