-- Add contractor role support
-- Enables contractors to sign up and be tracked through installer profiles

-- 0. First, check and fix any existing invalid roles
-- Update any roles that don't match our allowed values to 'customer' (safe default)
DO $$
BEGIN
  UPDATE profiles
  SET role = 'customer'
  WHERE role IS NOT NULL
    AND role NOT IN ('admin', 'agent', 'customer', 'partner', 'seller', 'shipping_agent', 'contractor', 'installer');
END$$;

-- 1. Update profiles table: add contractor role and contractor_id field
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check,
ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'agent', 'customer', 'partner', 'seller', 'shipping_agent', 'contractor', 'installer'));

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS contractor_id UUID REFERENCES installers(id) ON DELETE SET NULL;

-- 2. Update installers table: link installer profile to user account
ALTER TABLE installers
ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Create contractor_approvals table for tracking signup requests
CREATE TABLE IF NOT EXISTS contractor_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id UUID NOT NULL REFERENCES installers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS installers_user_id_idx ON installers(user_id);
CREATE INDEX IF NOT EXISTS contractor_approvals_status_idx ON contractor_approvals(status);
CREATE INDEX IF NOT EXISTS contractor_approvals_installer_id_idx ON contractor_approvals(installer_id);
CREATE INDEX IF NOT EXISTS profiles_contractor_role_idx ON profiles(role) WHERE role = 'contractor';
CREATE INDEX IF NOT EXISTS profiles_contractor_id_idx ON profiles(contractor_id);

-- 5. Set up RLS policies for contractor_approvals table
ALTER TABLE contractor_approvals ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage all approval requests
CREATE POLICY "Admins can view all contractor approvals"
  ON contractor_approvals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can update contractor approvals"
  ON contractor_approvals FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

-- Contractors can view their own approval status
CREATE POLICY "Contractors can view their own approval"
  ON contractor_approvals FOR SELECT
  USING (installer_id IN (
    SELECT contractor_id FROM profiles
    WHERE profiles.id = auth.uid()
  ));

-- 6. Update RLS policies for installers table to handle contractors
-- Contractors can view and edit their own installer profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Contractors can view their own installer profile'
  ) THEN
    CREATE POLICY "Contractors can view their own installer profile"
      ON installers FOR SELECT
      USING (
        user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Contractors can update their own installer profile'
  ) THEN
    CREATE POLICY "Contractors can update their own installer profile"
      ON installers FOR UPDATE
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END$$;

-- Approved installers/contractors are publicly readable
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public can view approved installers'
  ) THEN
    CREATE POLICY "Public can view approved installers"
      ON installers FOR SELECT
      USING (
        approved = true
        OR user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;
END$$;

-- 7. Update RLS policies for profiles table to handle contractors
-- Contractors can only view and edit their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Contractors can view their own profile'
  ) THEN
    CREATE POLICY "Contractors can view their own profile"
      ON profiles FOR SELECT
      USING (
        id = auth.uid()
        OR role = 'contractor' AND contractor_id IS NOT NULL
        OR EXISTS (
          SELECT 1 FROM profiles AS p
          WHERE p.id = auth.uid()
          AND p.role = 'admin'
        )
      );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Contractors can update their own profile'
  ) THEN
    CREATE POLICY "Contractors can update their own profile"
      ON profiles FOR UPDATE
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END$$;

-- 8. Add trigger to automatically update contractor_approvals.updated_at
CREATE OR REPLACE FUNCTION update_contractor_approvals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contractor_approvals_updated_at_trigger ON contractor_approvals;
CREATE TRIGGER contractor_approvals_updated_at_trigger
  BEFORE UPDATE ON contractor_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_contractor_approvals_updated_at();

-- 9. Add comment for documentation
COMMENT ON TABLE contractor_approvals IS 'Tracks contractor/installer signup requests and approval status';
COMMENT ON COLUMN contractor_approvals.installer_id IS 'Reference to the installer profile requesting contractor status';
COMMENT ON COLUMN contractor_approvals.status IS 'Approval status: pending, approved, or rejected';
COMMENT ON COLUMN contractor_approvals.reviewed_by IS 'Admin user who reviewed the request';
COMMENT ON COLUMN profiles.contractor_id IS 'Links contractor profile to installer profile';
COMMENT ON COLUMN installers.user_id IS 'Links installer profile to their user account in auth.users';
