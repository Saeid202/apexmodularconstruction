-- ============================================
-- Apex Modular Construction E-Commerce Platform
-- Installers Table Migration
-- ============================================
-- This migration creates the installers table for managing installation service providers

-- Create installers table
CREATE TABLE IF NOT EXISTS installers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  website TEXT,
  description TEXT,
  primary_location TEXT NOT NULL,
  service_areas TEXT[] NOT NULL DEFAULT '{}',
  service_types TEXT[] NOT NULL DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  logo_url TEXT,
  featured BOOLEAN DEFAULT false,
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS installers_status_idx ON installers(status);

-- Create index on featured for faster filtering
CREATE INDEX IF NOT EXISTS installers_featured_idx ON installers(featured);

-- Create index on service_areas for faster filtering
CREATE INDEX IF NOT EXISTS installers_service_areas_idx ON installers USING GIN(service_areas);

-- Create index on service_types for faster filtering
CREATE INDEX IF NOT EXISTS installers_service_types_idx ON installers USING GIN(service_types);

-- Create index on average_rating for sorting
CREATE INDEX IF NOT EXISTS installers_rating_idx ON installers(average_rating DESC);

-- Enable Row Level Security
ALTER TABLE installers ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view approved installers
DROP POLICY IF EXISTS "Public can view approved installers" ON installers;
CREATE POLICY "Public can view approved installers"
  ON installers FOR SELECT
  USING (status = 'approved');

-- Policy: Admins can view all installers
DROP POLICY IF EXISTS "Admins can view all installers" ON installers;
CREATE POLICY "Admins can view all installers"
  ON installers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can insert installers
DROP POLICY IF EXISTS "Admins can insert installers" ON installers;
CREATE POLICY "Admins can insert installers"
  ON installers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update installers
DROP POLICY IF EXISTS "Admins can update installers" ON installers;
CREATE POLICY "Admins can update installers"
  ON installers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can delete installers
DROP POLICY IF EXISTS "Admins can delete installers" ON installers;
CREATE POLICY "Admins can delete installers"
  ON installers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_installers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER installers_updated_at_trigger
  BEFORE UPDATE ON installers
  FOR EACH ROW
  EXECUTE FUNCTION update_installers_updated_at();
