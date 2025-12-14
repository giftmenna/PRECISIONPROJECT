import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET /api/messages?userId=xxx - Get or create conversation with a user
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  let otherUserId: string | null = null;
  
  try {
    console.log('=== Starting GET /api/messages ===');
    
    if (!session?.user?.email) {
      console.log('No session or email found');
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    console.log('Session user email:', session.user.email);

    const { searchParams } = new URL(request.url);
    otherUserId = searchParams.get('userId');
    console.log('Other user ID from params:', otherUserId);

    if (!otherUserId) {
      console.log('No userId parameter provided');
      return NextResponse.json({ 
        error: 'userId parameter is required' 
      }, { status: 400 });
    }

    console.log('Fetching current user from database...');
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    console.log('Current user found:', currentUser ? currentUser.id : 'NOT FOUND');

    if (!currentUser) {
      console.log('Current user not found in database');
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Check if other user exists
    console.log('Fetching other user from database...');
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    });
    console.log('Other user found:', otherUser ? otherUser.id : 'NOT FOUND');

    if (!otherUser) {
      return NextResponse.json({ 
        error: 'Other user not found' 
      }, { status: 404 });
    }

    // Ensure user1Id is always the smaller ID for consistency
    const [user1Id, user2Id] = [currentUser.id, otherUserId].sort();

    console.log('Looking for conversation with:', { user1Id, user2Id, currentUserId: currentUser.id, otherUserId });

    // Find or create conversation
    let conversation;
    try {
      conversation = await prisma.directConversation.findUnique({
        where: {
          user1Id_user2Id: {
            user1Id,
            user2Id
          }
        },
        include: {
          messages: {
            where: {
              isDeleted: false
            },
            orderBy: { createdAt: 'asc' },
            include: {
              sender: {
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
    } catch (findError) {
      console.error('Error with findUnique, trying findFirst fallback:', findError);
      // Fallback to findFirst if unique constraint lookup fails
      conversation = await prisma.directConversation.findFirst({
        where: {
          AND: [
            { user1Id },
            { user2Id }
          ]
        },
        include: {
          messages: {
            where: {
              isDeleted: false
            },
            orderBy: { createdAt: 'asc' },
            include: {
              sender: {
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

    if (!conversation) {
      console.log('No existing conversation found, creating new one');
      // Create new conversation
      conversation = await prisma.directConversation.create({
        data: {
          user1Id,
          user2Id
        },
        include: {
          messages: {
            where: {
              isDeleted: false
            },
            orderBy: { createdAt: 'asc' },
            include: {
              sender: {
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

    // Mark messages as read
    await prisma.directMessage.updateMany({
      where: {
        conversationId: conversation.id,
        receiverId: currentUser.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({ 
      conversation: {
        id: conversation.id,
        otherUser,
        messages: conversation.messages
      }
    });
  } catch (error) {
    console.error('Error fetching/creating conversation:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      otherUserId,
      currentUserEmail: session?.user?.email,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorCode: (error as any)?.code,
      errorMeta: (error as any)?.meta
    });
    
    // Return more specific error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isPrismaError = (error as any)?.code?.startsWith('P');
    
    return NextResponse.json({ 
      error: 'Failed to fetch conversation',
      details: errorMessage,
      type: isPrismaError ? 'database_error' : 'server_error',
      code: (error as any)?.code
    }, { status: 500 });
  }
}

// POST /api/messages - Send a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { receiverId, content, messageType = 'text', mediaUrl, fileName, fileSize, mimeType, duration } = body;

    if (!receiverId || !content) {
      return NextResponse.json({ 
        error: 'receiverId and content are required' 
      }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Ensure user1Id is always the smaller ID for consistency
    const [user1Id, user2Id] = [currentUser.id, receiverId].sort();

    // Find or create conversation
    let conversation = await prisma.directConversation.findUnique({
      where: {
        user1Id_user2Id: {
          user1Id,
          user2Id
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.directConversation.create({
        data: {
          user1Id,
          user2Id
        }
      });
    }

    // Create message
    const message = await prisma.directMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: currentUser.id,
        receiverId,
        content,
        messageType,
        mediaUrl,
        fileName,
        fileSize,
        mimeType,
        duration
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    // Update conversation's lastMessageAt
    await prisma.directConversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() }
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ 
      error: 'Failed to send message' 
    }, { status: 500 });
  }
}