-- Add architect role and architect profile table

-- Ensure existing rows are valid before constraint change
UPDATE profiles
SET role = 'customer'
WHERE role IS NOT NULL
  AND role NOT IN (
    'admin',
    'agent',
    'architect',
    'contractor',
    'customer',
    'installer',
    'partner',
    'seller',
    'shipping_agent'
  );

-- Extend profiles role constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check,
ADD CONSTRAINT profiles_role_check CHECK (
  role IN (
    'admin',
    'agent',
    'architect',
    'contractor',
    'customer',
    'installer',
    'partner',
    'seller',
    'shipping_agent'
  )
);

-- Architect profile table
CREATE TABLE IF NOT EXISTS architects (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  firm_name TEXT,
  bio TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_architects_status ON architects(status);

ALTER TABLE architects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Architects can view own profile" ON architects;
CREATE POLICY "Architects can view own profile"
  ON architects FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Architects can update own profile" ON architects;
CREATE POLICY "Architects can update own profile"
  ON architects FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Architects can insert own profile" ON architects;
CREATE POLICY "Architects can insert own profile"
  ON architects FOR INSERT
  WITH CHECK (auth.uid() = id);
