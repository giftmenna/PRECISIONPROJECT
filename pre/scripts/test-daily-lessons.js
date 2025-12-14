const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const { sign } = require('jsonwebtoken');

async function testDailyLessons() {
  try {
    console.log('🔍 Testing daily lessons API...');
    
    // Create a test user if not exists
    const testEmail = 'test@example.com';
    let user = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: testEmail,
          password: hashedPassword,
          emailVerified: true,
          role: 'user',
        },
      });
      console.log('✅ Created test user');
    }

    // Create a JWT token for the test user
    const token = sign(
      { email: user.email, userId: user.id, role: user.role },
      process.env.NEXTAUTH_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    console.log('🔑 Generated JWT token');

    // Test the daily lessons API
    console.log('\n📡 Making request to /api/daily-lessons...');
    const response = await fetch('http://localhost:3000/api/daily-lessons', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log('📊 Response status:', response.status);
    console.log('📦 Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    console.log('\n🎉 Daily lessons API test completed successfully!');
  } catch (error) {
    console.error('❌ Error testing daily lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDailyLessons();
