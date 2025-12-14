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
    const { userId } = await req.json();

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

    // Get the user to unban
    const userToUnban = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userToUnban) {
      return NextResponse.json({ error: "User to unban not found" }, { status: 404 });
    }

    // Check if user has a membership record
    const existingMembership = await prisma.groupChatMember.findFirst({
      where: { chat_id: id, user_id: userId }
    });

    if (!existingMembership) {
      return NextResponse.json({ error: "User membership not found" }, { status: 404 });
    }

    // Unban the user
    await prisma.groupChatMember.update({
      where: { id: existingMembership.id },
      data: {
        is_banned: false,
        banned_by: null,
        banned_at: null,
        ban_reason: null
      }
    });

    return NextResponse.json({
      success: true,
      message: `User ${userToUnban.name || userToUnban.email} has been unbanned from the group`,
      unbannedUser: {
        id: userToUnban.id,
        name: userToUnban.name,
        email: userToUnban.email
      }
    });

  } catch (error) {
    console.error("Error unbanning user:", error);
    return NextResponse.json(
      { error: "Failed to unban user" },
      { status: 500 }
    );
  }
} 