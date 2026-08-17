-- Add affiliate role and affiliate profile table

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
    'shipping_agent',
    'affiliate'
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
    'shipping_agent',
    'affiliate'
  )
);

-- Affiliate profile table
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  referral_code TEXT UNIQUE,
  coupon_code TEXT UNIQUE,
  total_earned NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  available_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_sales NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_orders INTEGER NOT NULL DEFAULT 0,
  partner_level TEXT NOT NULL DEFAULT 'Bronze',
  partner_rank TEXT NOT NULL DEFAULT 'Newcomer',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Affiliate commissions tracking table
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  sale_amount NUMERIC(10,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Affiliate payouts tracking table
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payout_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_id ON affiliate_payouts(affiliate_id);

-- Enable RLS
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- RLS policies for affiliates table
DROP POLICY IF EXISTS "Affiliates can view own profile" ON affiliates;
CREATE POLICY "Affiliates can view own profile"
  ON affiliates FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Affiliates can update own profile" ON affiliates;
CREATE POLICY "Affiliates can update own profile"
  ON affiliates FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Affiliates can insert own profile" ON affiliates;
CREATE POLICY "Affiliates can insert own profile"
  ON affiliates FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS policies for affiliate_commissions table
DROP POLICY IF EXISTS "Affiliates can view own commissions" ON affiliate_commissions;
CREATE POLICY "Affiliates can view own commissions"
  ON affiliate_commissions FOR SELECT
  USING (auth.uid() = affiliate_id);

-- RLS policies for affiliate_payouts table
DROP POLICY IF EXISTS "Affiliates can view own payouts" ON affiliate_payouts;
CREATE POLICY "Affiliates can view own payouts"
  ON affiliate_payouts FOR SELECT
  USING (auth.uid() = affiliate_id);

DROP POLICY IF EXISTS "Affiliates can request own payouts" ON affiliate_payouts;
CREATE POLICY "Affiliates can request own payouts"
  ON affiliate_payouts FOR INSERT
  WITH CHECK (auth.uid() = affiliate_id);

-- Trigger to automatically create an affiliate record and sync auth metadata when profiles role is set to 'affiliate'
CREATE OR REPLACE FUNCTION public.handle_profile_role_update()
RETURNS TRIGGER AS $$
DECLARE
  clean_name TEXT;
  ref_code TEXT;
  coup_code TEXT;
BEGIN
  -- Check if the role is 'affiliate'
  IF NEW.role = 'affiliate' AND (TG_OP = 'INSERT' OR OLD.role IS NULL OR OLD.role <> 'affiliate') THEN
    
    -- Update auth.users metadata if it exists to sync the role
    UPDATE auth.users
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'affiliate')
    WHERE id = NEW.id;

    -- Ensure a record exists in affiliates table
    IF NOT EXISTS (SELECT 1 FROM public.affiliates WHERE id = NEW.id) THEN
      -- Generate clean name for codes
      clean_name := LOWER(REGEXP_REPLACE(COALESCE(NEW.full_name, 'partner'), '[^a-z0-9]', '', 'g'));
      IF clean_name = '' THEN
        clean_name := 'partner';
      END IF;
      
      -- Generate unique referral code
      ref_code := clean_name || FLOOR(100 + RANDOM() * 900)::TEXT;
      -- Ensure uniqueness
      WHILE EXISTS (SELECT 1 FROM public.affiliates WHERE referral_code = ref_code) LOOP
        ref_code := clean_name || FLOOR(100 + RANDOM() * 900)::TEXT;
      END LOOP;
      
      -- Generate coupon code
      coup_code := 'APEX-' || UPPER(clean_name);
      -- Ensure uniqueness
      WHILE EXISTS (SELECT 1 FROM public.affiliates WHERE coupon_code = coup_code) LOOP
        coup_code := 'APEX-' || UPPER(clean_name) || FLOOR(10 + RANDOM() * 90)::TEXT;
      END LOOP;

      -- Insert into affiliates table
      INSERT INTO public.affiliates (
        id,
        full_name,
        email,
        referral_code,
        coupon_code,
        total_earned,
        available_balance,
        total_sales,
        total_orders,
        partner_level,
        partner_rank,
        status,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        COALESCE(NEW.full_name, 'Affiliate Partner'),
        COALESCE(NEW.email, ''),
        ref_code,
        coup_code,
        0.00,
        0.00,
        0.00,
        0,
        'Bronze',
        'Newcomer',
        'active',
        NOW(),
        NOW()
      ) ON CONFLICT (id) DO NOTHING;
    END IF;

  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_role_update ON public.profiles;
CREATE TRIGGER on_profile_role_update
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_role_update();

