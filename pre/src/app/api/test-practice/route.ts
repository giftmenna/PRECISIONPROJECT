import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, questions } = await req.json();

    if (!userId || !questions) {
      return NextResponse.json(
        { error: "User ID and questions required" },
        { status: 400 }
      );
    }

    let totalGemsEarned = 0;
    const practiceAttempts = [];

    // Create practice attempts for each question
    for (const question of questions) {
      const gemsEarned = question.isCorrect ? 
        (question.difficulty === 'easy' ? 0.001 : 
         question.difficulty === 'medium' ? 0.005 : 0.1) : 0;

      const attempt = await prisma.practiceAttempt.create({
        data: {
          userId: userId,
          questionId: question.questionId,
          isCorrect: question.isCorrect,
          gemsEarned: Math.round(gemsEarned * 1000), // Convert to integer (e.g., 0.001 -> 1)
          question: {
            connect: { id: question.questionId }
          },
          user: {
            connect: { id: userId }
          }
        },
        include: {
          question: true
        }
      });

      practiceAttempts.push(attempt);
      if (question.isCorrect) {
        totalGemsEarned += gemsEarned;
      }
    }

    // No wallet updates - just return the results
    return NextResponse.json({
      message: "Practice data created successfully",
      totalGemsEarned,
      practiceAttempts: practiceAttempts.length,
      questions: questions.length
    });

  } catch (error) {
    console.error("Test practice error:", error);
    return NextResponse.json(
      { error: "Failed to create practice data", details: error },
      { status: 500 }
    );
  }
} 