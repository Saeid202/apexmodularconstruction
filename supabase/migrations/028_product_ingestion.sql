-- Table for tracking bulk ingestion batches
CREATE TABLE IF NOT EXISTS ingestion_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    file_type TEXT,
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    total_items INTEGER DEFAULT 0,
    seller_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for storing AI-extracted product drafts
CREATE TABLE IF NOT EXISTS product_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES ingestion_batches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    specifications JSONB DEFAULT '{}'::jsonb,
    category_slug TEXT,
    main_image_url TEXT,
    original_data JSONB, -- Stores the raw AI extraction for debugging
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE ingestion_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can manage their own batches"
ON ingestion_batches FOR ALL
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can manage their own drafts"
ON product_drafts FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM ingestion_batches
        WHERE ingestion_batches.id = product_drafts.batch_id
        AND ingestion_batches.seller_id = auth.uid()
    )
);
