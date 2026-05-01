-- Order-level file attachments (PDF, Excel) uploaded by the buyer
CREATE TABLE IF NOT EXISTS consolidation_order_attachments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID        NOT NULL REFERENCES consolidation_orders(id) ON DELETE CASCADE,
  file_name    TEXT        NOT NULL,
  storage_path TEXT        NOT NULL,
  url          TEXT        NOT NULL,
  file_type    TEXT        NOT NULL,
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consolidation_attachments_order ON consolidation_order_attachments(order_id);

ALTER TABLE consolidation_order_attachments ENABLE ROW LEVEL SECURITY;

-- Buyers can manage attachments on their own orders
CREATE POLICY "Users manage own order attachments"
  ON consolidation_order_attachments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM consolidation_orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM consolidation_orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- Agents can read all attachments (uses admin client, bypasses RLS)

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('consolidation-attachments', 'consolidation-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own consolidation attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'consolidation-attachments'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Public read consolidation attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'consolidation-attachments');

CREATE POLICY "Users delete own consolidation attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'consolidation-attachments'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );
