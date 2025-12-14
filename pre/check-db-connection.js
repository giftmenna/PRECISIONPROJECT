const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
    
    // List all tables in the public schema
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    
    console.log('\n📋 Tables in public schema:');
    console.table(tables);
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`\n👥 Total users in database: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Database connection error:');
    console.error(error);
    
    // Check environment variables
    console.log('\n🔍 Checking environment variables...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
    console.log('DIRECT_URL:', process.env.DIRECT_URL ? '✅ Set' : '❌ Not set');
    
    if (error.code === 'P1001') {
      console.log('\n💡 Tip: The database server is not reachable. Please check:');
      console.log('1. Is your Supabase project running?');
      console.log('2. Is the database URL correct in your .env file?');
      console.log('3. Have you whitelisted your IP in Supabase?');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
