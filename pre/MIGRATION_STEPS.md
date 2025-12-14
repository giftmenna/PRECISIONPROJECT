# 🚀 Migration Steps (No Credentials Here!)

## ✅ Security First!

Your credentials are safely in your `.env` file (which is gitignored).

---

## 📋 What You Need to Do

### Step 1: Verify .env File ✅

You've already added your credentials to `.env`. Make sure it has:
- `DATABASE_URL` (Supabase pooler - port 6543)
- `DIRECT_URL` (Supabase direct - port 5432)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

And make sure your old Neon `DATABASE_URL` is commented out.

---

### Step 2: Run Migration Script

```bash
./migrate-to-supabase.sh
```

This will:
- ✅ Install Cloudinary
- ✅ Generate Prisma Client
- ✅ Deploy migrations to Supabase
- ✅ Create all your tables

---

### Step 3: Test Your App

```bash
npm run dev
```

Test:
- Login
- Group chat
- Send messages
- Reactions

---

## 🔒 Security Notes

### ✅ Protected (Safe):
- `.env` file - gitignored ✅
- All credential files - deleted ✅
- Database backups - gitignored ✅

### ⚠️ Never Commit:
- `.env` files
- Database credentials
- API keys
- Backup SQL files

---

## 🆘 Troubleshooting

### "Can't reach database"
Check your `.env` file has the correct Supabase URLs

### "Migration failed"
Make sure you have both `DATABASE_URL` and `DIRECT_URL`

### "Cloudinary not found"
Run: `npm install cloudinary`

---

## 📞 Next Steps

After migration works:
1. Test all features
2. Keep Neon as backup for 1 week
3. Plan Realtime chat upgrade (optional)

---

**Ready? Run the migration script!** 🚀
