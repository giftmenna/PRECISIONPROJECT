const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDailyLessons() {
  try {
    console.log('🌱 Seeding daily lessons...');

    // Clear existing data
    await prisma.dailyLessonWatch.deleteMany({});
    await prisma.dailyLessonQuestion.deleteMany({});
    await prisma.dailyLesson.deleteMany({});
    
    console.log('🧹 Cleared existing daily lessons');

    // Create sample daily lessons for the next 7 days
    const today = new Date();
    const lessons = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const lesson = await prisma.dailyLesson.create({
        data: {
          id: `dl-${i + 1}`,
          title: `Daily Math Challenge - Day ${i + 1}`,
          description: `Practice your math skills with these daily challenges! Day ${i + 1} focuses on algebra and problem-solving.`,
          videourl: 'https://example.com/math-lesson-video',
          thumbnailurl: 'https://example.com/thumbnail.jpg',
          duration: 1800, // 30 minutes
          scheduleddate: date,
          isactive: true,
          autostack: false,
          gemsreward: 5.0,
          requiredwatchduration: 300, // 5 minutes
          scheduledtime: '10:00',
          updatedat: new Date()
        }
      });
      
      lessons.push(lesson);
      console.log(`✅ Created lesson: ${lesson.title}`);
    }

    console.log('\n🎉 Successfully seeded daily lessons!');
  } catch (error) {
    console.error('Error seeding daily lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDailyLessons();
