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
    const { userId, reason } = await req.json();

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

    // Get the user to ban
    const userToBan = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userToBan) {
      return NextResponse.json({ error: "User to ban not found" }, { status: 404 });
    }

    // Check if user is already a member
    const existingMembership = await prisma.groupChatMember.findFirst({
      where: { chat_id: id, user_id: userId }
    });

    if (!existingMembership) {
      return NextResponse.json({ error: "User is not a member of this group" }, { status: 400 });
    }

    // Ban the user
    await prisma.groupChatMember.update({
      where: { id: existingMembership.id },
      data: {
        is_active: false,
        is_banned: true,
        banned_by: currentUser.id,
        banned_at: new Date(),
        ban_reason: reason || "Banned by admin"
      }
    });

    return NextResponse.json({
      success: true,
      message: `User ${userToBan.name || userToBan.email} has been banned from the group`,
      bannedUser: {
        id: userToBan.id,
        name: userToBan.name,
        email: userToBan.email
      }
    });

  } catch (error) {
    console.error("Error banning user:", error);
    return NextResponse.json(
      { error: "Failed to ban user" },
      { status: 500 }
    );
  }
} 