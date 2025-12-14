# Neon to Supabase Migration Guide

## 🎯 Step 1: Backup Your Neon Database

Run this command to backup your current data:

```bash
# Replace with your actual Neon connection string
pg_dump "YOUR_NEON_DATABASE_URL" > neon_backup.sql
```

---

## 🔧 Step 2: Update Environment Variables

Update your `.env` file with these new variables:

```env
# ============================================
# SUPABASE DATABASE (Replace Neon)
# ============================================
# Get this from: Supabase Dashboard → Settings → Database → Connection String (URI)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

# ============================================
# SUPABASE API (For Realtime & Storage)
# ============================================
# Get these from: Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# ============================================
# CLOUDINARY (For Media Files)
# ============================================
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"

# ============================================
# KEEP THESE (Already in your project)
# ============================================
# NEXTAUTH_SECRET, NEXTAUTH_URL, etc.
```

**IMPORTANT:** 
- Remove or comment out your old `DATABASE_URL` from Neon
- The `DATABASE_URL` uses port 6543 (pooler) for better connection management
- The `DIRECT_URL` uses port 5432 (direct) for migrations

---

## 🗄️ Step 3: Run Prisma Migrations

```bash
# 1. Generate Prisma Client with new connection
npx prisma generate

# 2. Deploy migrations to Supabase
npx prisma migrate deploy

# 3. Verify connection
npx prisma db push
```

---

## 📥 Step 4: Import Your Data

```bash
# Import your backup to Supabase
# Replace with your Supabase DIRECT_URL (port 5432)
psql "YOUR_SUPABASE_DIRECT_URL" < neon_backup.sql
```

---

## ✅ Step 5: Test Your Application

```bash
# Start dev server
npm run dev

# Test these features:
# - User login
# - Group chat
# - Sending messages
# - Reactions
# - File uploads (will use Cloudinary)
```

---

## 🧹 Step 6: Clean Up Neon References

After confirming everything works, you can:

1. **Keep Neon as backup for 1 week** (recommended)
2. **Delete Neon project** after you're confident
3. **Remove old connection strings** from `.env`

---

## 🚨 Troubleshooting

### Connection Error
```
Error: P1001: Can't reach database server
```
**Solution:** Check your `DATABASE_URL` and `DIRECT_URL` are correct

### Migration Error
```
Error: Migration failed
```
**Solution:** Use `DIRECT_URL` (port 5432) for migrations, not pooler (6543)

### Import Error
```
Error: relation already exists
```
**Solution:** Your tables already exist. Skip import or drop tables first.

---

## 📞 Need Help?

If you encounter any issues:
1. Check Supabase Dashboard → Database → Logs
2. Verify your connection strings
3. Make sure you're using the correct ports (6543 for app, 5432 for migrations)
