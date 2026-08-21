-- ============================================================
-- Installers/Partner Locator System
-- Table for managing installation partners and locating installers
-- ============================================================

-- Create installers table
CREATE TABLE IF NOT EXISTS installers (
  -- Core identification
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name          TEXT        NOT NULL,
  contact_email         TEXT        NOT NULL,
  contact_phone         TEXT        NOT NULL,
  website               TEXT,
  description           TEXT,

  -- Service details
  service_areas         TEXT[]      DEFAULT '{}',
  service_types         TEXT[]      DEFAULT '{}',
  certifications        JSONB[]     DEFAULT '{}',
  experience_years      INTEGER,

  -- Location
  primary_location      TEXT,
  address               TEXT,
  coordinates           TEXT,

  -- Business information
  logo_url              TEXT,
  featured              BOOLEAN     DEFAULT false,
  status                TEXT        NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'suspended')),
  approval_date         TIMESTAMPTZ,

  -- Ratings
  average_rating        NUMERIC(3,2) DEFAULT 0,
  total_reviews         INTEGER     DEFAULT 0,

  -- Metadata
  seller_id             UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
-- For filtering by status (approval workflow)
CREATE INDEX idx_installers_status ON installers(status);

-- For location-based searches
CREATE INDEX idx_installers_service_areas ON installers USING GIN(service_areas);

-- For featured installers
CREATE INDEX idx_installers_featured ON installers(featured) WHERE featured = true;

-- For service type filtering
CREATE INDEX idx_installers_service_types ON installers USING GIN(service_types);

-- For seller lookups
CREATE INDEX idx_installers_seller_id ON installers(seller_id);

-- ── RLS (Row Level Security) ──────────────────────────────────────────────────

ALTER TABLE installers ENABLE ROW LEVEL SECURITY;

-- Public can view approved and active installers
CREATE POLICY "Public can view approved installers"
  ON installers FOR SELECT
  USING (status IN ('approved', 'active'));

-- Installers (sellers) can view their own profile
CREATE POLICY "Installers can view own profile"
  ON installers FOR SELECT
  USING (seller_id = auth.uid());

-- Installers can update their own profile (except status and approval_date)
CREATE POLICY "Installers can update own profile"
  ON installers FOR UPDATE
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- Admins have full access
CREATE POLICY "Admin full access installers"
  ON installers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
