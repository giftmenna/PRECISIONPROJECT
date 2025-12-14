const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
      db: {
        url: process.env.DIRECT_URL || process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('🔍 Testing database connection...');
    console.log('Using URL:', process.env.DIRECT_URL ? 'DIRECT_URL' : 'DATABASE_URL');
    
    // Test connection with a simple query
    const result = await prisma.$queryRaw`SELECT current_database() as database, current_user as user`;
    console.log('✅ Database connection successful!');
    console.log('Database info:', result);
    
    // Check database tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('\n📋 Database tables:', tables.map(t => t.table_name).join(', '));
    
  } catch (error) {
    console.error('❌ Database connection error:');
    console.error(error);
    
    // Check environment variables
    console.log('\n🔍 Checking environment variables...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
