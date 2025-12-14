import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET /api/group-chat/[id]/messages - Get messages from a community discussion group
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Handle hardcoded admin user
    let user;
    if (session.user.email === "admin@precisionaw.com") {
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
        return NextResponse.json({ 
          success: false,
          error: 'User not found' 
        }, { status: 404 });
      }
    }

    // For hardcoded admin, skip membership check
    if (user.id !== "admin") {
      // Check if user is a member of this community discussion group
      const membership = await prisma.groupChatMember.findFirst({
        where: {
          chat_id: id,
          user_id: user.id,
          is_active: true
        }
      });

      if (!membership) {
        return NextResponse.json({ 
          success: false,
          error: 'Not a member of this community discussion group' 
        }, { status: 403 });
      }
    }

    // Get messages from the last 30 days (as per retention policy)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const rawMessages = await prisma.groupChatMessage.findMany({
      where: {
        chat_id: id,
        is_deleted: false,
        created_at: { gte: thirtyDaysAgo }
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
      },
      orderBy: { created_at: 'asc' }
    });

    // Fetch reply information for messages that have reply_to_message_id
    const messageIds = rawMessages.filter((m: any) => m.reply_to_message_id).map((m: any) => m.reply_to_message_id!);
    const replyMessages = messageIds.length > 0 ? await prisma.groupChatMessage.findMany({
      where: { id: { in: messageIds } },
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
    }) : [];
    
    const replyMap = new Map(replyMessages.map((m: any) => [m.id, m]));

    // Map to frontend shape
    const messages = rawMessages.map((m: any) => {
      const replyToMsg: any = m.reply_to_message_id ? replyMap.get(m.reply_to_message_id) : null;
      
      return {
        id: m.id,
        content: m.content,
        messageType: (m.message_type as 'text'|'image'|'voice'|'sticker') ?? 'text',
        mediaUrl: m.media_url ?? undefined,
        mediaDuration: m.media_duration ?? undefined,
        createdAt: m.created_at?.toISOString(),
        user: {
          id: m.users.id,
          name: m.users.name,
          email: m.users.email,
          avatar: m.users.avatar ?? undefined,
        },
        ...(replyToMsg && replyToMsg.users && {
          replyTo: {
            messageId: replyToMsg.id,
            content: replyToMsg.content,
            user: {
              id: replyToMsg.users.id,
              name: replyToMsg.users.name,
            }
          }
        })
      };
    });

    return NextResponse.json({ 
      success: true,
      messages 
    });
  } catch (error) {
    console.error('Error fetching community discussion messages:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// POST /api/group-chat/[id]/messages - Send a message to a community discussion group
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Handle hardcoded admin user
    let user;
    if (session.user.email === "admin@precisionaw.com") {
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
        return NextResponse.json({ 
          success: false,
          error: 'User not found' 
        }, { status: 404 });
      }
    }

    // For hardcoded admin, skip membership check
    if (user.id !== "admin") {
      // Check if user is a member of this community discussion group
      const membership = await prisma.groupChatMember.findFirst({
        where: {
          chat_id: id,
          user_id: user.id,
          is_active: true
        }
      });

      if (!membership) {
        return NextResponse.json({ 
          success: false,
          error: 'Not a member of this community discussion group' 
        }, { status: 403 });
      }
    }

    const body = await request.json();
    const { content, messageType = 'text', mediaUrl, mediaDuration, replyToMessageId } = body;
    
    console.log('Received message data:', { content, messageType, mediaUrl, mediaDuration, replyToMessageId });

    if (!content) {
      return NextResponse.json({ 
        success: false,
        error: 'Message content is required' 
      }, { status: 400 });
    }

    // For hardcoded admin, we need to use a real user ID for the database
    let actualUserId = user.id;
    if (user.id === "admin") {
      // Find a real user to use as the message sender
      const realUser = await prisma.user.findFirst();
      if (!realUser) {
        return NextResponse.json({ 
          success: false,
          error: 'No users found in database' 
        }, { status: 400 });
      }
      actualUserId = realUser.id;
    }

    console.log('Creating message with data:', {
      chat_id: id,
      user_id: actualUserId,
      content,
      message_type: messageType,
      media_url: mediaUrl,
      media_duration: mediaDuration,
      reply_to_message_id: replyToMessageId
    });

    const created = await prisma.groupChatMessage.create({
      data: {
        chat_id: id,
        user_id: actualUserId,
        content,
        message_type: messageType,
        media_url: mediaUrl,
        media_duration: mediaDuration,
        reply_to_message_id: replyToMessageId
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
    });

    // Fetch reply information if this is a reply
    let replyToMsg: any = null;
    if (replyToMessageId) {
      replyToMsg = await prisma.groupChatMessage.findUnique({
        where: { id: replyToMessageId },
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
      });
    }

    // Update the community discussion group's updated_at timestamp
    await prisma.groupChat.update({
      where: { id },
      data: { updated_at: new Date() }
    });

    const message = {
      id: created.id,
      content: created.content,
      messageType: (created.message_type as 'text'|'image'|'voice'|'sticker') ?? 'text',
      mediaUrl: created.media_url ?? undefined,
      mediaDuration: created.media_duration ?? undefined,
      createdAt: created.created_at?.toISOString(),
      user: {
        id: created.users.id,
        name: created.users.name,
        email: created.users.email,
        avatar: created.users.avatar ?? undefined,
      },
      ...(replyToMsg && replyToMsg.users && {
        replyTo: {
          messageId: replyToMsg.id,
          content: replyToMsg.content,
          user: {
            id: replyToMsg.users.id,
            name: replyToMsg.users.name,
          }
        }
      })
    };

    return NextResponse.json({ 
      success: true,
      message 
    });
  } catch (error) {
    console.error('Error sending message to community discussion group:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}