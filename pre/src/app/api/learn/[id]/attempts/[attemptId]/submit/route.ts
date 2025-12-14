import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  try {
    const { id, attemptId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { answers } = await req.json();

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get attempt
    const attempt = await prisma.learningAttempt.findUnique({
      where: {
        id: attemptId,
        userId: user.id,
      },
      include: {
        module: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Attempt not found" },
        { status: 404 }
      );
    }

    if (attempt.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Attempt already completed" },
        { status: 400 }
      );
    }

    // Calculate score
    let correctCount = 0;
    const questionAttempts: Array<{
      attemptId: string;
      questionId: string;
      userAnswer: string;
      isCorrect: boolean;
      timeSpent: number;
    }> = [];

    for (const question of attempt.module.questions) {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correct;
      
      if (isCorrect) correctCount++;

      questionAttempts.push({
        attemptId: attempt.id,
        questionId: question.id,
        userAnswer: userAnswer || "",
        isCorrect,
        timeSpent: 0, // Could track this in frontend
      });
    }

    // Calculate gems earned
    const percentage = (correctCount / attempt.module.questions.length) * 100;
    let gemsEarned = new Decimal(0);
    
    if (attempt.module.gemsReward && percentage >= 70) {
      // Award full gems if score is 70% or above
      gemsEarned = new Decimal(attempt.module.gemsReward);
    }

    // Update attempt and create question attempts in transaction
    await prisma.$transaction(async (tx) => {
      // Update attempt
      await tx.learningAttempt.update({
        where: { id: attempt.id },
        data: {
          score: correctCount,
          gemsEarned,
          completedAt: new Date(),
          status: "COMPLETED",
        },
      });

      // Create question attempts
      await tx.learningQuestionAttempt.createMany({
        data: questionAttempts,
      });

      // Award gems to user wallet if earned
      if (gemsEarned.greaterThan(0)) {
        // Get or create wallet
        let wallet = await tx.wallet.findUnique({
          where: { userId: user.id },
        });

        if (!wallet) {
          wallet = await tx.wallet.create({
            data: {
              userId: user.id,
              gemsBalance: new Decimal(0),
            },
          });
        }

        // Update wallet balance
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            gemsBalance: {
              increment: gemsEarned,
            },
          },
        });

        // Create ledger entry
        await tx.walletLedger.create({
          data: {
            walletId: wallet.id,
            amount: gemsEarned,
            type: "PRACTICE_REWARD",
            refType: "LEARNING_MODULE",
            refId: attempt.moduleId,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      score: correctCount,
      total: attempt.module.questions.length,
      percentage: Math.round(percentage),
      gemsEarned: gemsEarned.toNumber(),
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
