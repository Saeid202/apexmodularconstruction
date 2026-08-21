-- Migration: 032_product_customizations.sql

-- Add columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS has_customization BOOLEAN DEFAULT FALSE;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS customizations JSONB;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS customizations JSONB;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_price DECIMAL(12,2);
ALTER TABLE public.order_requests ADD COLUMN IF NOT EXISTS customizations JSONB;

-- Customization Groups (Categories like "Doors", "Windows")
CREATE TABLE IF NOT EXISTS public.product_customization_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customization Options (Specific items like "Door A60")
CREATE TABLE IF NOT EXISTS public.product_customization_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.product_customization_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price_modifier DECIMAL(12, 2) DEFAULT 0.00,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.product_customization_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_customization_options ENABLE ROW LEVEL SECURITY;

-- Policies for Groups
CREATE POLICY "Public read access for customization groups"
    ON public.product_customization_groups FOR SELECT
    USING (true);

CREATE POLICY "Sellers can manage their own customization groups"
    ON public.product_customization_groups FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.products p
            WHERE p.id = product_id
            AND p.seller_id = auth.uid()
        )
    );

-- Policies for Options
CREATE POLICY "Public read access for customization options"
    ON public.product_customization_options FOR SELECT
    USING (true);

CREATE POLICY "Sellers can manage their own customization options"
    ON public.product_customization_options FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.product_customization_groups g
            JOIN public.products p ON p.id = g.product_id
            WHERE g.id = group_id
            AND p.seller_id = auth.uid()
        )
    );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_customization_groups_product ON public.product_customization_groups(product_id);
CREATE INDEX IF NOT EXISTS idx_customization_options_group ON public.product_customization_options(group_id);

-- Update updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at_groups ON public.product_customization_groups;
CREATE TRIGGER set_updated_at_groups
    BEFORE UPDATE ON public.product_customization_groups
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_options ON public.product_customization_options;
CREATE TRIGGER set_updated_at_options
    BEFORE UPDATE ON public.product_customization_options
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
