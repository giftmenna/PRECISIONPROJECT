import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { messageId } = await req.json();

    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if current user is admin
    if (currentUser.role !== "ADMIN" && currentUser.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get the group chat
    const groupChat = await prisma.groupChat.findUnique({
      where: { id, isActive: true }
    });

    if (!groupChat) {
      return NextResponse.json({ error: "Group chat not found" }, { status: 404 });
    }

    // Get the message
    const message = await prisma.groupChatMessage.findFirst({
      where: { 
        id: messageId,
        chat_id: id,
        is_deleted: false
      },
      include: {
        users: { select: { id: true, name: true, email: true } }
      }
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Soft delete the message
    await prisma.groupChatMessage.update({
      where: { id: messageId },
      data: { is_deleted: true }
    });

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
      deletedMessage: {
        id: message.id,
        content: message.content,
        user: message.users
      }
    });

  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
} 