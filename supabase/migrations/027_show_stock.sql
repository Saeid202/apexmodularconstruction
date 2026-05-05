-- Add show_stock toggle to products
-- When false, the "In Stock / Out of Stock" badge is hidden on the public product page.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS show_stock BOOLEAN NOT NULL DEFAULT TRUE;
