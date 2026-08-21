-- Add page_number to product_drafts for visual context
ALTER TABLE product_drafts ADD COLUMN IF NOT EXISTS page_number INTEGER;
