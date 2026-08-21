-- Add price_type field to products table
ALTER TABLE products 
ADD COLUMN price_type TEXT NOT NULL DEFAULT 'unit' 
CHECK (price_type IN ('unit', 'sqm', 'sqf'));

-- Add comment to explain the field
COMMENT ON COLUMN products.price_type IS 'Price unit type: unit (per piece), sqm (per square meter), sqf (per square foot)';
