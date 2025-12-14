# Environment Variables Setup Guide

## Critical Issue: Missing NextAuth Configuration

Your application is logging users out on refresh because **NEXTAUTH_SECRET** and **NEXTAUTH_URL** are missing from your `.env` file.

## Required Environment Variables

Add these to your `/Users/chiemenanwankwo/Desktop/officicialprecisionaww/pre/.env` file:

```bash
# ============================================
# NEXTAUTH CONFIGURATION (REQUIRED!)
# ============================================
NEXTAUTH_SECRET="your-super-secret-key-here-minimum-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"

# ============================================
# DATABASE CONFIGURATION
# ============================================
# For DATABASE_URL (port 6543 - pooler with pgbouncer)
DATABASE_URL="postgresql://postgres.zdlwtyezwtwolwfwprvj:to0vmYFrbojEbjBA@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# For DIRECT_URL (port 5432 - direct connection)
DIRECT_URL="postgresql://postgres:to0vmYFrbojEbjBA@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

## How to Generate NEXTAUTH_SECRET

Run this command in your terminal:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET` value.

## Why This Fixes the Problem

1. **NEXTAUTH_SECRET** - Used to encrypt/decrypt JWT session tokens
   - Without it, NextAuth cannot decrypt existing sessions
   - Causes "JWEDecryptionFailed" errors
   - Results in automatic logout on page refresh

2. **NEXTAUTH_URL** - Base URL of your application
   - Required for proper callback URLs
   - Prevents redirect issues

## Steps to Fix

1. Open `/Users/chiemenanwankwo/Desktop/officicialprecisionaww/pre/.env`
2. Add the `NEXTAUTH_SECRET` and `NEXTAUTH_URL` variables
3. Generate a secure secret using the openssl command above
4. Restart your development server (`npm run dev`)
5. Clear your browser cookies for localhost:3000
6. Log in again

## After Adding These Variables

- Sessions will persist across page refreshes
- API calls will work correctly
- Users won't be logged out unexpectedly
- The JWT decryption errors will disappear

## Production Deployment

- Set `NEXTAUTH_URL` to your production domain (e.g., `https://yourdomain.com`)
- Use a different, secure `NEXTAUTH_SECRET` (never reuse development secrets)
- Add these as environment variables in your hosting platform's dashboard
