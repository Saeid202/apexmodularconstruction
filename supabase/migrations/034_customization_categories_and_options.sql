-- Add new columns to existing product_customization_options table
-- This enhances the existing customization system to support multiple images and inventory tracking
-- Only add columns if they don't already exist
DO $$
BEGIN
  -- Add additional_images column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_customization_options' 
    AND column_name = 'additional_images'
  ) THEN
    ALTER TABLE product_customization_options ADD COLUMN additional_images TEXT[] DEFAULT NULL;
  END IF;

  -- Add stock_quantity column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_customization_options' 
    AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE product_customization_options ADD COLUMN stock_quantity INTEGER DEFAULT NULL;
  END IF;

  -- Add track_inventory column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_customization_options' 
    AND column_name = 'track_inventory'
  ) THEN
    ALTER TABLE product_customization_options ADD COLUMN track_inventory BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add index for better performance on additional_images (only if index doesn't exist)
CREATE INDEX IF NOT EXISTS idx_customization_options_additional_images ON product_customization_options USING GIN (additional_images);

-- Update existing RLS policy to include new columns
-- The existing policy should already work, but let's ensure it handles the new fields properly
DROP POLICY IF EXISTS "Sellers can manage their own customization options" ON product_customization_options;

CREATE POLICY "Sellers can manage their own customization options" ON product_customization_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM product_customization_groups
      JOIN products ON products.id = product_customization_groups.product_id
      WHERE product_customization_groups.id = product_customization_options.group_id
      AND products.seller_id = auth.uid()
    )
  );

-- Update comments for documentation
COMMENT ON COLUMN product_customization_options.additional_images IS 'Array of additional image URLs for galleries (supports multiple images for all option types)';
COMMENT ON COLUMN product_customization_options.stock_quantity IS 'Available quantity (NULL = unlimited, optional inventory tracking)';
COMMENT ON COLUMN product_customization_options.track_inventory IS 'Whether to track inventory for this option';

-- Note: The existing product_customization_groups table already serves as our categories table
-- It already has: id, product_id, name, description, is_required, display_order, created_at, updated_at
