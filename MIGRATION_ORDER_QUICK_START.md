# Migration Order - Quick Start (2 Minutes)

## 🚀 The Fix: Apply 2 Migrations In Order

**Problem:** installers table doesn't exist  
**Solution:** Apply migration 041 first, then 042

---

## ⚡ Super Quick Steps

### 1️⃣ Go to Supabase SQL Editor
```
https://app.supabase.com → Your Project → SQL Editor
```

### 2️⃣ Apply Migration 041
1. **New Query**
2. Copy: `supabase/migrations/041_create_installers_table.sql`
3. Paste and **Run**
4. Wait for ✅

### 3️⃣ Apply Migration 042
1. **New Query**
2. Copy: `supabase/migrations/042_add_contractor_role.sql`
3. Paste and **Run**
4. Wait for ✅

### 4️⃣ Verify (Optional)
```sql
SELECT tablename FROM pg_tables 
WHERE tablename IN ('installers', 'contractor_approvals');
```
Should show 2 tables.

---

## ✅ Done!

Both migrations applied successfully! 🎉

Now run:
```bash
npm install
npm run dev
```

Visit: `http://localhost:3000/find-installers`

---

**Order matters!**  
041 → then → 042

**Time:** 2 minutes
