const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function testOTPVerification() {
  const prisma = new PrismaClient();
  const testEmail = 'test@example.com';
  
  try {
    console.log('🔍 Testing OTP verification process...');
    
    // 1. Generate a test OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);
    
    console.log(`✅ Generated OTP: ${otp}`);
    
    // 2. Create a test OTP record
    await prisma.oTPCode.create({
      data: {
        email: testEmail,
        codeHash: hashedOTP,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        attemptsLeft: 3
      }
    });
    
    console.log('✅ Created OTP record in database');
    
    // 3. Retrieve the OTP record
    const otpRecord = await prisma.oTPCode.findFirst({
      where: { email: testEmail }
    });
    
    if (!otpRecord) {
      throw new Error('Failed to retrieve OTP record');
    }
    
    console.log('✅ Retrieved OTP record from database');
    
    // 4. Verify the OTP
    const isValid = await bcrypt.compare(otp, otpRecord.codeHash);
    
    if (isValid) {
      console.log('✅ OTP verification successful!');
      
      // 5. Clean up test data
      await prisma.oTPCode.deleteMany({
        where: { email: testEmail }
      });
      
      console.log('🧹 Cleaned up test data');
    } else {
      console.error('❌ OTP verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error during OTP verification test:');
    console.error(error);
    
    // Clean up any test data in case of error
    await prisma.oTPCode.deleteMany({
      where: { email: testEmail }
    });
    
  } finally {
    await prisma.$disconnect();
  }
}

testOTPVerification();
