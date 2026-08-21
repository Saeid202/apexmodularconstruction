# Apply Migration - Step By Step (3 Minutes)

## ✅ Quick Fix For Constraint Error

You got this error:
```
ERROR: 23514: check constraint "profiles_role_check" of relation "profiles" is violated
```

**It's fixed now!** Just follow these 5 steps:

---

## 🚀 Step 1: Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** on the left

---

## 🚀 Step 2: Optional - Check What's In Your Database

If you want to see what roles exist (optional):

Create new query and run:
```sql
SELECT DISTINCT role FROM profiles WHERE role IS NOT NULL ORDER BY role;
```

This shows you all role values in your database.

---

## 🚀 Step 3: Clean Up Old Constraint (If Needed)

If the previous migration partially failed, run this first:

```sql
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
```

**This is safe** - it just removes the broken constraint.

---

## 🚀 Step 4: Apply The Fixed Migration

1. Click **New Query**
2. Copy the entire contents of:
   ```
   supabase/migrations/042_add_contractor_role.sql
   ```
3. Paste it into the query editor
4. Click **Run** button (top right)
5. Wait for it to complete

You should see a success message with no errors.

---

## 🚀 Step 5: Verify It Worked

Run this verification query:

```sql
-- Check constraint exists
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name='profiles' AND constraint_name='profiles_role_check';

-- Check no invalid roles
SELECT COUNT(*) 
FROM profiles 
WHERE role NOT IN ('admin', 'user', 'installer', 'contractor', 'partner', 'seller', 'agent', 'shipping_agent');
```

**Expected results:**
- First query: Shows 1 row with constraint_name = `profiles_role_check`
- Second query: Shows 0 rows (no invalid roles)

If you see these results, **you're done!** ✅

---

## 💡 What Just Happened?

The migration did this:

1. ✅ Updated any weird role values to 'user' (safe default)
2. ✅ Created a constraint that allows all your existing roles + contractor
3. ✅ Added contractor_id column to profiles
4. ✅ Added user_id column to installers
5. ✅ Created contractor_approvals table
6. ✅ Created all necessary indexes and RLS policies

---

## 🎯 Next Steps

Now that migration is done:

1. Run: `npm install`
2. Create `.env.local` file with:
   ```
   RESEND_API_KEY=your_key
   FROM_EMAIL=noreply@yourcompany.com
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
3. Run: `npm run dev`
4. Go to: `http://localhost:3000/find-installers`
5. Everything should work!

---

## ❌ Still Having Issues?

### Got "already exists" error?
Run this first:
```sql
DROP TABLE IF EXISTS contractor_approvals CASCADE;
```
Then try Step 4 again.

### Got "relation does not exist" error?
Make sure migration 041 (installers table) was applied first.

Check with:
```sql
SELECT tablename FROM pg_tables 
WHERE tablename IN ('profiles', 'installers', 'contractor_approvals');
```

All three should exist.

### Still getting constraint error after Step 4?
There might be custom roles we don't know about. Run this:
```sql
SELECT DISTINCT role FROM profiles ORDER BY role;
```

And let us know what roles you see!

---

## 📞 Need Help?

See these guides:
- **ROLE_CONSTRAINT_FIX_GUIDE.md** - Detailed explanation
- **MIGRATION_FIX_GUIDE.md** - PostgreSQL compatibility fixes
- **QUICK_START_NEXT_STEPS.md** - Full setup guide

---

**That's it! The migration should now work. 🎉**

Let me know if you hit any issues!
