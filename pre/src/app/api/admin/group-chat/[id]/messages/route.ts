import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!admin || (admin.role !== "admin" && admin.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Get messages from the last 30 days (as per retention policy)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const messages = await prisma.groupChatMessage.findMany({
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
      orderBy: { created_at: 'desc' },
      take: 50 // Limit to recent 50 messages for admin view
    });

    // Map to match the expected format
    const formattedMessages = messages.map((message) => ({
      id: message.id,
      content: message.content,
      user_id: message.user_id,
      created_at: message.created_at.toISOString(),
      users: {
        name: message.users.name,
        email: message.users.email
      },
      is_deleted: message.is_deleted
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error("Admin fetch messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 