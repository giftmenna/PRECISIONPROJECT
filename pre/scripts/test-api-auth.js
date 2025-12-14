const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sign } = require('jsonwebtoken');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testDailyLessonsAPI() {
  try {
    console.log('🔍 Testing daily lessons API with authentication...');
    
    // Get a test user (or create one if none exists)
    let user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('No users found, creating a test user...');
      user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashed_password_placeholder',
          emailVerified: true,
          role: 'user',
        },
      });
      console.log('✅ Created test user with ID:', user.id);
    } else {
      console.log('ℹ️ Using existing user:', user.email);
    }

    // Create a JWT token for the user
    const token = sign(
      { email: user.email, userId: user.id, role: user.role },
      process.env.NEXTAUTH_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    console.log('\n🔑 Generated JWT token');
    
    // Make an authenticated request to the daily lessons API
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

    console.log('\n🎉 Successfully fetched daily lessons!');
    
  } catch (error) {
    console.error('❌ Error testing daily lessons API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDailyLessonsAPI();
