import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface QuestionData {
  questionId: string;
  isCorrect: boolean;
  choice?: string;
}

interface AttemptResult {
  id: string;
  userId: string;
  questionId: string;
  choice?: string | null;
  isCorrect: boolean;
  gemsEarned: number;
  createdAt: Date;
  isFirstCorrectAttempt: boolean;
}

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated with valid ID
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Store the validated userId
    const userId = session.user.id;

    // Get questions array from request body
    const { questions } = await req.json() as { questions: QuestionData[] };
    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Invalid request format: questions array is required" },
        { status: 400 }
      );
    }

    // Verify user exists and has a wallet
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.wallet) {
      return NextResponse.json({ error: "User wallet not initialized" }, { status: 400 });
    }

    const results: AttemptResult[] = [];
    let totalGemsEarned = 0;

    // Process each question
    for (const questionData of questions) {
      if (!questionData.questionId) {
        continue; // Skip invalid questions
      }

      try {
        const result = await prisma.$transaction(async (tx) => {
          // Check for existing correct attempt
          const existingAttempt = await tx.practiceAttempt.findFirst({
            where: {
              userId,
              questionId: questionData.questionId,
              isCorrect: true
            }
          });

          // Get question details first to determine rewards
          const question = await tx.mathQuestion.findUnique({
            where: { id: questionData.questionId },
            select: { 
              difficulty: true,
              topic: true
            }
          });

          if (!question) {
            throw new Error(`Question ${questionData.questionId} not found`);
          }

          // Calculate gems if this is first correct attempt
          let gemsEarned = 0;
          if (questionData.isCorrect && !existingAttempt) {
            // Calculate gems based on difficulty
            gemsEarned = question.difficulty === "HARD" ? 5 :
                        question.difficulty === "MEDIUM" ? 3 : 1;

            // Update user's gem balance
            await tx.wallet.update({
              where: { userId },
              data: { gemsBalance: { increment: gemsEarned } }
            });

            // Record the transaction in gem history
            await (tx as any).gemHistory.create({
              data: {
                userId,
                amount: gemsEarned,
                description: `Correct answer in practice mode - ${question.topic || 'Unknown Topic'}`,
                type: "EARNED",
                source: "PRACTICE",
                questionId: questionData.questionId
              }
            });

            try {
              await tx.notification.create({
                data: {
                  user: {
                    connect: { id: userId }
                  },
                  type: "GEM_EARNED",
                  title: "Gems Earned!",
                  message: `You earned ${gemsEarned} gems for correctly answering a ${
                    question.difficulty.toLowerCase()
                  } question in ${question.topic || 'practice'}!`
                }
              });
            } catch (notifError) {
              // Log but don't fail the transaction
              console.warn("Failed to create notification:", notifError);
            }
          }

          // Create the attempt record
          const attempt = await tx.practiceAttempt.create({
            data: {
              userId,
              questionId: questionData.questionId,
              choice: questionData.choice,
              isCorrect: questionData.isCorrect,
              gemsEarned
            }
          });

          return {
            ...attempt,
            isFirstCorrectAttempt: questionData.isCorrect && !existingAttempt
          };
        });

        results.push(result);
        if (result.gemsEarned > 0) {
          totalGemsEarned += result.gemsEarned;
        }

      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') { // Unique constraint violation
            console.warn("Duplicate attempt detected:", error.message);
            continue; // Skip this question and continue with others
          }
        }
        // Log error but continue processing other questions
        console.error("Error processing question attempt:", error);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        attempts: results,
        totalGemsEarned,
        totalAttempts: results.length
      }
    });

  } catch (error) {
    console.error("Error saving practice results:", error);
    return NextResponse.json(
      { 
        error: "Failed to save practice results",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}