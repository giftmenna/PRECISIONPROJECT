const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDailyLessons() {
  try {
    console.log('🔍 Verifying daily lessons in the database...');
    
    // Check if there are any daily lessons
    const dailyLessons = await prisma.dailyLesson.findMany({
      orderBy: { scheduleddate: 'asc' },
      select: {
        id: true,
        title: true,
        scheduleddate: true,
        isactive: true,
        _count: {
          select: { questions: true }
        }
      }
    });

    console.log('\n📊 Found daily lessons:', dailyLessons.length);
    
    if (dailyLessons.length > 0) {
      console.log('\n📅 Upcoming daily lessons:');
      dailyLessons.forEach(lesson => {
        console.log(`\n📌 ${lesson.title}`);
        console.log(`   ID: ${lesson.id}`);
        console.log(`   Scheduled: ${lesson.scheduleddate}`);
        console.log(`   Active: ${lesson.isactive ? '✅' : '❌'}`);
        console.log(`   Questions: ${lesson._count.questions}`);
      });
    } else {
      console.log('\n❌ No daily lessons found in the database.');
    }

    console.log('\n🎉 Verification complete!');
  } catch (error) {
    console.error('❌ Error verifying daily lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDailyLessons();
