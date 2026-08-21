-- Migration: 034_saved_configurations.sql
-- Support for saving and quoting configurator builds

-- 1. Saved Configurations Table
-- This stores a snapshot of a user's building customization
CREATE TABLE IF NOT EXISTS public.saved_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE, -- The House
    selections JSONB NOT NULL, -- Map of anchor_id -> product_id
    total_price DECIMAL(12, 2) NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'quoted', 'ordered')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Link Inquiries/Orders to Configurations
-- Adding a column to existing tables to reference a saved build
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS configuration_id UUID REFERENCES public.saved_configurations(id) ON DELETE SET NULL;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS configuration_id UUID REFERENCES public.saved_configurations(id) ON DELETE SET NULL;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS configuration_id UUID REFERENCES public.saved_configurations(id) ON DELETE SET NULL;

-- 3. Enable RLS
ALTER TABLE public.saved_configurations ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Users can view their own configurations" ON public.saved_configurations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own configurations" ON public.saved_configurations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can view configurations linked to their products" ON public.saved_configurations FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.products p
        WHERE p.id = product_id
        AND p.seller_id = auth.uid()
    )
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_saved_configs_user ON public.saved_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_configs_product ON public.saved_configurations(product_id);
