-- Add ai_metadata to product_drafts to store vision analysis data
ALTER TABLE product_drafts ADD COLUMN IF NOT EXISTS ai_metadata JSONB DEFAULT '{}'::jsonb;
