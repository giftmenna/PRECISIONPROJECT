# 🔍 Check Admin Access

## The 401 error means you're either:

1. **Not logged in**
2. **Not logged in as admin**
3. **Your user role is not set to "admin" or "ADMIN"**

---

## ✅ Quick Fix: Login as Admin

### Option 1: Use Hardcoded Admin Account

The system has a hardcoded admin account:
- **Email**: `admin@precisionaw.com`
- **Password**: `admin123`

**Steps:**
1. Go to http://localhost:3001/auth/login
2. Login with the credentials above
3. Go to http://localhost:3001/admin/learn
4. Should work now! ✅

---

### Option 2: Update Your User Role in Database

If you want to use your own account as admin:

1. **Find your user email** (the one you're logged in with)

2. **Update role in Supabase:**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to **Table Editor** → **users** table
   - Find your user by email
   - Change `role` column to `admin` or `ADMIN`
   - Save

3. **Logout and login again**

4. **Go to admin panel**: http://localhost:3001/admin/learn

---

## 🧪 Test Your Access

### Check if you're logged in:
1. Open browser console (F12)
2. Go to http://localhost:3001
3. Check if you see your name in the navbar

### Check your role:
1. Open browser console (F12)
2. Run this in console:
```javascript
fetch('/api/auth/session')
  .then(r => r.json())
  .then(d => console.log('Your role:', d.user?.role))
```

You should see: `Your role: admin` or `Your role: ADMIN`

If you see `Your role: user` or `Your role: undefined`, you need to update your role in the database.

---

## 🎯 Recommended: Use Hardcoded Admin

For testing, use the hardcoded admin account:
- Email: `admin@precisionaw.com`
- Password: `admin123`

This will work immediately without database changes.

---

## 🔐 Security Note

The hardcoded admin is for development only. In production:
1. Remove the hardcoded admin from `authOptions.ts`
2. Create proper admin users in the database
3. Use environment variables for admin credentials
