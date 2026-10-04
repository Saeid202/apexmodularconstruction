-- Cabinet Designer: persisted cabinet-run configurations and their quote requests

CREATE TABLE IF NOT EXISTS public.cabinet_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    units JSONB NOT NULL,
    countertop_id TEXT NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'quoted', 'ordered')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link a quote request back to the exact design it was requested for
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS cabinet_design_id UUID REFERENCES public.cabinet_designs(id) ON DELETE SET NULL;

ALTER TABLE public.cabinet_designs ENABLE ROW LEVEL SECURITY;

-- Inserts happen through a server action using the service role, so RLS only
-- needs to gate direct client reads/updates of a signed-in user's own designs.
CREATE POLICY "Users can view their own cabinet designs" ON public.cabinet_designs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own cabinet designs" ON public.cabinet_designs FOR UPDATE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_cabinet_designs_user ON public.cabinet_designs(user_id);
