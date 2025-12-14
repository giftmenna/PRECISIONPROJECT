import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionCount, topic } = await req.json();

    // Create notification for all users
    const users = await prisma.user.findMany({
      where: { role: "user" },
      select: { id: true }
    });

    const notifications = users.map(user => ({
      userId: user.id,
      type: 'NEW_QUESTIONS',
      title: 'New Practice Questions Available!',
      message: `${questionCount} new ${topic} questions have been added. Earn more gems by practicing!`,
      data: { questionCount, topic },
      isRead: false,
      createdAt: new Date()
    }));

    // In a real app, you'd store these in a notifications table
    // For now, we'll just return success
    console.log(`Created ${notifications.length} notifications for new questions`);

    return NextResponse.json({
      message: "Notifications sent successfully",
      notificationCount: notifications.length
    });

  } catch (error) {
    console.error("Error creating notifications:", error);
    return NextResponse.json(
      { error: "Failed to create notifications" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // In a real app, you'd fetch from a notifications table
    // For now, return mock notifications
    const notifications = [
      {
        id: '1',
        type: 'NEW_QUESTIONS',
        title: 'New Practice Questions Available!',
        message: '5 new Algebra questions have been added. Earn more gems by practicing!',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
} 