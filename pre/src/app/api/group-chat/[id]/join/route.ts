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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    const groupChat = await prisma.groupChat.findUnique({
      where: { id }
    });

    if (!groupChat) {
      return NextResponse.json({ error: 'Community discussion group not found' }, { status: 404 });
    }

    if (!groupChat.isActive) {
      return NextResponse.json({ error: 'This community discussion group is not active' }, { status: 400 });
    }


    // Check if user is already a member
    const existingMembership = await prisma.groupChatMember.findFirst({
      where: {
        chat_id: id,
        user_id: user.id
      }
    });

    if (existingMembership) {
      if (existingMembership.is_banned) {
        return NextResponse.json({ 
          success: false,
          error: 'You have been banned from this group. Please contact an admin to request access.',
          groupId: id
        }, { status: 403 });
      }

      if (existingMembership.is_active) {
        return NextResponse.json({ 
          success: false,
          error: 'You are already a member of this group' 
        }, { status: 400 });
      }

      // Reactivate membership
      await prisma.groupChatMember.update({
        where: { id: existingMembership.id },
        data: { 
          is_active: true,
          left_at: null,
          is_banned: false,
          banned_by: null,
          banned_at: null,
          ban_reason: null
        }
      });
    } else {
      // Create new membership
      await prisma.groupChatMember.create({
        data: {
          chat_id: id,
          user_id: user.id,
          role: 'member',
          is_active: true
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Successfully joined the community discussion group',
      groupId: id
    });
  } catch (error) {
    console.error('Error joining community discussion group:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 });
  }
}