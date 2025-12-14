#!/bin/bash

# Fix NextAuth Configuration
# This script helps add missing NEXTAUTH_SECRET and NEXTAUTH_URL to .env

echo "🔧 NextAuth Configuration Fixer"
echo "================================"
echo ""

ENV_FILE=".env"

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env file not found!"
    echo "Creating .env file..."
    touch "$ENV_FILE"
fi

# Check if NEXTAUTH_SECRET already exists
if grep -q "NEXTAUTH_SECRET" "$ENV_FILE"; then
    echo "✅ NEXTAUTH_SECRET already exists in .env"
else
    echo "⚠️  NEXTAUTH_SECRET is missing!"
    echo ""
    echo "Generating a secure secret..."
    SECRET=$(openssl rand -base64 32)
    echo "" >> "$ENV_FILE"
    echo "# NextAuth Configuration" >> "$ENV_FILE"
    echo "NEXTAUTH_SECRET=\"$SECRET\"" >> "$ENV_FILE"
    echo "✅ Added NEXTAUTH_SECRET to .env"
fi

# Check if NEXTAUTH_URL already exists
if grep -q "NEXTAUTH_URL" "$ENV_FILE"; then
    echo "✅ NEXTAUTH_URL already exists in .env"
else
    echo "⚠️  NEXTAUTH_URL is missing!"
    echo "" >> "$ENV_FILE"
    echo "NEXTAUTH_URL=\"http://localhost:3000\"" >> "$ENV_FILE"
    echo "✅ Added NEXTAUTH_URL to .env"
fi

echo ""
echo "================================"
echo "✅ Configuration complete!"
echo ""
echo "Next steps:"
echo "1. Restart your dev server (Ctrl+C then npm run dev)"
echo "2. Clear browser cookies for localhost:3000"
echo "3. Log in again"
echo ""
echo "Your sessions should now persist across page refreshes!"
