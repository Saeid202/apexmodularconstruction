-- ============================================================
-- 025_order_requests.sql
-- Adds "require_order_request" toggle to products and creates
-- the order_requests table with RLS policies.
-- ============================================================

-- 1. Add toggle column to products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS require_order_request BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Order requests table
CREATE TABLE IF NOT EXISTS order_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number  TEXT NOT NULL UNIQUE,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  seller_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  buyer_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- buyer-supplied fields
  quantity        INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  message         TEXT,
  contact_name    TEXT NOT NULL,
  contact_email   TEXT NOT NULL,
  contact_phone   TEXT,
  shipping_address JSONB NOT NULL,
  -- status
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'accepted', 'rejected')),
  -- snapshot of product at time of request
  product_name    TEXT NOT NULL,
  product_price   NUMERIC(10,2),
  variant_code    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. RLS
ALTER TABLE order_requests ENABLE ROW LEVEL SECURITY;

-- Buyers can insert their own requests
CREATE POLICY "Buyers can create order requests"
  ON order_requests FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

-- Buyers can read their own requests
CREATE POLICY "Buyers can read own order requests"
  ON order_requests FOR SELECT
  USING (buyer_id = auth.uid());

-- Sellers can read requests for their products
CREATE POLICY "Sellers can read their product requests"
  ON order_requests FOR SELECT
  USING (seller_id = auth.uid());

-- Sellers can update status of their requests
CREATE POLICY "Sellers can update request status"
  ON order_requests FOR UPDATE
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- Admins (service role) bypass RLS — handled by admin client

-- 4. Index for fast seller/buyer lookups
CREATE INDEX IF NOT EXISTS idx_order_requests_seller_id ON order_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_order_requests_buyer_id  ON order_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_order_requests_product_id ON order_requests(product_id);
