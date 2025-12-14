import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    console.log('Daily lessons API called');
    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'exists' : 'none');
    
    if (!session?.user?.email) {
      console.log('No session or user email');
      return NextResponse.json({ error: "Unauthorized - Please log in to access daily lessons" }, { status: 401 });
    }

    console.log('User email:', session.user.email);
    
    // Step 1: Find user
    console.log('Step 1: Finding user...');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    console.log('User found:', !!user);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Step 2: Get user's watch history
    console.log('Step 2: Getting user watch history...');
    const userWatches = await prisma.dailyLessonWatch.findMany({
      where: { userId: user.id },
      select: {
        dailyLessonId: true,
        watchedAt: true,
        gemsEarned: true,
      },
    });
    console.log('User watches found:', userWatches.length);

    // Get date range for past week and upcoming week
    const now = new Date();
    const pastWeek = new Date(now);
    pastWeek.setDate(pastWeek.getDate() - 7);
    
    const upcomingWeek = new Date(now);
    upcomingWeek.setDate(upcomingWeek.getDate() + 7);

    console.log('Date range:', { pastWeek, upcomingWeek });

    // Step 3: Fetch lessons
    console.log('Step 3: Fetching lessons...');
    // Fetch active lessons for the date range
    const availableLessons = await prisma.dailyLesson.findMany({
      where: {
        isActive: true,
        scheduledDate: {
          gte: pastWeek,
          lte: upcomingWeek,
        },
      },
      orderBy: {
        scheduledDate: "asc",
      },
    });

    console.log('Found lessons:', availableLessons.length);

    // If no lessons found, return empty array
    if (!availableLessons || availableLessons.length === 0) {
      console.log('No lessons found in the date range');
      return NextResponse.json({
        lessons: [],
        totalAvailable: 0,
        totalWatched: 0
      });
    }

    // Step 4: Map lessons with watch status
    console.log('Step 4: Mapping lessons with watch status...');
    // Map lessons with user's watch status
    const lessonsWithStatus = availableLessons.map(lesson => ({
      ...lesson,
      hasWatched: userWatches.some(watch => watch.dailyLessonId === lesson.id),
      watchedAt: userWatches.find(watch => watch.dailyLessonId === lesson.id)?.watchedAt || null,
      gemsEarned: userWatches.find(watch => watch.dailyLessonId === lesson.id)?.gemsEarned || 0,
      requiredWatchDuration: lesson.requiredWatchDuration || 120, // Default 2 minutes
    }));

    console.log('Returning lessons with status');
    return NextResponse.json({
      lessons: lessonsWithStatus,
      totalAvailable: availableLessons.length,
      totalWatched: userWatches.filter(watch => 
        availableLessons.some(lesson => lesson.id === watch.dailyLessonId)
      ).length,
    });
  } catch (error) {
    console.error("Error fetching daily lessons:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "Failed to fetch daily lessons" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { lessonId } = body;

    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 }
      );
    }

    // Check if lesson exists and is active for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lesson = await prisma.dailyLesson.findUnique({
      where: { 
        id: lessonId, 
        isActive: true, 
        scheduledDate: { 
          gte: today, 
          lt: tomorrow 
        } 
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found or not available for today" },
        { status: 404 }
      );
    }

    // Check if user already watched this lesson
    const existingWatch = await prisma.dailyLessonWatch.findUnique({
      where: {
        userId_dailyLessonId: {
          userId: user.id,
          dailyLessonId: lessonId,
        },
      },
    });

    if (existingWatch) {
      return NextResponse.json(
        { 
          error: "You have already watched this lesson",
          gemsEarned: existingWatch.gemsEarned,
          watchedAt: existingWatch.watchedAt,
        },
        { status: 400 }
      );
    }

    // Create wallet if it doesn't exist
    if (!user.wallet) {
      await prisma.wallet.create({
        data: {
          userId: user.id,
          gemsBalance: 0,
        },
      });
    }

    // Record the watch and award gems
    const result = await prisma.$transaction(async (tx) => {
      // Verify wallet exists and is ready for update
      const currentWallet = await tx.wallet.findUnique({
        where: { userId: user.id },
      });

      if (!currentWallet) {
        throw new Error("Wallet not found before transaction");
      }

      // Record the watch
      const watch = await tx.dailyLessonWatch.create({
        data: {
          userId: user.id,
          dailyLessonId: lessonId,
          gemsEarned: lesson.gemsReward,
          watchedAt: new Date(),
        },
      });

      // Update user's gem balance
      await tx.wallet.update({
        where: { userId: user.id },
        data: {
          gemsBalance: {
            increment: lesson.gemsReward,
          },
        },
      });

      // Record the transaction in ledger
      const wallet = await tx.wallet.findUnique({
        where: { userId: user.id },
      });

      if (!wallet) {
        throw new Error("Wallet not found after update");
      }

      // Record gem history
      await (tx as any).gemHistory.create({
        data: {
          userId: user.id,
          amount: lesson.gemsReward,
          description: `Watched daily lesson: ${lesson.title || 'Untitled Lesson'}`,
          type: "EARNED",
          source: "DAILY_LESSON",
          refId: lessonId
        }
      });

      // Create a notification
      try {
        await tx.notification.create({
          data: {
            userId: user.id,
            type: "GEM_EARNED",
            title: "Gems Earned!",
            message: `You earned ${lesson.gemsReward} gems for watching today's lesson!`
          }
        });
      } catch (notifError) {
        console.warn("Failed to create notification:", notifError);
      }

      return watch;
    });

    const updatedWallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      message: "Lesson watched successfully",
      watch: {
        id: result.id,
        lessonId: result.dailyLessonId,
        gemsEarned: result.gemsEarned,
        watchedAt: result.watchedAt
      },
      wallet: {
        currentBalance: updatedWallet?.gemsBalance || 0,
        earnedAmount: lesson.gemsReward
      }
    });
  } catch (error) {
    console.error("Error recording lesson watch:", error);
    return NextResponse.json(
      { error: "Failed to record lesson watch" },
      { status: 500 }
    );
  }
} 