-- Add shipping_agent role support and shipping messages

-- Add shipping_agent_id and has_unread_response to shipping_requests
ALTER TABLE shipping_requests
  ADD COLUMN IF NOT EXISTS shipping_agent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS has_unread_response boolean NOT NULL DEFAULT false;

-- Shipping request messages
CREATE TABLE IF NOT EXISTS shipping_request_messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id    uuid NOT NULL REFERENCES shipping_requests(id) ON DELETE CASCADE,
  sender_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_role   text NOT NULL CHECK (sender_role IN ('client', 'shipping_agent')),
  message       text,
  is_read       boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shipping_request_messages ENABLE ROW LEVEL SECURITY;

-- Clients can read/write messages on their own requests
CREATE POLICY "Clients manage own shipping messages"
  ON shipping_request_messages FOR ALL
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

-- Shipping agents can read/write all shipping messages
CREATE POLICY "Shipping agents manage all shipping messages"
  ON shipping_request_messages FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'shipping_agent')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'shipping_agent')
  );

-- Shipping agents can read all shipping requests
CREATE POLICY "Shipping agents read all requests"
  ON shipping_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'shipping_agent')
  );

-- Shipping agents can update status and agent assignment
CREATE POLICY "Shipping agents update requests"
  ON shipping_requests FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'shipping_agent')
  );

-- Admin full access to messages
CREATE POLICY "Admin full access shipping messages"
  ON shipping_request_messages FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
