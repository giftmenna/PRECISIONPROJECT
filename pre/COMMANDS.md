# 🎯 Quick Command Reference

## 📦 Installation Commands

```bash
# Install Cloudinary
npm install cloudinary

# Or use the script
chmod +x install-cloudinary.sh
./install-cloudinary.sh
```

---

## 🔄 Migration Commands

```bash
# Make migration script executable
chmod +x migrate-to-supabase.sh

# Run full migration
./migrate-to-supabase.sh

# Or run steps manually:
npx prisma generate          # Generate Prisma Client
npx prisma migrate deploy    # Deploy migrations
npx prisma db push          # Sync schema
```

---

## 💾 Data Backup & Import

```bash
# Export from Neon (replace with your actual URL)
pg_dump "postgresql://user:pass@neon.tech:5432/db" > neon_backup.sql

# Import to Supabase (use DIRECT_URL from .env)
psql "postgresql://postgres:pass@supabase.co:5432/postgres" < neon_backup.sql

# Or use environment variable
psql $DIRECT_URL < neon_backup.sql
```

---

## 🧪 Testing Commands

```bash
# Start development server
npm run dev

# Check database connection
npx prisma db pull

# View database in Prisma Studio
npx prisma studio

# Check Prisma schema
npx prisma validate
```

---

## 🔍 Debugging Commands

```bash
# Check if Cloudinary is installed
npm list cloudinary

# Check if Supabase client is installed
npm list @supabase/supabase-js

# Reinstall all packages
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 📊 Database Commands

```bash
# Reset database (CAREFUL - deletes all data!)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name migration_name

# Check migration status
npx prisma migrate status

# Format Prisma schema
npx prisma format
```

---

## 🚀 Production Commands

```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy migrations in production
npx prisma migrate deploy
```

---

## 🧹 Cleanup Commands

```bash
# Remove old Neon references (after successful migration)
# Just remove the old DATABASE_URL from .env

# Remove migration backup files
rm neon_backup.sql

# Remove old test scripts (optional)
rm check-db-connection.js
rm simple-db-test.js
```

---

## 📝 Environment Variable Commands

```bash
# Check if environment variables are loaded
node -e "console.log(process.env.DATABASE_URL)"

# Test Supabase connection
node -e "const { createClient } = require('@supabase/supabase-js'); const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); console.log('Connected!');"
```

---

## 🎨 Cloudinary Test Commands

```bash
# Test Cloudinary connection (create test-cloudinary.js first)
node test-cloudinary.js
```

Create `test-cloudinary.js`:
```javascript
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloudinary Config:', {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key ? '✅ Set' : '❌ Missing'
});
```

---

## 🔐 Security Commands

```bash
# Generate new NEXTAUTH_SECRET
openssl rand -base64 32

# Check for exposed secrets (install git-secrets first)
git secrets --scan
```

---

## 📦 Package Management

```bash
# Update all packages
npm update

# Check for outdated packages
npm outdated

# Install specific version
npm install package@version

# Remove package
npm uninstall package
```

---

## 🎯 Quick Start (Copy & Paste)

```bash
# Complete migration in one go
chmod +x migrate-to-supabase.sh && \
./migrate-to-supabase.sh && \
npm run dev
```

---

## 🆘 Emergency Rollback

If something goes wrong:

```bash
# 1. Restore old Neon DATABASE_URL in .env
# 2. Regenerate Prisma Client
npx prisma generate

# 3. Restart dev server
npm run dev
```

---

## ✅ Verification Commands

After migration, run these to verify:

```bash
# 1. Check Prisma connection
npx prisma db pull

# 2. Check if tables exist
npx prisma studio

# 3. Test app
npm run dev

# 4. Check for TypeScript errors
npm run build
```
