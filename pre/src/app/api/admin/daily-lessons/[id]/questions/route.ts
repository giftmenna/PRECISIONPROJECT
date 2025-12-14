import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET /api/admin/daily-lessons/[id]/questions - list questions for a lesson (admin only)
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || (user.role !== "ADMIN" && user.role !== "admin")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id: dailyLessonId } = await context.params;
    const links = await prisma.dailyLessonQuestion.findMany({
      where: { dailyLessonId },
      orderBy: { position: "asc" },
      include: { question: true },
    });

    const questions = links.map((link) => ({ ...link.question, position: link.position }));
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching lesson questions:", error);
    return NextResponse.json({ error: "Failed to fetch lesson questions" }, { status: 500 });
  }
}

// POST /api/admin/daily-lessons/[id]/questions - replace questions for a lesson (admin only)
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || (user.role !== "ADMIN" && user.role !== "admin")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id: dailyLessonId } = await context.params;
    console.log('Saving questions for lesson:', dailyLessonId);
    
    // Check if lesson exists
    const lesson = await prisma.dailyLesson.findUnique({
      where: { id: dailyLessonId }
    });
    
    if (!lesson) {
      console.error('Lesson not found:', dailyLessonId);
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    const { questions } = body as { questions: Array<{ id?: string; prompt: string; choices: string[]; correct: string; topic: string; difficulty: string; imageUrl?: string | null; timeLimit?: number }>; };

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Provide at least one question" }, { status: 400 });
    }

    console.log('Processing', questions.length, 'questions');

    // Clear existing questions first
    console.log('Clearing existing questions for lesson:', dailyLessonId);
    await prisma.dailyLessonQuestion.deleteMany({ 
      where: { dailyLessonId } 
    });

    // Create new questions one by one
    const createdQuestionIds: string[] = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      console.log('Creating question', i + 1, ':', q.prompt.substring(0, 50));
      
      try {
        const created = await prisma.mathQuestion.create({
          data: {
            prompt: q.prompt,
            choices: q.choices as any, // Cast to Json (consider validating/structure if needed)
            correctChoice: q.correct,
            topic: q.topic,
            difficulty: q.difficulty,
            imageUrl: q.imageUrl || null,
            timeLimit: q.timeLimit ?? 60
          },
        });
        createdQuestionIds.push(created.id);

        console.log('Creating link for question:', created.id);
        await prisma.dailyLessonQuestion.create({
          data: {
            dailyLessonId,
            questionId: created.id,
            position: i + 1,
          },
        });
      } catch (questionError) {
        console.error('Error creating question', i + 1, ':', questionError);
        throw new Error(`Failed to create question ${i + 1}: ${questionError instanceof Error ? questionError.message : 'Unknown error'}`);
      }
    }

    console.log('Successfully created', createdQuestionIds.length, 'questions');
    return NextResponse.json({ 
      success: true, 
      count: createdQuestionIds.length,
      message: `Successfully saved ${createdQuestionIds.length} questions for lesson`
    });
  } catch (error) {
    console.error("Error saving lesson questions:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ 
      error: "Failed to save lesson questions",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}