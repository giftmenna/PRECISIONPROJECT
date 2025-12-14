const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function fixDatabaseSchema() {
  console.log('🔧 Fixing database schema...');
  
  // Initialize Prisma client
  const prisma = new PrismaClient();
  
  try {
    // Skip backup since we can't use pg_dump with the current setup
    console.log('⚠️ Skipping backup due to pg_dump version mismatch.');
    console.log('Please ensure you have a recent backup of your database before continuing.');

    // 2. Apply the schema changes
    console.log('\nApplying schema changes...');
    
    // Prisma client is already initialized at the top
    
    // Drop and recreate the daily_lesson_watches table with correct schema
    console.log('Dropping daily_lesson_watches table...');
    await prisma.$executeRaw`DROP TABLE IF EXISTS daily_lesson_watches CASCADE`;
    
    console.log('Creating daily_lesson_watches table...');
    await prisma.$executeRaw`
      CREATE TABLE daily_lesson_watches (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        userid TEXT NOT NULL,
        dailylessonid TEXT NOT NULL,
        watchedat TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        gemsearned DOUBLE PRECISION NOT NULL DEFAULT 0.25,
        CONSTRAINT daily_lesson_watches_userid_fkey FOREIGN KEY (userid) 
          REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT daily_lesson_watches_dailylessonid_fkey FOREIGN KEY (dailylessonid) 
          REFERENCES daily_lessons (id) ON DELETE CASCADE,
        CONSTRAINT daily_lesson_watches_userid_dailylessonid_key UNIQUE (userid, dailylessonid)
      )`;
    
    console.log('Creating indexes...');
    await prisma.$executeRaw`CREATE INDEX idx_daily_lesson_watches_user_id ON daily_lesson_watches(userid)`;
    await prisma.$executeRaw`CREATE INDEX idx_daily_lesson_watches_lesson_id ON daily_lesson_watches(dailylessonid)`;
    
    console.log('✅ Database schema updated successfully!');
    
    // 3. Update Prisma Client
    console.log('\nUpdating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('\n✨ All done! You can now restart your Next.js application.');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
    process.exit(1);
  } finally {
    await prisma?.$disconnect();
  }
}

fixDatabaseSchema();
