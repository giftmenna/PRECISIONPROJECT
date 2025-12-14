import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        ipAddress: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        wallet: {
          select: {
            id: true,
            gemsBalance: true,
            ledger: {
              select: {
                id: true,
                amount: true,
                type: true,
                refType: true,
                refId: true,
                createdAt: true
              },
              orderBy: { createdAt: "desc" },
              take: 10
            }
          }
        },
        practiceAttempts: {
          select: {
            id: true,
            isCorrect: true,
            gemsEarned: true,
            createdAt: true
          },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        attempts: {
          select: {
            id: true,
            score: true,
            avgTimeMs: true,
            startedAt: true,
            submittedAt: true
          },
          orderBy: { startedAt: "desc" },
          take: 10
        },
        competitionEntries: {
          select: {
            id: true,
            status: true,
            method: true,
            createdAt: true
          },
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate additional statistics
    const totalPracticeAttempts = user.practiceAttempts.length;
    const totalCompetitionAttempts = user.attempts.length;
    const totalGemsEarned = user.wallet?.ledger
      .filter(entry => entry.type === "PRACTICE_REWARD")
      .reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;
    
    const correctAttempts = user.practiceAttempts.filter(attempt => attempt.isCorrect).length;
    const averageScore = totalPracticeAttempts > 0 
      ? (correctAttempts / totalPracticeAttempts) * 100
      : 0;

    return NextResponse.json({
      user: {
        ...user,
        stats: {
          totalPracticeAttempts,
          totalCompetitionAttempts,
          totalGemsEarned,
          averageScore: Math.round(averageScore * 100) / 100
        }
      }
    });

  } catch (error) {
    console.error("Get user details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
} 