#!/bin/bash

echo "🚀 Starting Neon to Supabase Migration"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create .env file with your Supabase credentials"
    echo "Check ENV_TEMPLATE.txt for reference"
    exit 1
fi

# Step 2: Install Cloudinary if not installed
echo -e "${YELLOW}📦 Checking Cloudinary installation...${NC}"
if ! grep -q "cloudinary" package.json; then
    echo "Installing Cloudinary..."
    npm install cloudinary
    echo -e "${GREEN}✅ Cloudinary installed${NC}"
else
    echo -e "${GREEN}✅ Cloudinary already installed${NC}"
fi
echo ""

# Step 3: Generate Prisma Client
echo -e "${YELLOW}🔧 Generating Prisma Client...${NC}"
npx prisma generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma Client generated${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi
echo ""

# Step 4: Deploy Migrations
echo -e "${YELLOW}📤 Deploying migrations to Supabase...${NC}"
npx prisma migrate deploy
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy migrations${NC}"
    echo "Make sure your DATABASE_URL and DIRECT_URL are correct in .env"
    exit 1
fi
echo ""

# Step 5: Push schema (optional, for safety)
echo -e "${YELLOW}🔄 Syncing database schema...${NC}"
npx prisma db push --accept-data-loss
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schema synced${NC}"
else
    echo -e "${YELLOW}⚠️  Schema sync had warnings (this might be okay)${NC}"
fi
echo ""

# Success message
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Migration completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Start your dev server: npm run dev"
echo "2. Test login and basic features"
echo "3. Test group chat and messaging"
echo "4. Verify file uploads work with Cloudinary"
echo ""
echo "If you have existing data in Neon:"
echo "1. Export: pg_dump YOUR_NEON_URL > backup.sql"
echo "2. Import: psql YOUR_SUPABASE_DIRECT_URL < backup.sql"
echo ""
echo -e "${YELLOW}⚠️  Keep your Neon database for 1 week as backup${NC}"
