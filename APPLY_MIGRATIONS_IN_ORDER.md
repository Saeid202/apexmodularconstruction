# Apply Migrations In Correct Order

## ⚠️ The Issue
Migration 042 depends on the `installers` table, which doesn't exist yet.

**Solution:** Apply migration **041 FIRST**, then migration **042**.

---

## 🚀 Step 1: Apply Migration 041 (Creates installers table)

### Open Supabase SQL Editor
```
https://app.supabase.com → Your Project → SQL Editor
```

### Copy & Paste Migration 041
1. Click **New Query**
2. Name it: "Migration 041 - Create Installers Table"
3. Copy entire contents of: `supabase/migrations/041_create_installers_table.sql`
4. Paste into editor
5. Click **Run**
6. Wait for success ✅

**What it creates:**
- ✅ `installers` table (core system)
- ✅ Indexes for performance
- ✅ RLS policies for security

---

## 🚀 Step 2: Apply Migration 042 (Adds contractor support)

### Create New Query
1. Click **New Query**
2. Name it: "Migration 042 - Add Contractor Role"
3. Copy entire contents of: `supabase/migrations/042_add_contractor_role.sql`
4. Paste into editor
5. Click **Run**
6. Wait for success ✅

**What it creates:**
- ✅ `contractor_approvals` table
- ✅ `contractor` role support
- ✅ `contractor_id` column on profiles
- ✅ `user_id` column on installers
- ✅ All RLS policies

---

## ✅ Verify Both Migrations Applied

Run this verification query:

```sql
-- Check all tables exist
SELECT tablename FROM pg_tables 
WHERE tablename IN ('installers', 'contractor_approvals', 'profiles')
ORDER BY tablename;

-- Check columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name IN ('contractor_id');

SELECT column_name FROM information_schema.columns 
WHERE table_name = 'installers' AND column_name IN ('user_id');

-- Check constraint exists
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name='profiles' AND constraint_name='profiles_role_check';
```

**Expected results:**
- ✅ 3 tables: contractor_approvals, installers, profiles
- ✅ contractor_id column on profiles
- ✅ user_id column on installers
- ✅ profiles_role_check constraint

---

## 🎯 Common Issues & Fixes

### "relation "profiles" does not exist"
**Solution:** Make sure migration 001 was applied first (creates profiles table)

Check with:
```sql
SELECT tablename FROM pg_tables WHERE tablename = 'profiles';
```

### "relation "installers" already exists"
**Solution:** Migration 041 already applied. Skip to Step 2 (migration 042).

Check with:
```sql
SELECT tablename FROM pg_tables WHERE tablename = 'installers';
```

### "column "user_id" already exists"
**Solution:** Migration 042 already applied. You're done!

Check with:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'installers' AND column_name = 'user_id';
```

---

## 📋 Migration Dependencies

```
001 (profiles table)
    ↓
041 (installers table) 
    ↓
042 (contractor support, references installers)
```

**Order matters!** Apply them in this sequence.

---

## 🎉 After Both Migrations Complete

Run this to confirm everything is ready:

```bash
npm install
npm run dev
```

Then visit:
- `/contractor/signup` - Contractor signup page
- `/contractor/dashboard` - Contractor dashboard
- `/admin/contractors` - Admin contractor management
- `/find-installers` - Find installers page

Everything should work! ✅

---

## 📝 Migration Summary

| Migration | Creates | Depends On |
|-----------|---------|-----------|
| 041 | installers table | profiles table |
| 042 | contractor support | installers table |

---

**Status:** Apply 041 first, then 042  
**Estimated Time:** 2-3 minutes
