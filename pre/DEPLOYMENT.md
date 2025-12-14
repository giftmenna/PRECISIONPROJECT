# Deployment Checklist for Precision Academic World

## 🚀 Pre-Deployment Checklist

### 1. Database Setup
- [ ] Create a PostgreSQL database
- [ ] Get the database connection string
- [ ] Test the connection locally

### 2. Email Setup
- [ ] Enable 2-factor authentication on Gmail
- [ ] Generate an App Password
- [ ] Test email functionality locally

### 3. Environment Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_URL` - Your deployment URL
- [ ] `NEXTAUTH_SECRET` - Secure random string (32+ characters)
- [ ] `GMAIL_USER` - Your Gmail address
- [ ] `GMAIL_APP_PASSWORD` - Gmail app password
- [ ] `EMAIL_PROVIDER` - "gmail"

### 4. Code Preparation
- [ ] All features tested locally
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors
- [ ] Database migrations ready

## 🚀 Deployment Steps

### Option 1: Using a Deployment Script
```bash
# 1. Make script executable (if not already)
chmod +x deploy.sh

# 2. Run deployment
./deploy.sh
```

### Option 2: Using the Dashboard of your hosting provider
1. Push code to GitHub
2. Connect repository to your hosting provider
3. Configure build settings
4. Set environment variables
5. Deploy

## 🔧 Post-Deployment

### 1. Environment Variables Setup
Go to your hosting provider's Dashboard → Your Project → Settings → Environment Variables

Add these variables:
```
DATABASE_URL=your-postgresql-connection-string
NEXTAUTH_URL=https://your-app.com
NEXTAUTH_SECRET=your-secret-key
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-app-password
EMAIL_PROVIDER=gmail
```

### 2. Database Migration
```bash
# Run migrations on your hosting provider's infrastructure
```

### 3. Testing
- [ ] Home page loads
- [ ] User registration works
- [ ] Email verification works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Practice sessions work
- [ ] Avatar upload works
- [ ] Admin panel accessible

## 🐛 Troubleshooting

### Common Issues:
1. **Database Connection**: Check DATABASE_URL format
2. **Email Not Working**: Verify Gmail app password
3. **Build Failures**: Check for TypeScript errors
4. **Authentication Issues**: Verify NEXTAUTH_SECRET

### Useful Commands:
```bash
# Check build locally
npm run build

# Test database connection
npx prisma db push
```

## 📞 Support

If you encounter issues:
1. Check deployment logs on your hosting provider
2. Verify environment variables
3. Test database connection
4. Check email configuration 