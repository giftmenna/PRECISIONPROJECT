# 🚀 Quick Start: Migrate to Supabase

## ✅ Prerequisites

You need these credentials:

### 1. Supabase Credentials
Go to [Supabase Dashboard](https://supabase.com/dashboard)
- **Project URL**: Settings → API → Project URL
- **Anon Key**: Settings → API → Project API keys → anon/public
- **Service Role Key**: Settings → API → Project API keys → service_role
- **Database URL**: Settings → Database → Connection string (URI)

### 2. Cloudinary Credentials (You already have these)
Go to [Cloudinary Dashboard](https://cloudinary.com/console)
- **Cloud Name**
- **API Key**
- **API Secret**

---

## 📝 Step-by-Step Instructions

### Step 1: Update .env File (5 minutes)

Open your `.env` file and add these variables:

```env
# SUPABASE - Replace your Neon DATABASE_URL with these
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

# SUPABASE API
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# CLOUDINARY
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
```

**Important:**
- Comment out or delete your old Neon `DATABASE_URL`
- Replace `[PROJECT-REF]` and `[PASSWORD]` with your actual values
- Keep all your other existing variables (NEXTAUTH_SECRET, etc.)

---

### Step 2: Run Migration Script (2 minutes)

```bash
# Make script executable
chmod +x migrate-to-supabase.sh

# Run migration
./migrate-to-supabase.sh
```

This will:
- ✅ Install Cloudinary
- ✅ Generate Prisma Client
- ✅ Deploy migrations to Supabase
- ✅ Sync database schema

---

### Step 3: Import Existing Data (Optional - 5 minutes)

If you have data in Neon that you want to keep:

```bash
# 1. Export from Neon
pg_dump "YOUR_NEON_DATABASE_URL" > neon_backup.sql

# 2. Import to Supabase (use DIRECT_URL from .env)
psql "YOUR_SUPABASE_DIRECT_URL" < neon_backup.sql
```

**Skip this if:**
- You're starting fresh
- You don't have important data in Neon
- You're just testing

---

### Step 4: Test Your App (5 minutes)

```bash
# Start development server
npm run dev
```

Test these features:
- ✅ User login/signup
- ✅ Group chat
- ✅ Send messages
- ✅ Reactions
- ✅ File uploads

---

## 🎉 You're Done!

Your app is now running on:
- **Database**: Supabase (500 MB free)
- **Media Storage**: Cloudinary (25 GB free)
- **Total Cost**: $0/month

---

## 🔧 Troubleshooting

### Error: "Can't reach database server"
**Solution**: Check your `DATABASE_URL` in `.env` is correct

### Error: "Migration failed"
**Solution**: Make sure you have both `DATABASE_URL` and `DIRECT_URL` in `.env`

### Error: "Cloudinary not found"
**Solution**: Run `npm install cloudinary`

### Messages not appearing instantly
**Solution**: We'll add Supabase Realtime in the next step (optional upgrade)

---

## 📞 Need Help?

Check these files:
- `MIGRATION_GUIDE.md` - Detailed migration steps
- `ENV_TEMPLATE.txt` - Environment variable template
- `src/lib/supabase.ts` - Supabase client configuration
- `src/lib/cloudinary.ts` - Cloudinary upload functions

---

## 🎯 Next Steps (Optional Upgrades)

After migration works:

1. **Add Realtime Chat** - Replace polling with instant updates
2. **Migrate Media Files** - Move existing files to Cloudinary
3. **Clean Up** - Remove Neon database after 1 week backup period

For now, just get the basic migration working! 🚀
