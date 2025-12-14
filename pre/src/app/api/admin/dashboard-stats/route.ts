import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log("Dashboard stats API - Session:", session);
    console.log("Dashboard stats API - User role:", session?.user ? (session.user as any).role : "No user");
    
    if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
      console.log("Dashboard stats API - Unauthorized access");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get total users (excluding admins)
    const totalUsers = await prisma.user.count({
      where: {
        AND: [
          { role: { not: "ADMIN" } },
          { role: { not: "admin" } }
        ]
      }
    });

    // Get verified users (excluding admins)
    const verifiedUsers = await prisma.user.count({
      where: {
        AND: [
          { emailVerified: true },
          { role: { not: "ADMIN" } },
          { role: { not: "admin" } }
        ]
      }
    });

    // Get active users (users who have practiced in the last 7 days, excluding admins)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await prisma.user.count({
      where: {
        AND: [
          { role: { not: "ADMIN" } },
          { role: { not: "admin" } },
          {
            practiceAttempts: {
              some: {
                createdAt: {
                  gte: weekAgo
                }
              }
            }
          }
        ]
      }
    });

    // Get total gems earned (excluding admin wallets)
    const wallets = await prisma.wallet.findMany({
      where: {
        user: {
          AND: [
            { role: { not: "ADMIN" } },
            { role: { not: "admin" } }
          ]
        }
      },
      select: {
        gemsBalance: true
      }
    });

    const totalGems = wallets.reduce((sum, wallet) => {
      return sum + parseFloat(wallet.gemsBalance.toString());
    }, 0);

    // Get average score (excluding admin attempts)
    const totalAttempts = await prisma.practiceAttempt.count({
      where: {
        user: {
          AND: [
            { role: { not: "ADMIN" } },
            { role: { not: "admin" } }
          ]
        }
      }
    });
    const correctAttempts = await prisma.practiceAttempt.count({
      where: {
        AND: [
          { isCorrect: true },
          {
            user: {
              AND: [
                { role: { not: "ADMIN" } },
                { role: { not: "admin" } }
              ]
            }
          }
        ]
      }
    });
    const avgScore = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    // Get competition statistics
    const totalCompetitions = await prisma.competition.count();
    const activeCompetitions = await prisma.competition.count({
      where: {
        status: 'ACTIVE'
      }
    });

    // Get total competition entries
    const totalEntries = await prisma.competitionEntry.count();

    // Get total prize pool
    const totalPrizePoolResult = await prisma.competition.aggregate({
      _sum: {
        prizeCashNgn: true
      }
    });
    const totalPrizePool = Number(totalPrizePoolResult._sum.prizeCashNgn || 0);

    return NextResponse.json({
      totalUsers,
      verifiedUsers,
      activeUsers,
      totalGems,
      avgScore,
      totalCompetitions,
      activeCompetitions,
      totalEntries,
      totalPrizePool
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
} 