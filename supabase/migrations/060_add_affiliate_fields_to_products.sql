-- Add affiliate marketing fields to products table

-- 1. Create enum types if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'affiliate_commission_type_enum') THEN
    CREATE TYPE affiliate_commission_type_enum AS ENUM ('percentage', 'fixed_amount');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'affiliate_availability_enum') THEN
    CREATE TYPE affiliate_availability_enum AS ENUM ('all_partners', 'selected_partners');
  END IF;
END$$;

-- 2. Add columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS affiliate_enabled BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS affiliate_commission_type TEXT NOT NULL DEFAULT 'percentage' CHECK (affiliate_commission_type IN ('percentage', 'fixed_amount')),
ADD COLUMN IF NOT EXISTS affiliate_commission_value NUMERIC(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS affiliate_availability TEXT NOT NULL DEFAULT 'all_partners' CHECK (affiliate_availability IN ('all_partners', 'selected_partners'));

-- 3. Create indexes for quick query filtering in Partner Dashboard
CREATE INDEX IF NOT EXISTS idx_products_affiliate_enabled ON products(affiliate_enabled) WHERE affiliate_enabled = TRUE;
