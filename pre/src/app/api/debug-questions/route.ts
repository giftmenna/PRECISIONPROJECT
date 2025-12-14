import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch raw questions from database
    const questions = await prisma.mathQuestion.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Return raw data for debugging
    return NextResponse.json({
      questions: questions.map(q => ({
        id: q.id,
        prompt: q.prompt,
        choices: q.choices,
        choicesType: typeof q.choices,
        choicesIsArray: Array.isArray(q.choices),
        correct: q.correct,
        topic: q.topic,
        difficulty: q.difficulty,
        createdAt: q.createdAt
      })),
      total: questions.length
    });

  } catch (error) {
    console.error("Error fetching debug questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch debug questions" },
      { status: 500 }
    );
  }
} 