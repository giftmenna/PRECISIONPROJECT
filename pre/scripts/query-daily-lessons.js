const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function queryDailyLessons() {
  try {
    console.log('🔍 Querying daily lessons directly from the database...');
    
    // Get the current date
    const now = new Date();
    
    // Get the start of today
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Get the end of the week
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);
    
    console.log(`Fetching lessons from ${today.toISOString()} to ${endOfWeek.toISOString()}`);
    
    // Query the daily_lessons table directly
    const lessons = await prisma.dailyLesson.findMany({
      where: {
        scheduleddate: {
          gte: today,
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
    
    console.log(`\n📅 Found ${lessons.length} upcoming daily lessons:`);
    
    if (lessons.length > 0) {
      console.table(lessons.map(lesson => ({
        ID: lesson.id,
        Title: lesson.title,
        Date: lesson.scheduleddate.toISOString().split('T')[0],
        Duration: `${Math.floor(lesson.duration / 60)}m`,
        'Gems Reward': lesson.gemsreward
      })));
    }
    
    console.log('\n🎉 Query completed successfully!');
    
  } catch (error) {
    console.error('❌ Error querying daily lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryDailyLessons();
