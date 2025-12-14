const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const prisma = new PrismaClient();
  const email = 'nwankwochiemena71@gmail.com';
  const password = '71@gmail.COM';
  
  try {
    console.log('🔍 Creating test user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('ℹ️ User already exists. Updating password...');
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          emailVerified: true
        }
      });
      console.log('✅ User password updated successfully!');
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Test User',
          emailVerified: true,
          // Add any other required fields from your User model
          role: 'USER',
          grade: 'GRADE_10' // Adjust as needed
        }
      });
      console.log('✅ Test user created successfully!');
    }
    
    console.log('\n🔑 Login with:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
  } catch (error) {
    console.error('❌ Error creating test user:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
