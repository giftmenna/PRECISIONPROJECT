import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found' 
      }, { status: 404 });
    }

    // Check if the group exists
    const groupChat = await prisma.groupChat.findUnique({
      where: { id }
    });

    if (!groupChat) {
      return NextResponse.json({ 
        success: false,
        error: 'Group not found' 
      }, { status: 404 });
    }

    // Check if user is a member
    const member = await prisma.groupChatMember.findFirst({
      where: {
        chat_id: id,
        user_id: user.id
      }
    });

    if (!member) {
      return NextResponse.json({
        success: false,
        error: 'You are not a member of this group' 
      }, { status: 400 });
    }

    // If already left, return success
    if (!member.is_active) {
      return NextResponse.json({ 
        success: true,
        message: 'You have already left this group',
        groupId: id
      });
    }

    // Update member status to inactive
    await prisma.groupChatMember.update({
      where: { id: member.id },
      data: {
        is_active: false,
        left_at: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Successfully left the group',
      groupId: id
    });

  } catch (error) {
    console.error('Error leaving group:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to leave group' 
    }, { status: 500 });
  }
}