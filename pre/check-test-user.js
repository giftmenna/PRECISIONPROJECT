const { PrismaClient } = require('@prisma/client');

async function checkTestUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking for test user...');
    
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { email: 'nwankwochiemena71@gmail.com' }
    });
    
    if (user) {
      console.log('✅ Test user found!');
      console.log('\nUser Details:');
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Email Verified: ${user.emailVerified}`);
      console.log(`Role: ${user.role}`);
      console.log(`Created At: ${user.createdAt}`);
      
      // Verify password
      const bcrypt = require('bcryptjs');
      const isPasswordValid = await bcrypt.compare('71@gmail.COM', user.password);
      console.log(`\nPassword Verification: ${isPasswordValid ? '✅ Valid' : '❌ Invalid'}`);
    } else {
      console.log('❌ Test user not found');
    }
    
  } catch (error) {
    console.error('❌ Error checking test user:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTestUser();
