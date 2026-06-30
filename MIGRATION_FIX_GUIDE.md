# Migration Fix Guide

## Issue
You encountered a SQL error when applying the migration:
```
ERROR:  42601: syntax error at or near "NOT"
LINE 71: CREATE POLICY IF NOT EXISTS "Contractors can view their own installer profile"
```

## Root Cause
The `CREATE POLICY IF NOT EXISTS` syntax is only supported in PostgreSQL 15+. Your Supabase instance is running PostgreSQL 14 or earlier.

## Solution
The migration file has been fixed to use `DO` blocks with `pg_policies` checks instead of the unsupported syntax.

---

## How To Apply The Fixed Migration

### Option 1: Fresh Database (Recommended if you haven't applied it yet)

1. **Delete the old migration attempt:**
   - If you already ran it and it failed partway, you may have incomplete objects
   - You can manually clean up in Supabase if needed

2. **Apply the fixed migration:**
   - Go to Supabase Dashboard → SQL Editor
   - Create a new query
   - Copy the entire contents of `supabase/migrations/042_add_contractor_role.sql`
   - Click "Run"
   - It should complete without errors

### Option 2: Supabase CLI

```bash
# Reset migrations (if needed)
supabase migration list
supabase db reset

# Then apply the fixed migration
supabase migration up
```

### Option 3: Manual Cleanup + Apply

If the previous attempt created partial objects:

1. **In Supabase SQL Editor, run:**
```sql
-- Check what exists
SELECT schemaname, tablename FROM pg_tables WHERE tablename IN ('contractor_approvals');
SELECT indexname FROM pg_indexes WHERE tablename IN ('installers', 'contractor_approvals');
SELECT policyname FROM pg_policies WHERE tablename IN ('contractor_approvals', 'installers', 'profiles');

-- If contractor_approvals table exists but is broken, drop it:
DROP TABLE IF EXISTS contractor_approvals CASCADE;

-- Then apply the full migration
-- (Paste the contents of 042_add_contractor_role.sql)
```

2. **Then paste and run the fixed migration**

---

## What Changed In The Fix

### Before (Causes Error):
```sql
CREATE POLICY IF NOT EXISTS "Policy Name"
  ON table_name FOR SELECT
  USING (condition);
```

### After (Works on PostgreSQL 14):
```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Policy Name'
  ) THEN
    CREATE POLICY "Policy Name"
      ON table_name FOR SELECT
      USING (condition);
  END IF;
END$$;
```

This approach:
- ✅ Works on PostgreSQL 14 and earlier
- ✅ Still checks if the policy exists
- ✅ Safely handles re-running the migration
- ✅ Compatible with all Supabase versions

---

## Steps To Apply The Fixed Migration

### Step 1: Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Go to **SQL Editor**

### Step 2: Create New Query
1. Click **New Query**
2. Name it "Apply Contractor Migration 042"

### Step 3: Paste Fixed Migration
1. Copy entire contents of `supabase/migrations/042_add_contractor_role.sql`
2. Paste into the SQL Editor
3. Review the code (should see DO blocks for policies)

### Step 4: Execute
1. Click **Run** button (top right)
2. Wait for completion
3. Should see success message with no errors

### Step 5: Verify
Run this query to confirm everything was created:

```sql
-- Check tables
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'contractor_approvals';

-- Check indexes
SELECT COUNT(*) as index_count FROM pg_indexes 
WHERE tablename IN ('installers', 'contractor_approvals', 'profiles');

-- Check policies
SELECT COUNT(*) as policy_count FROM pg_policies 
WHERE tablename IN ('contractor_approvals', 'installers', 'profiles');
```

You should see:
- ✅ 1 row for contractor_approvals table
- ✅ 5 indexes created
- ✅ 7 RLS policies created

---

## If You Still Get Errors

### Error: "already exists"
This means the table/index already exists from a partial previous run.

**Solution:**
```sql
-- Drop and recreate
DROP TABLE IF EXISTS contractor_approvals CASCADE;

-- Then run the full migration again
```

### Error: "permission denied"
This means your Supabase credentials don't have enough permissions.

**Solution:**
1. Make sure you're logged in as project owner/admin
2. Try again with admin account

### Error: "relation does not exist"
This might mean the `installers` or `profiles` table doesn't exist yet.

**Solution:**
1. Make sure all previous migrations have been applied
2. Check that migration 001 and 041 (for installers table) are applied first

---

## Verification Checklist

After applying the migration, verify:

- [ ] No SQL errors during execution
- [ ] `contractor_approvals` table exists
- [ ] `contractor_id` column added to `profiles` table
- [ ] `user_id` column added to `installers` table
- [ ] All indexes created successfully
- [ ] All RLS policies created successfully
- [ ] No policies with duplicate names

---

## Troubleshooting Command

To see exactly what was created:

```sql
-- View the contractor_approvals table structure
\d contractor_approvals

-- View all policies on contractor_approvals
SELECT policyname, qual, with_check FROM pg_policies 
WHERE tablename = 'contractor_approvals';

-- View all policies on installers
SELECT policyname, qual, with_check FROM pg_policies 
WHERE tablename = 'installers';

-- View all policies on profiles
SELECT policyname, qual, with_check FROM pg_policies 
WHERE tablename = 'profiles';
```

---

## Next Steps After Successful Migration

1. ✅ Migration applied successfully
2. ✅ Run `npm install` (if not done)
3. ✅ Create `.env.local` with environment variables
4. ✅ Run `npm run dev`
5. ✅ Follow testing checklist in `QUICK_START_NEXT_STEPS.md`

---

## Questions?

If you still encounter issues:

1. Check that you're using the **latest version** of the migration file
2. Verify your Supabase account has admin permissions
3. Check if previous migrations (001, 041) are applied
4. Try the manual cleanup approach (Option 3)

The fixed migration should now work on all PostgreSQL versions 12+.

---

**Last Updated:** 2026-06-12  
**Status:** FIX APPLIED ✅
