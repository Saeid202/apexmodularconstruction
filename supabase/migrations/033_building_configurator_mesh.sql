-- Migration: 033_building_configurator_mesh.sql
-- Building Configurator Enterprise Architecture

-- 1. Extend Products with a 'type' if not exists or use categories
-- We'll add a 'configurator_type' to help distinguish roles
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS configurator_type TEXT CHECK (configurator_type IN ('house', 'door', 'window', 'wall-material', 'none')) DEFAULT 'none';

-- 2. House Configurator Settings
-- Stores lighting and environment metadata for a house model
CREATE TABLE IF NOT EXISTS public.house_configurator_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
    base_image_url TEXT NOT NULL,
    lighting_metadata JSONB DEFAULT '{"sun_direction": "top-left", "ambient": "balanced"}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. House Anchors
-- Defines "Where" things go on a house. 
-- Using normalized coordinates (0-100) for responsiveness.
CREATE TABLE IF NOT EXISTS public.house_anchors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    house_id UUID NOT NULL REFERENCES public.house_configurator_settings(id) ON DELETE CASCADE,
    anchor_type TEXT NOT NULL CHECK (anchor_type IN ('door', 'window', 'wall-mask')),
    label TEXT, -- e.g., "Main Entrance", "Living Room Window"
    mask_url TEXT, -- URL to the alpha-mask PNG for wall-masking
    metadata JSONB DEFAULT '{}'::JSONB,
    x_pos DECIMAL(5,2) NOT NULL, -- percentage from left
    y_pos DECIMAL(5,2) NOT NULL, -- percentage from top
    width DECIMAL(5,2) NOT NULL, -- percentage of base image width
    height DECIMAL(5,2) NOT NULL, -- percentage of base image height
    z_index INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. House Allowed Products (The Bridge)
-- Defines "What" can go into an anchor.
-- This allows reusable products across different houses.
CREATE TABLE IF NOT EXISTS public.house_anchor_allowed_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anchor_id UUID NOT NULL REFERENCES public.house_anchors(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(anchor_id, product_id)
);

-- 5. Enable RLS
ALTER TABLE public.house_configurator_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_anchor_allowed_products ENABLE ROW LEVEL SECURITY;

-- 6. Policies (Public Read, Seller Manage)
CREATE POLICY "Public read access for configurator settings" ON public.house_configurator_settings FOR SELECT USING (true);
CREATE POLICY "Public read access for anchors" ON public.house_anchors FOR SELECT USING (true);
CREATE POLICY "Public read access for anchor products" ON public.house_anchor_allowed_products FOR SELECT USING (true);

-- Sellers can manage their own house settings
CREATE POLICY "Sellers can manage their own house settings" ON public.house_configurator_settings FOR ALL
USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.seller_id = auth.uid()));

CREATE POLICY "Sellers can manage their own anchors" ON public.house_anchors FOR ALL
USING (EXISTS (SELECT 1 FROM public.house_configurator_settings s JOIN public.products p ON p.id = s.product_id WHERE s.id = house_id AND p.seller_id = auth.uid()));

CREATE POLICY "Sellers can manage their own anchor products" ON public.house_anchor_allowed_products FOR ALL
USING (EXISTS (SELECT 1 FROM public.house_anchors a JOIN public.house_configurator_settings s ON s.id = a.house_id JOIN public.products p ON p.id = s.product_id WHERE a.id = anchor_id AND p.seller_id = auth.uid()));

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_house_settings_product ON public.house_configurator_settings(product_id);
CREATE INDEX IF NOT EXISTS idx_house_anchors_house ON public.house_anchors(house_id);
CREATE INDEX IF NOT EXISTS idx_anchor_allowed_products_anchor ON public.house_anchor_allowed_products(anchor_id);
CREATE INDEX IF NOT EXISTS idx_anchor_allowed_products_product ON public.house_anchor_allowed_products(product_id);
