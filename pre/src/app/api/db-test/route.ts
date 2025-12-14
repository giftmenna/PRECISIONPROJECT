import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test connection with a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Test a simple user query
    const users = await prisma.user.findMany({ 
      take: 1,
      select: { id: true, email: true }
    });

    return NextResponse.json({
      success: true,
      connectionTest: result,
      user: users[0] || null,
      message: 'Database connection successful!'
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
