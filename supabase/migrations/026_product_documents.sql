-- ============================================================
-- 026_product_documents.sql
-- Product parameter documents (PDF, Excel, Word) per product
-- ============================================================

CREATE TABLE IF NOT EXISTS product_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  url         TEXT NOT NULL,
  file_type   TEXT NOT NULL CHECK (file_type IN ('pdf', 'excel', 'word', 'other')),
  storage_path TEXT NOT NULL,
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE product_documents ENABLE ROW LEVEL SECURITY;

-- Public can read documents for active products
CREATE POLICY "Public can view product documents"
  ON product_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_id AND status = 'active'
    )
  );

-- Sellers can manage documents for their own products
CREATE POLICY "Sellers can manage own product documents"
  ON product_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_id AND seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_id AND seller_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_product_documents_product_id
  ON product_documents(product_id);
