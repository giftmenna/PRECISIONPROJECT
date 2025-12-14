# 🔧 Fix Supabase Connection Issue

## ❌ Problem
Your Supabase database is not reachable. The hostname `db.zdlwtyezwtwolwfwprvj.supabase.co` is not resolving.

---

## 🎯 Solution: Get Correct Connection String

### Step 1: Go to Supabase Dashboard

1. Visit https://supabase.com/dashboard
2. Select your project: `zdlwtyezwtwolwfwprvj`
3. Check if project status shows "Active" (if paused, click to resume)

### Step 2: Get Connection Strings

Go to **Settings → Database** and look for:

#### **Connection String** section

You should see different formats. We need:

**For DATABASE_URL (Transaction Mode - Port 6543):**
```
postgresql://postgres.zdlwtyezwtwolwfwprvj:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**For DIRECT_URL (Session Mode - Port 5432):**
```
postgresql://postgres.zdlwtyezwtwolwfwprvj:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**OR it might be:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.zdlwtyezwtwolwfwprvj.supabase.co:5432/postgres
```

---

## 🔍 Check Your Connection Strings

### Current (What you have):
```
DATABASE_URL="postgresql://postgres.zdlwtyezwtwolwfwprvj:to0vmYFrbojEbjBA@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:to0vmYFrbojEbjBA@db.zdlwtyezwtwolwfwprvj.supabase.co:5432/postgres"
```

### Issues to Check:
1. **Region**: You have `aws-1-us-east-1` - should it be `aws-0-us-east-1`?
2. **Hostname**: `db.zdlwtyezwtwolwfwprvj.supabase.co` might not be correct
3. **Project Status**: Might be paused

---

## ✅ What To Do Now

### Option 1: Use Pooler for Both (Recommended)

Update your `.env`:

```env
# Use pooler for both (more reliable)
DATABASE_URL="postgresql://postgres.zdlwtyezwtwolwfwprvj:to0vmYFrbojEbjBA@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.zdlwtyezwtwolwfwprvj:to0vmYFrbojEbjBA@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

**Changes:**
- Changed `aws-1` to `aws-0`
- Use pooler hostname for both
- Port 6543 for DATABASE_URL
- Port 5432 for DIRECT_URL

### Option 2: Get Fresh Connection Strings

1. Go to Supabase Dashboard
2. Settings → Database
3. Copy the **exact** connection strings shown
4. Replace in your `.env`

---

## 🧪 Test Connection

After updating `.env`, run:

```bash
node test-supabase-connection.js
```

You should see:
```
✅ Connected successfully!
✅ Database version: PostgreSQL
✅ Connection test passed!
```

---

## 🚀 Then Run Migration

Once connection test passes:

```bash
./migrate-to-supabase.sh
```

---

## 🆘 Still Not Working?

### Check These:

1. **Project Status**
   - Dashboard → Your project
   - Should say "Active" not "Paused"
   - If paused, click to resume

2. **Password**
   - Make sure password is correct: `to0vmYFrbojEbjBA`
   - No extra spaces or characters

3. **Region**
   - Check what region your project is in
   - Connection string must match

4. **Wait Time**
   - If just created, wait 2-3 minutes
   - Project might still be provisioning

---

## 📝 Quick Fix Commands

```bash
# Test connection
node test-supabase-connection.js

# If that works, run migration
./migrate-to-supabase.sh

# If migration works, test app
npm run dev
```

---

**Most likely fix:** Change `aws-1` to `aws-0` in your connection strings!
