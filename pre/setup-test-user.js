const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function setupTestUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Setting up test user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('71@gmail.COM', 10);
    
    // Create the user
    const user = await prisma.user.upsert({
      where: { email: 'nwankwochiemena71@gmail.com' },
      update: {
        password: hashedPassword,
        emailVerified: true,
        name: 'Test User',
        role: 'USER',
        grade: 'GRADE_10'
      },
      create: {
        email: 'nwankwochiemena71@gmail.com',
        password: hashedPassword,
        name: 'Test User',
        emailVerified: true,
        role: 'USER',
        grade: 'GRADE_10'
      },
    });
    
    console.log('✅ Test user created/updated successfully!');
    console.log('\n🔑 Login with:');
    console.log('Email: nwankwochiemena71@gmail.com');
    console.log('Password: 71@gmail.COM');
    
  } catch (error) {
    console.error('❌ Error setting up test user:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestUser();
