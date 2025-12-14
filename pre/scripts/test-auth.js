const { PrismaClient } = require('@prisma/client');
const { sign } = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

async function getAuthToken() {
  const prisma = new PrismaClient();
  
  try {
    // Get the test user
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      throw new Error('Test user not found');
    }

    // Create a JWT token
    const token = sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    return token;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { getAuthToken };
