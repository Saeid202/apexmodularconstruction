-- Shipping requests table
CREATE TABLE IF NOT EXISTS shipping_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_reference text NOT NULL,
  origin_city   text NOT NULL,
  destination_city text NOT NULL,
  shipping_method text NOT NULL CHECK (shipping_method IN ('rail', 'sea', 'air')),
  notes         text,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Shipping documents table
CREATE TABLE IF NOT EXISTS shipping_documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id    uuid NOT NULL REFERENCES shipping_requests(id) ON DELETE CASCADE,
  file_name     text NOT NULL,
  url           text NOT NULL,
  storage_path  text NOT NULL,
  doc_type      text NOT NULL DEFAULT 'other' CHECK (doc_type IN ('commercial_invoice', 'packing_list', 'supplier_info', 'other')),
  uploaded_at   timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE shipping_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own shipping requests"
  ON shipping_requests FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own shipping documents"
  ON shipping_documents FOR ALL
  USING (
    request_id IN (
      SELECT id FROM shipping_requests WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    request_id IN (
      SELECT id FROM shipping_requests WHERE user_id = auth.uid()
    )
  );

-- Admin can see all
CREATE POLICY "Admin full access shipping requests"
  ON shipping_requests FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access shipping documents"
  ON shipping_documents FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Storage bucket for shipping documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('shipping-documents', 'shipping-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload shipping documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'shipping-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Public read shipping documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'shipping-documents');

CREATE POLICY "Users delete own shipping documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'shipping-documents' AND auth.uid() IS NOT NULL);
