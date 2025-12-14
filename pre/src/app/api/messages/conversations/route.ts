import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET /api/messages/conversations - Get all conversations for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Get all conversations where user is either user1 or user2
    const conversations = await prisma.directConversation.findMany({
      where: {
        OR: [
          { user1Id: user.id },
          { user2Id: user.id }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            isRead: true
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    // Format conversations to include the other user and unread count
    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = conv.user1Id === user.id ? conv.user2 : conv.user1;
        
        // Count unread messages
        const unreadCount = await prisma.directMessage.count({
          where: {
            conversationId: conv.id,
            receiverId: user.id,
            isRead: false
          }
        });

        return {
          id: conv.id,
          otherUser,
          lastMessage: conv.messages[0] || null,
          lastMessageAt: conv.lastMessageAt,
          unreadCount,
          createdAt: conv.createdAt
        };
      })
    );

    return NextResponse.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch conversations' 
    }, { status: 500 });
  }
}