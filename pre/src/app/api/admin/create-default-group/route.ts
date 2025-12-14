import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// POST /api/admin/create-default-group - Create a default community discussion group (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only admins can create community discussion groups
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create community discussion groups' }, { status: 403 });
    }

    // Check if default group already exists
    const existingGroup = await prisma.groupChat.findFirst({
      where: { name: 'General Community Discussion' }
    });

    if (existingGroup) {
      return NextResponse.json({ 
        message: 'Default community discussion group already exists',
        groupChat: existingGroup 
      });
    }

    // Create default group chat
    const groupChat = await prisma.groupChat.create({
      data: {
        name: 'General Community Discussion',
        description: 'A general community discussion group for all students to discuss math problems and share knowledge.',
        members: {
          create: {
            userId: user.id,
            role: 'admin'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Default community discussion group created successfully',
      groupChat 
    });
  } catch (error) {
    console.error('Error creating default community discussion group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 