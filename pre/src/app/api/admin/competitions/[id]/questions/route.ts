import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET - Fetch questions for a competition
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const questions = await prisma.mathQuestion.findMany({
      where: {
        competitionId: id
      },
      orderBy: {
        position: 'asc'
      },
      select: {
        id: true,
        prompt: true,
        choices: true,
        correct: true,
        topic: true,
        difficulty: true,
        imageUrl: true,
        position: true,
        timeLimit: true,
        isActive: true,
        requiredGrade: true,
        requiredGems: true
      }
    });

    return NextResponse.json({
      questions: questions.map(q => ({
        ...q,
        timeLimit: q.timeLimit || 60
      }))
    });

  } catch (error) {
    console.error("Error fetching competition questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST - Add a new question to a competition
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const { prompt, choices, correct, topic, difficulty, imageUrl, timeLimit, isActive, requiredGrade, requiredGems } = body;

    // Get the next position
    const lastQuestion = await prisma.mathQuestion.findFirst({
      where: { competitionId: id },
      orderBy: { position: 'desc' }
    });

    const nextPosition = (lastQuestion?.position || 0) + 1;

    const question = await prisma.mathQuestion.create({
      data: {
        prompt,
        choices,
        correct,
        topic,
        difficulty,
        imageUrl: imageUrl || null,
        timeLimit: timeLimit || 60,
        isActive: isActive || false,
        requiredGrade: requiredGrade || null,
        requiredGems: requiredGems || 0,
        position: nextPosition,
        competitionId: id,
        questionType: "multiple_choice",
        source: "admin",
        uidExternal: `comp_${id}_${Date.now()}`
      }
    });

    return NextResponse.json({
      message: "Question added successfully",
      question
    });

  } catch (error) {
    console.error("Error adding question:", error);
    return NextResponse.json(
      { error: "Failed to add question" },
      { status: 500 }
    );
  }
} 