const { PrismaClient } = require('@prisma/client');

async function resetConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Resetting database connections...');
    await prisma.$executeRaw`DISCARD ALL`;
    console.log('Database connections reset successfully');
  } catch (error) {
    console.error('Error resetting connections:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetConnection();
