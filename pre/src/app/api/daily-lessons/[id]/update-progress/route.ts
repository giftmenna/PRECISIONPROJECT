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
    const { completed, watchDuration } = await req.json();

    // Check if lesson exists
    const lesson = await prisma.dailyLesson.findUnique({
      where: { id: dailyLessonId },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Find existing watch record
    const existingWatch = await prisma.dailyLessonWatch.findUnique({
      where: {
        userId_dailyLessonId: {
          userId: user.id,
          dailyLessonId: dailyLessonId,
        },
      },
    });

    if (!existingWatch) {
      return NextResponse.json({ error: "No watch record found" }, { status: 404 });
    }

    let gemsEarned = 0;

    if (completed) {
      // Check if user has watched enough to earn gems
      const actualWatchDuration = watchDuration || 0;
      const requiredWatchDuration = (lesson as any).requiredWatchDuration ?? 120;

      if (actualWatchDuration < requiredWatchDuration) {
        return NextResponse.json({
          success: false,
          error: "Insufficient watch time",
          message: `You need to watch at least ${Math.floor(requiredWatchDuration / 60)} minutes to earn gems.`,
          watched: actualWatchDuration,
          required: requiredWatchDuration,
        }, { status: 400 });
      }

      // Use transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        // Get or create user's wallet
        let wallet = await tx.wallet.findUnique({
          where: { userId: user.id },
        });

        if (!wallet) {
          wallet = await tx.wallet.create({
            data: {
              userId: user.id,
              gemsBalance: 0,
            },
          });
        }

        // Update wallet balance
        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            gemsBalance: {
              increment: lesson.gemsReward,
            },
          },
        });

        // Add ledger entry for tracking
        await tx.walletLedger.create({
          data: {
            walletId: wallet.id,
            amount: lesson.gemsReward,
            type: "PRACTICE_REWARD",
            refType: "DAILY_LESSON",
            refId: dailyLessonId,
          },
        });

        // Update the watch record to mark as completed
        await tx.dailyLessonWatch.update({
          where: { id: existingWatch.id },
          data: {
            gemsEarned: lesson.gemsReward,
            watchedAt: new Date(),
          },
        });

        return {
          gemsEarned: lesson.gemsReward,
          newBalance: updatedWallet.gemsBalance,
        };
      });

      gemsEarned = result.gemsEarned;
    }

    return NextResponse.json({
      success: true,
      gemsEarned,
      message: completed ? "Lesson completed and gems awarded!" : "Progress updated",
    });
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
} 