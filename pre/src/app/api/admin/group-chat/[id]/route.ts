import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function PATCH(
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
    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    const updatedGroup = await prisma.groupChat.update({
      where: { id },
      data: { name: name.trim() },
      include: {
        group_chat_members: {
          include: {
            users: { select: { id: true, name: true, email: true, avatar: true } }
          }
        },
        group_chat_messages: {
          orderBy: { created_at: "desc" },
          take: 1
        }
      }
    });

    return NextResponse.json({ group: updatedGroup });
  } catch (error) {
    console.error("Update group error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 