-- Migration: 039_product_inclusions_certificates.sql
-- Add "what is included" and "certificates and standards" columns to products table

-- Add columns for product inclusions and certificates/standards
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS what_is_included JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS certificates_standards JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.products.what_is_included IS 'Array of strings representing bullet list items of what is included with the product';

COMMENT ON COLUMN public.products.certificates_standards IS 'Array of certificate/standard objects with structure: {id: uuid, title: string, description: string, file_url: string}';

-- Create indexes for performance on JSONB columns
CREATE INDEX IF NOT EXISTS idx_products_what_is_included ON public.products USING GIN (what_is_included);
CREATE INDEX IF NOT EXISTS idx_products_certificates_standards ON public.products USING GIN (certificates_standards);

-- Add constraint to ensure columns are valid JSONB arrays
ALTER TABLE public.products
ADD CONSTRAINT check_what_is_included_array CHECK (jsonb_typeof(what_is_included) = 'array'),
ADD CONSTRAINT check_certificates_standards_array CHECK (jsonb_typeof(certificates_standards) = 'array');
