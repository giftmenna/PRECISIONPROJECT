import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

interface ActivityData {
  type: string;
  title: string;
  score: number;
  gems: number;
  date: Date;
}

interface StatsData {
  totalPractice: number;
  totalGems: number;
  averageScore: number;
  rank: number;
  topPercentage: number;
  practiceChange: number;
  gemsChange: number;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase();
    
    // Get user with their wallet and recent practice attempts
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { 
        wallet: true,
        practiceAttempts: {
          include: { 
            question: {
              select: {
                id: true,
                topic: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate total practice attempts
    const totalPracticeAttempts = await prisma.practiceAttempt.count({
      where: { userId: user.id }
    });

    // Calculate total gems earned
    const totalGemsEarned = await prisma.practiceAttempt.aggregate({
      where: { 
        userId: user.id,
        isCorrect: true
      },
      _sum: { 
        gemsEarned: true 
      }
    });

    const userGems = totalGemsEarned._sum.gemsEarned || 0;

    // Calculate average score
    const correctAttempts = await prisma.practiceAttempt.count({
      where: { 
        userId: user.id,
        isCorrect: true
      }
    });

    const averageScore = totalPracticeAttempts > 0 
      ? Math.round((correctAttempts / totalPracticeAttempts) * 100)
      : 0;

    // Get user's rank (simplified - based on total gems earned)
    const allUsers = await prisma.user.findMany({
      include: {
        practiceAttempts: {
          where: { isCorrect: true },
          select: { gemsEarned: true }
        }
      }
    });

    const sortedUsers = allUsers
      .map(u => ({
        id: u.id,
        gems: u.practiceAttempts.reduce((sum, attempt) => 
          sum + (Number(attempt.gemsEarned) || 0), 0)
      }))
      .sort((a, b) => b.gems - a.gems);

    const userRank = sortedUsers.findIndex(u => u.id === user.id) + 1;
    const totalUsers = sortedUsers.length;
    const topPercentage = totalUsers > 0 
      ? Math.round((userRank / totalUsers) * 100) 
      : 0;

    // Get recent activity with questions
    const recentActivity = await prisma.practiceAttempt.findMany({
      where: { 
        userId: user.id,
        questionId: { not: undefined } // Only include attempts with questions
      },
      include: { 
        question: {
          select: {
            id: true,
            topic: true
          }
        } 
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Map activity data with proper types and null checks
    const activityData: ActivityData[] = recentActivity.map(attempt => {
      const topic = attempt.question?.topic || 'Unknown Topic';
      const gems = attempt.isCorrect ? (Number(attempt.gemsEarned) || 0) : 0;
      
      return {
        type: 'practice',
        title: `Practice: ${topic}`,
        score: attempt.isCorrect ? 100 : 0,
        gems,
        date: attempt.createdAt
      };
    });

    // Calculate weekly changes
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const lastWeekAttempts = await prisma.practiceAttempt.count({
      where: { 
        userId: user.id,
        createdAt: { gte: weekAgo }
      }
    });

    // Calculate practice change percentage
    const practiceChange = totalPracticeAttempts > 0 
      ? Math.round((lastWeekAttempts / Math.max(1, (totalPracticeAttempts - lastWeekAttempts))) * 100)
      : 0;

    // Prepare stats data
    const stats: StatsData = {
      totalPractice: totalPracticeAttempts,
      totalGems: Number(userGems),
      averageScore,
      rank: userRank,
      topPercentage,
      practiceChange: Math.min(100, Math.max(-100, practiceChange)), // Clamp between -100 and 100
      gemsChange: 0 // TODO: Implement proper gems change calculation
    };

    // Prepare response
    const response = {
      stats,
      recentActivity: activityData,
      wallet: user.wallet ? {
        gemsBalance: Number(user.wallet.gemsBalance) || 0
      } : { gemsBalance: 0 }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error in dashboard stats API:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch dashboard stats",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 