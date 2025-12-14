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
      where: { email: session.user.email },
      include: { wallet: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const lessonId = params.id;
    const { watchDuration, youtubeVideoId } = await req.json();

    if (typeof watchDuration !== 'number' || watchDuration < 0) {
      return NextResponse.json(
        { error: "Invalid watch duration" },
        { status: 400 }
      );
    }

    // Get the lesson
    const lesson = await prisma.dailyLesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Check if user already completed this lesson
    const existingWatch = await prisma.dailyLessonWatch.findUnique({
      where: {
        userId_dailyLessonId: {
          userId: user.id,
          dailyLessonId: lessonId,
        },
      },
    });

    if (existingWatch?.isCompleted) {
      return NextResponse.json(
        { 
          error: "Lesson already completed",
          gemsEarned: existingWatch.gemsEarned,
        },
        { status: 400 }
      );
    }

    // Create or update watch record
    let watchRecord;
    if (!existingWatch) {
      watchRecord = await prisma.dailyLessonWatch.create({
        data: {
          userId: user.id,
          dailyLessonId: lessonId,
          startedAt: new Date(),
          watchDuration: watchDuration,
          isCompleted: false,
        },
      });
    } else {
      watchRecord = await prisma.dailyLessonWatch.update({
        where: { id: existingWatch.id },
        data: {
          watchDuration: watchDuration,
        },
      });
    }

    // Check if user has watched enough to earn gems
    const hasWatchedEnough = watchDuration >= lesson.requiredWatchDuration;
    let gemsEarned = 0;
    let isCompleted = false;

    if (hasWatchedEnough && !existingWatch?.isCompleted) {
      // Award gems and mark as completed
      const result = await prisma.$transaction(async (tx) => {
        // Mark as completed
        const completedWatch = await tx.dailyLessonWatch.update({
          where: { id: watchRecord.id },
          data: {
            isCompleted: true,
            completedAt: new Date(),
            gemsEarned: lesson.gemsReward,
          },
        });

        // Create wallet if it doesn't exist
        if (!user.wallet) {
          await tx.wallet.create({
            data: {
              userId: user.id,
              gemsBalance: lesson.gemsReward,
            },
          });
        } else {
          // Update user's gem balance
          await tx.wallet.update({
            where: { userId: user.id },
            data: {
              gemsBalance: {
                increment: lesson.gemsReward,
              },
            },
          });
        }

        // Record the transaction in ledger
        const wallet = await tx.wallet.findUnique({
          where: { userId: user.id },
        });

        if (wallet) {
          await tx.walletLedger.create({
            data: {
              walletId: wallet.id,
              amount: lesson.gemsReward,
              type: "PRACTICE_REWARD",
              refType: "DAILY_LESSON",
              refId: lessonId,
            },
          });
        }

        return completedWatch;
      });

      gemsEarned = lesson.gemsReward;
      isCompleted = true;
    }

    return NextResponse.json({
      message: "YouTube watch progress updated",
      watchDuration,
      requiredWatchDuration: lesson.requiredWatchDuration,
      hasWatchedEnough,
      isCompleted,
      gemsEarned,
      totalGems: user.wallet ? Number(user.wallet.gemsBalance) + gemsEarned : gemsEarned,
      youtubeVideoId,
    });

  } catch (error) {
    console.error("Error updating YouTube watch progress:", error);
    return NextResponse.json(
      { error: "Failed to update YouTube watch progress" },
      { status: 500 }
    );
  }
} 