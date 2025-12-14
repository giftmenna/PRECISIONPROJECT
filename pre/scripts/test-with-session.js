const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const { createCookie } = require('./test-utils');

async function testWithSession() {
  try {
    console.log('🔍 Testing with session-based authentication...');
    
    // Get or create a test user
    let user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('No users found, creating a test user...');
      user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: '$2a$10$XFDJhH5gHXgH5gHXgH5gH.1q2w3e4r5t6y7u8i9o0p1a2s3d4f5g6h7j8k9l0', // hashed 'password123'
          emailVerified: true,
          role: 'user',
        },
      });
      console.log('✅ Created test user with ID:', user.id);
    } else {
      console.log('ℹ️ Using existing user:', user.email);
    }

    // Create a session for the user
    console.log('\n🔑 Creating session...');
    const session = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: null,
        role: user.role
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Create a session cookie
    const sessionCookie = await createCookie('next-auth.session-token', JSON.stringify(session));
    
    // Make a request to the API with the session cookie
    console.log('\n📡 Making request to /api/daily-lessons...');
    const response = await axios.get('http://localhost:3000/api/daily-lessons', {
      headers: {
        'Cookie': `next-auth.session-token=${sessionCookie}`
      },
      withCredentials: true
    });

    console.log('📊 Response status:', response.status);
    console.log('📦 Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.lessons) {
      console.log(`\n🎉 Successfully fetched ${response.data.lessons.length} daily lessons!`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response ? {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    } : error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testWithSession();
