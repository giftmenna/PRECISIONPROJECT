import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET /api/group-chat/main - Get the main community discussion group
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle hardcoded admin user
    let user;
    if (session.user.email === "admin@precisionaw.com") {
      // Create a mock user object for the hardcoded admin
      user = {
        id: "admin",
        email: "admin@precisionaw.com",
        name: "Admin",
        role: "admin"
      };
    } else {
      user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    // Get or create the main community discussion group
    let mainGroup = await prisma.groupChat.findFirst({
      where: { 
        name: 'Main Community Discussion',
        isActive: true 
      },
      include: {
        group_chat_members: {
          where: { is_active: true },
          include: {
            users: {
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

    // If no main group exists, create one
    if (!mainGroup) {
      // For hardcoded admin, we need to use a real user ID for the database
      let actualUserId = user.id;
      if (user.id === "admin") {
        // Find a real user to use as the group creator
        const realUser = await prisma.user.findFirst();
        if (!realUser) {
          return NextResponse.json({ error: 'No users found in database' }, { status: 400 });
        }
        actualUserId = realUser.id;
      }

      mainGroup = await prisma.groupChat.create({
        data: {
          name: 'Main Community Discussion',
          description: 'The main community discussion group for all students to share knowledge and collaborate on math problems.',
          isActive: true,
          group_chat_members: {
            create: {
              user_id: actualUserId,
              role: 'admin'
            }
          }
        },
        include: {
          group_chat_members: {
            where: { is_active: true },
            include: {
              users: {
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
    }

    // Map to frontend shape
    const members = (mainGroup.group_chat_members || []).map((m) => ({
      id: m.id,
      role: (m.role as 'member'|'moderator'|'admin') ?? 'member',
      user: {
        id: m.users.id,
        name: m.users.name,
        email: m.users.email,
        avatar: m.users.avatar || undefined,
      }
    }));

    // Check if the current user is a member (admin is always considered a member)
    const isMember = user.id === "admin" || members.some(member => member.user.id === user.id);

    return NextResponse.json({ 
      groupChat: {
        id: mainGroup.id,
        name: mainGroup.name,
        description: mainGroup.description ?? undefined,
        members,
        isMember
      }
    });
  } catch (error) {
    console.error('Error fetching main community discussion group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 