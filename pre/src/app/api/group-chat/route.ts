import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	return await Promise.race([
		promise,
		new Promise<T>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms))
	]);
}

// GET /api/group-chat - Get all community discussion groups for the user
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

    // Get all active groups (not just groups the user is a member of)
    const groups = await prisma.groupChat.findMany({
  where: { 
    isActive: true
  },
  include: {
    group_chat_members: {
      where: {
        is_active: true
      },
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
    },
    group_chat_messages: {
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 1
    }
  },
  orderBy: { created_at: 'desc' },
  take: 50
});

    // Map groups to include user-specific information
    const formattedGroups = groups.map(group => {
      const members = group.group_chat_members.map(member => ({
        id: member.users.id,
        name: member.users.name,
        email: member.users.email,
        avatar: member.users.avatar
      }));

      const isMember = members.some(member => member.id === user.id);
      const isBanned = group.group_chat_members.some(m => 
        m.user_id === user.id && (m as any).is_banned
      );

      return {
        id: group.id,
        name: group.name,
        description: group.description || undefined,
        avatar: group.avatar || undefined,
        members,
        memberCount: members.length,
        isMember,
        isBanned,
        lastMessage: group.group_chat_messages[0] ? {
          content: group.group_chat_messages[0].content,
          createdAt: (group.group_chat_messages[0] as any).created_at?.toISOString() || new Date().toISOString(),
          user: {
            name: (group.group_chat_messages[0] as any).users?.name || 'Unknown',
            email: (group.group_chat_messages[0] as any).users?.email || 'unknown@example.com'
          }
        } : null,
        createdAt: (group as any).created_at?.toISOString() || new Date().toISOString()
      };
    });

    return NextResponse.json({ groups: formattedGroups });
  } catch (error) {
    console.error('Error fetching community discussion groups:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/group-chat - Create a new community discussion group (admin only)
export async function POST(request: NextRequest) {
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

    // Only admins can create community discussion groups
    if (user.role !== 'admin' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can create community discussion groups' }, { status: 403 });
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    let actualUserId = user.id;
    if (user.id === "admin") {
      let adminUser = await prisma.user.findUnique({
        where: { email: "admin@precisionaw.com" },
      });

      if (!adminUser) {
        adminUser = await prisma.user.create({
          data: {
            email: "admin@precisionaw.com",
            name: "Admin",
            role: "admin",
            password: "admin123",
          },
        });
      }
      actualUserId = adminUser.id;
    }

    const groupChat = await prisma.groupChat.create({
      data: {
        name,
        description,
        group_chat_members: {
          create: {
            user_id: actualUserId,
            role: 'admin'
          }
        }
      },
      include: {
        group_chat_members: {
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

    return NextResponse.json({ groupChat });
  } catch (error) {
    console.error('Error creating community discussion group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/group-chat - Delete a community discussion group (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle hardcoded admin user
    let user;
    if (session.user.email === "admin@precisionaw.com") {
      user = {
        id: "admin",
        email: "admin@precisionaw.com",
        name: "Admin",
        role: "ADMIN"
      };
    } else {
      user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    // Only admins can delete community discussion groups
    if (user.role !== 'admin' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can delete community discussion groups' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    // Check if group exists
    const group = await prisma.groupChat.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Delete all related data first (messages, members)
    await prisma.groupChatMessage.deleteMany({
      where: { chat_id: groupId }
    });

    await prisma.groupChatMember.deleteMany({
      where: { chat_id: groupId }
    });

    // Delete the group
    await prisma.groupChat.delete({
      where: { id: groupId }
    });

    return NextResponse.json({ 
      message: 'Group deleted successfully',
      groupId 
    });
  } catch (error) {
    console.error('Error deleting community discussion group:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 