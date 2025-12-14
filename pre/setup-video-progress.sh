#!/bin/bash

echo "🎥 Setting up Video Progress Tracking"
echo "======================================"
echo ""

# Run the migration
echo "📝 Running database migration..."
psql "$DATABASE_URL" < migrations/add_video_progress.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully"
else
    echo "❌ Migration failed. Please check your DATABASE_URL"
    exit 1
fi

# Generate Prisma client
echo ""
echo "🔄 Generating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated successfully"
else
    echo "❌ Prisma generation failed"
    exit 1
fi

echo ""
echo "======================================"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Restart your dev server (npm run dev)"
echo "2. Video progress will now persist across page refreshes"
echo ""
echo "Features added:"
echo "- Video watch progress saved every 5 seconds"
echo "- Resume from last watched position on refresh"
echo "- Track video completion status"
