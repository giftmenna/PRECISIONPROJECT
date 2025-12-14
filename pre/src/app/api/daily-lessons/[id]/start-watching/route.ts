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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id: dailyLessonId } = await context.params;

    // Check if lesson exists
    const lesson = await prisma.dailyLesson.findUnique({
      where: { id: dailyLessonId },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Check if user already has a watch record
    const existingWatch = await prisma.dailyLessonWatch.findUnique({
      where: {
        userId_dailyLessonId: {
          userId: user.id,
          dailyLessonId: dailyLessonId,
        },
      },
    });

    if (existingWatch) {
      // Update existing watch record with new timestamp
      await prisma.dailyLessonWatch.update({
        where: { id: existingWatch.id },
        data: {
          watchedAt: new Date(),
        },
      });
    } else {
      // Create new watch record
      await prisma.dailyLessonWatch.create({
        data: {
          userId: user.id,
          dailyLessonId: dailyLessonId,
          watchedAt: new Date(),
          gemsEarned: 0, // Will be updated when completed
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Started watching lesson",
      lessonTitle: lesson.title,
      gemsReward: lesson.gemsReward
    });
  } catch (error) {
    console.error("Error starting lesson watch:", error);
    return NextResponse.json(
      { error: "Failed to start watching" },
      { status: 500 }
    );
  }
} 