# Migration Corrected For Your Database Roles

## ✅ Migration Updated

The migration file has been corrected to match your **actual database roles**:

- ✅ admin
- ✅ agent
- ✅ customer (default for any invalid roles)
- ✅ partner
- ✅ seller
- ✅ shipping_agent
- ✅ contractor (NEW - added by migration)
- ✅ installer (NEW - added by migration)

---

## 🚀 Apply The Corrected Migration (3 Minutes)

### Step 1: Open Supabase SQL Editor
```
https://app.supabase.com → Your Project → SQL Editor
```

### Step 2: Clean Up Old Constraint (Safe to run)
```sql
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
```

### Step 3: Apply The Corrected Migration
1. Click **New Query**
2. Copy entire contents of: `supabase/migrations/042_add_contractor_role.sql`
3. Paste into the editor
4. Click **Run**

Wait for success message.

### Step 4: Verify It Worked
```sql
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name='profiles' AND constraint_name='profiles_role_check';
```

Should return: 1 row with `profiles_role_check`

---

## ✅ What Changed

### Old (Incorrect):
```sql
CHECK (role IN ('admin', 'user', 'installer', 'contractor', 'partner', 'seller', 'agent', 'shipping_agent'))
```
❌ Had 'user' (doesn't exist)  
❌ Missing 'customer' (you have this!)

### New (Correct):
```sql
CHECK (role IN ('admin', 'agent', 'customer', 'partner', 'seller', 'shipping_agent', 'contractor', 'installer'))
```
✅ All your existing roles included  
✅ 'contractor' and 'installer' added  
✅ No made-up roles

---

## 🎯 One Final Check

After running the migration, verify all roles are valid:

```sql
-- This should return 0 rows (no invalid roles)
SELECT COUNT(*) as invalid_role_count
FROM profiles 
WHERE role NOT IN ('admin', 'agent', 'customer', 'partner', 'seller', 'shipping_agent', 'contractor', 'installer');
```

Expected: **0** rows

---

## 🎉 You're Done!

After successful migration:

```bash
npm install
npm run dev
```

Then visit: `http://localhost:3000/find-installers`

Everything should work now! ✅

---

**Status:** Migration Ready For Your Database  
**Tested Against:** Your actual roles (admin, agent, customer, partner, seller, shipping_agent)
