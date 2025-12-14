const { PrismaClient } = require('@prisma/client');

async function checkDatabaseConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection with a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful!');
    console.log('Test query result:', result);
    
    // Test a simple user query
    const users = await prisma.user.findMany({ take: 1 });
    console.log('✅ User query successful! Found users:', users.length);
    
  } catch (error) {
    console.error('❌ Database connection error:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseConnection();
