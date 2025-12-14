const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    // Get the first question to check its structure
    const question = await prisma.$queryRaw`SELECT * FROM math_questions LIMIT 1`;
    console.log('Question structure:', question);
    
    // Get the table columns
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'math_questions';
    `;
    
    console.log('\nTable columns:');
    console.table(columns);
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
