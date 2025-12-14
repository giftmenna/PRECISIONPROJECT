const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function resetSchema() {
  console.log('🔧 Resetting database schema...');
  
  try {
    // 1. Drop the database (this will remove all data!)
    console.log('Dropping existing database schema...');
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
    
    // 2. Push the schema
    console.log('\nPushing new schema...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    
    // 3. Generate the Prisma Client
    console.log('\nGenerating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('\n✅ Database schema reset complete!');
    console.log('✨ You can now restart your Next.js application.');
    
  } catch (error) {
    console.error('❌ Error resetting schema:', error);
    process.exit(1);
  }
}

resetSchema();
