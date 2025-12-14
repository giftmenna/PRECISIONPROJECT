const { PrismaClient } = require('@prisma/client');

// Configure Prisma client with SSL
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?sslmode=require'
    }
  }
});

async function testDailyLessons() {
  try {
    console.log('🔍 Testing daily lessons query...');
    
    // Get the current date and calculate the end of the week
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfWeek = new Date(startOfDay);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    
    console.log(`Fetching lessons from ${startOfDay} to ${endOfWeek}`);
    
    // Query daily lessons
    const lessons = await prisma.dailyLesson.findMany({
      where: {
        scheduleddate: {
          gte: startOfDay,
          lte: endOfWeek
        },
        isactive: true
      },
      orderBy: {
        scheduleddate: 'asc'
      },
      select: {
        id: true,
        title: true,
        scheduleddate: true,
        description: true,
        duration: true,
        gemsreward: true
      }
    });
    
    console.log(`✅ Found ${lessons.length} upcoming daily lessons:`);
    console.table(lessons.map(lesson => ({
      ID: lesson.id,
      Title: lesson.title,
      Date: lesson.scheduleddate.toISOString().split('T')[0],
      Duration: `${Math.floor(lesson.duration / 60)}m`,
      Gems: lesson.gemsreward
    })));
    
  } catch (error) {
    console.error('❌ Error fetching daily lessons:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testDailyLessons();
