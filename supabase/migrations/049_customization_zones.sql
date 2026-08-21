-- Migration: 049_customization_zones.sql

-- Create customization zones table (output of SAM scan)
CREATE TABLE IF NOT EXISTS public.product_customization_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    mask_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.product_customization_zones ENABLE ROW LEVEL SECURITY;

-- Policies for zones
CREATE POLICY "Public read access for customization zones"
    ON public.product_customization_zones FOR SELECT
    USING (true);

CREATE POLICY "Sellers can manage their own customization zones"
    ON public.product_customization_zones FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.products p
            WHERE p.id = product_id
            AND p.seller_id = auth.uid()
        )
    );

-- Add target_zone_id to product_customization_groups
ALTER TABLE public.product_customization_groups
ADD COLUMN IF NOT EXISTS target_zone_id UUID REFERENCES public.product_customization_zones(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_customization_zones_product ON public.product_customization_zones(product_id);
CREATE INDEX IF NOT EXISTS idx_customization_groups_zone ON public.product_customization_groups(target_zone_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at_zones ON public.product_customization_zones;
CREATE TRIGGER set_updated_at_zones
    BEFORE UPDATE ON public.product_customization_zones
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
