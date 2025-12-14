import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET /api/group-chat/active-users - Get count of active users in community discussion groups
export async function GET(request: NextRequest) {
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

    // Get all active community discussion groups
    const groupChats = await prisma.groupChat.findMany({
      where: { isActive: true },
      include: {
        group_chat_members: {
          where: { is_active: true },
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                lastLoginAt: true
              }
            }
          }
        }
      }
    });

    // Calculate active users (logged in within last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = groupChats.flatMap(chat =>
      chat.group_chat_members
        .filter(member => 
          member.users?.lastLoginAt && 
          new Date(member.users.lastLoginAt) > twentyFourHoursAgo
        )
        .map(member => ({
          user: {
            id: member.users.id,
            name: member.users.name,
            email: member.users.email,
            lastLoginAt: member.users.lastLoginAt
          }
        }))
    );

    // Remove duplicates (same user in multiple groups)
    const uniqueActiveUsers = activeUsers.filter((member, index, self) =>
      index === self.findIndex(m => m.user.id === member.user.id)
    );

    return NextResponse.json({ 
      activeUsers: uniqueActiveUsers.length,
      totalGroups: groupChats.length,
      totalMembers: groupChats.reduce((sum, chat) => sum + (chat as any).group_chat_members?.length || 0, 0)
    });
  } catch (error) {
    console.error('Error fetching active users in community discussion groups:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 