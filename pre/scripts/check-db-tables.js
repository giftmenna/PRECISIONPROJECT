const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection and tables...');
    
    // Test the connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Successfully connected to the database');
    
    // Get list of tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('\n📋 Database tables:');
    console.table(tables);
    
    // Check if daily_lessons table exists
    const dailyLessonsExists = tables.some(t => t.table_name === 'daily_lessons');
    
    if (dailyLessonsExists) {
      console.log('\n🔍 Checking daily_lessons table...');
      const dailyLessons = await prisma.dailyLesson.findMany({
        take: 5,
        orderBy: { scheduleddate: 'desc' },
        select: {
          id: true,
          title: true,
          scheduleddate: true,
          isactive: true
        }
      });
      
      console.log('\n📅 Sample daily lessons:');
      console.table(dailyLessons);
    } else {
      console.log('\n❌ daily_lessons table not found in the database');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
