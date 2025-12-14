import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    // Check if lesson exists and is active
    const lesson = await prisma.dailyLesson.findFirst({
      where: {
        id: dailyLessonId,
        isActive: true,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found or inactive" }, { status: 404 });
    }

    // Check if user has watched the lesson
    const watchRecord = await prisma.dailyLessonWatch.findUnique({
      where: {
        userId_dailyLessonId: {
          userId: user.id,
          dailyLessonId: dailyLessonId,
        },
      },
    });

    if (!watchRecord) {
      return NextResponse.json({ 
        error: "You must watch the lesson first before accessing practice exercises" 
      }, { status: 403 });
    }

    // Fetch questions for this lesson
    const questionLinks = await prisma.dailyLessonQuestion.findMany({
      where: { dailyLessonId },
      orderBy: { position: "asc" },
      include: { question: true },
    });

    const questions = questionLinks.map((link) => ({
      id: link.question.id,
      prompt: link.question.prompt,
      choices: link.question.choices as string[],
      correct: link.question.correct,
      topic: link.question.topic,
      difficulty: link.question.difficulty,
      explanation: link.question.explanation,
      imageUrl: link.question.imageUrl,
      timeLimit: link.question.timeLimit,
      position: link.position,
    }));

    return NextResponse.json({
      questions,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        gemsReward: lesson.gemsReward,
      },
    });
  } catch (error) {
    console.error("Error fetching lesson questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
} 