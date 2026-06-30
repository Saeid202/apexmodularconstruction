# Role Constraint Fix Guide

## Issue
You encountered a check constraint violation:
```
ERROR: 23514: check constraint "profiles_role_check" of relation "profiles" is violated by some row
```

## Root Cause
Your `profiles` table has existing rows with role values that are not in the new constraint list. The migration tried to add a constraint that only allows: `'admin', 'user', 'installer', 'contractor'`

But your database has other role values like: `'partner'`, `'seller'`, `'agent'`, `'shipping_agent'` etc.

## Solution
The migration has been fixed to:
1. First update any invalid roles to 'user'
2. Include all existing role values in the constraint
3. Then add the constraint safely

---

## How To Apply The Fixed Migration

### Step 1: Check Current Roles (Optional)
First, let's see what roles exist in your database:

```sql
SELECT DISTINCT role FROM profiles WHERE role IS NOT NULL ORDER BY role;
```

This will show you all the role values currently in use.

### Step 2: Apply The Fixed Migration

Go to Supabase Dashboard → SQL Editor:

1. Click **New Query**
2. Copy and paste the entire contents of:
   ```
   supabase/migrations/042_add_contractor_role.sql
   ```
3. Click **Run**

The fixed migration now:
- ✅ Updates any invalid roles
- ✅ Includes all existing role types
- ✅ Safely adds the constraint
- ✅ Works even if re-run

### Step 3: Verify Success
Run this to confirm:
```sql
-- Check the constraint
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name='profiles' AND constraint_name='profiles_role_check';

-- Check all roles
SELECT DISTINCT role FROM profiles ORDER BY role;
```

You should see:
- ✅ profiles_role_check constraint exists
- ✅ All existing roles still present (and valid)

---

## What Changed In The Migration

### Added (at the beginning):
```sql
-- Update any invalid roles to 'user'
DO $$
BEGIN
  UPDATE profiles
  SET role = 'user'
  WHERE role IS NOT NULL
    AND role NOT IN ('admin', 'user', 'installer', 'contractor', 'partner', 'seller', 'agent', 'shipping_agent');
END$$;
```

### Updated constraint to include all roles:
```sql
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check,
ADD CONSTRAINT profiles_role_check CHECK (role IN (
  'admin', 'user', 'installer', 'contractor', 
  'partner', 'seller', 'agent', 'shipping_agent'
));
```

This ensures:
- ✅ No data loss
- ✅ All existing roles preserved
- ✅ New contractor role added
- ✅ Constraint applies to all valid roles

---

## If You Already Have Partial Migration

If the constraint was partially created and is causing issues:

### Option 1: Quick Fix (Recommended)
```sql
-- Remove the problematic constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Then run the full fixed migration from 042_add_contractor_role.sql
```

### Option 2: See What's Wrong
```sql
-- Check what roles caused the error
SELECT role, COUNT(*) as count 
FROM profiles 
WHERE role NOT IN ('admin', 'user', 'installer', 'contractor', 'partner', 'seller', 'agent', 'shipping_agent')
GROUP BY role;
```

Then either:
- Fix those rows: `UPDATE profiles SET role = 'user' WHERE role = 'invalid_role';`
- Or drop and recreate the constraint with a broader set of values

---

## Complete Step-By-Step Guide

### Step 1: Open Supabase
1. Go to https://app.supabase.com
2. Select your project
3. Go to **SQL Editor**

### Step 2: Check Current State (Optional but Recommended)
Create a new query:
```sql
-- See what roles exist
SELECT DISTINCT role FROM profiles WHERE role IS NOT NULL ORDER BY role;

-- Check if constraint exists
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name='profiles' AND constraint_name LIKE '%role%';
```

### Step 3: Remove Old Constraint (If Exists)
```sql
-- This is safe - IF NOT EXISTS prevents errors
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
```

### Step 4: Apply Fixed Migration
1. Create new query
2. Copy entire contents of `supabase/migrations/042_add_contractor_role.sql`
3. Paste it
4. Click **Run**
5. Wait for completion - should see success message

### Step 5: Verify
```sql
-- Verify constraint exists
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name='profiles' AND constraint_name='profiles_role_check';

-- Verify all roles are valid
SELECT COUNT(*) as total_rows, COUNT(DISTINCT role) as unique_roles
FROM profiles 
WHERE role NOT IN ('admin', 'user', 'installer', 'contractor', 'partner', 'seller', 'agent', 'shipping_agent');
```

Should return:
- ✅ profiles_role_check constraint found
- ✅ 0 rows with invalid roles

---

## Common Questions

### Q: Will this delete any data?
**A:** No. The migration only updates role values that were invalid. All other data is preserved.

### Q: What if I have custom role values?
**A:** Add them to the constraint in the migration:
```sql
ADD CONSTRAINT profiles_role_check CHECK (role IN (
  'admin', 'user', 'installer', 'contractor', 
  'partner', 'seller', 'agent', 'shipping_agent',
  'your_custom_role'
));
```

### Q: Can I run this multiple times?
**A:** Yes! The migration is idempotent and can be safely re-run.

### Q: What does the update to 'user' do?
**A:** It converts any unknown/invalid role values to 'user', which is the safest default role.

---

## Troubleshooting

### Still getting constraint error?
1. Run verification query above
2. Check if there are still invalid roles
3. Manually update them: `UPDATE profiles SET role = 'user' WHERE role = ?;`
4. Then re-run the migration

### Migration shows syntax error?
1. Make sure you have the latest version of the file
2. Check you copied the ENTIRE file (including DO blocks)
3. Try splitting the migration into smaller parts

### Constraint not showing up?
```sql
-- Check if it was created with a different name
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name='profiles';

-- Check table structure
\d profiles
```

---

## Success Checklist

After applying the migration:

- [ ] No SQL errors during execution
- [ ] profiles_role_check constraint exists
- [ ] contractor_id column added to profiles
- [ ] user_id column added to installers
- [ ] contractor_approvals table created
- [ ] All indexes created
- [ ] All RLS policies created
- [ ] No invalid roles in profiles table

---

## Next Steps After Migration Success

1. ✅ Migration applied successfully
2. ✅ Run `npm install`
3. ✅ Create `.env.local` with environment variables
4. ✅ Run `npm run dev`
5. ✅ Follow testing checklist in `QUICK_START_NEXT_STEPS.md`

---

**Last Updated:** 2026-06-12  
**Status:** FIX APPLIED ✅

This guide should resolve the constraint violation issue!
