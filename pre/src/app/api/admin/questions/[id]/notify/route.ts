import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role?.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const questionId = params.id;

    // Get the question
    const question = await prisma.mathQuestion.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Check if already notified
    if ((question as any).notifiedAt) {
      return NextResponse.json({ 
        message: "Users already notified for this question",
        notifiedAt: (question as any).notifiedAt
      });
    }

    // Get all users with notification settings enabled
    const usersToNotify = await prisma.user.findMany({
      where: {
        role: "user",
        notificationSettings: {
          newQuestionsEnabled: true,
          pushEnabled: true
        }
      },
      select: { id: true }
    });

    if (usersToNotify.length === 0) {
      return NextResponse.json({ 
        message: "No users have notifications enabled",
        notifiedCount: 0
      });
    }

    // Create notifications for all eligible users
    const notifications = usersToNotify.map(u => ({
      userId: u.id,
      type: 'NEW_QUESTION' as any,
      title: 'New Question Available! 🎯',
      message: `A new ${question.difficulty} question in ${question.topic.replace(/_/g, ' ')} is now available for practice!`,
      data: {
        questionId: question.id,
        topic: question.topic,
        difficulty: question.difficulty,
        source: question.source
      } as any,
      isRead: false
    }));

    // Batch create notifications
    await prisma.notification.createMany({
      data: notifications
    });

    // Mark question as notified
    await prisma.mathQuestion.update({
      where: { id: questionId },
      data: { 
        notifiedAt: new Date()
      } as any
    });

    return NextResponse.json({
      message: "Notifications sent successfully",
      notifiedCount: notifications.length,
      notifiedAt: new Date()
    });

  } catch (error) {
    console.error("Error sending notifications:", error);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 }
    );
  }
}
