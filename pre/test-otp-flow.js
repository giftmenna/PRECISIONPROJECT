const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Enable Prisma query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

async function testOTPFlow() {
  const testEmail = 'test@example.com';
  const testOTP = '123456';
  const hashedOTP = await bcrypt.hash(testOTP, 10);

  try {
    console.log('1. Cleaning up any existing test data...');
    await prisma.oTPCode.deleteMany({ where: { email: testEmail } });
    await prisma.user.deleteMany({ where: { email: testEmail } });

    console.log('2. Creating test user...');
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Test User',
        password: 'testpassword',
        emailVerified: false
      }
    });
    console.log('User created:', user);

    console.log('3. Creating OTP record...');
    const otpRecord = await prisma.oTPCode.create({
      data: {
        email: testEmail,
        codeHash: hashedOTP,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      }
    });
    console.log('OTP Record created:', otpRecord);

    console.log('4. Verifying OTP...');
    const storedOTP = await prisma.oTPCode.findFirst({
      where: { email: testEmail }
    });

    if (!storedOTP) {
      console.error('❌ OTP record not found');
      return;
    }

    console.log('Stored OTP hash:', storedOTP.codeHash);
    console.log('Expected OTP:', testOTP);
    
    const isValid = await bcrypt.compare(testOTP, storedOTP.codeHash);
    console.log('OTP validation result:', isValid);
    
    if (isValid) {
      console.log('✅ OTP verification successful!');
      
      // Update user's email verification status
      await prisma.user.update({
        where: { email: testEmail },
        data: { emailVerified: true }
      });

      // Verify the update
      const updatedUser = await prisma.user.findUnique({
        where: { email: testEmail }
      });
      console.log('Updated user verification status:', updatedUser?.emailVerified);

      // Clean up
      await prisma.oTPCode.deleteMany({ where: { email: testEmail } });
      console.log('✅ Test completed successfully!');
    } else {
      console.error('❌ OTP verification failed');
    }
  } catch (error) {
    console.error('❌ Error in test:', error);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.meta) {
      console.error('Error metadata:', error.meta);
    }
  }
}

testOTPFlow()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
