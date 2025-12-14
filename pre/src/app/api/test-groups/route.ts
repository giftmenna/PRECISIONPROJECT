import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check if any groups exist
    const groups = await prisma.groupChat.findMany({
      include: {
        group_chat_members: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    console.log('All groups in database:', groups);

    return NextResponse.json({ 
      totalGroups: groups.length,
      groups: groups.map(g => ({
        id: g.id,
        name: g.name,
        isActive: g.isActive,
        memberCount: g.group_chat_members.length
      }))
    });
  } catch (error) {
    console.error('Test groups error:', error);
    return NextResponse.json({ error: 'Database error', details: error }, { status: 500 });
  }
} 