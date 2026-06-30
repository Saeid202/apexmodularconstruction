-- Add cta_enabled toggle to hero_slides
-- Existing slides default to false so no button appears until explicitly enabled

ALTER TABLE hero_slides
  ADD COLUMN IF NOT EXISTS cta_enabled boolean NOT NULL DEFAULT false;
