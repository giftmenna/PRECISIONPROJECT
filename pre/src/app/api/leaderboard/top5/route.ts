import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get users with a wallet and positive gems, ordered by gems desc
    const topUsers = await prisma.user.findMany({
      where: {
        name: { not: null },
        role: { notIn: ["ADMIN", "admin"] },
        wallet: {
          is: {
            gemsBalance: { gt: 0 },
          },
        },
      },
      select: {
        id: true,
        name: true,
        wallet: {
          select: { gemsBalance: true },
        },
      },
      orderBy: {
        wallet: { gemsBalance: 'desc' },
      },
      take: 5,
    });

    // Transform and enforce numeric sorting as a safety net
    const leaderboard = topUsers
      .map((user) => ({
        id: user.id,
        name: user.name || 'Anonymous',
        score: Number(user.wallet?.gemsBalance ?? 0),
        rank: 0, // temporary, assign after sort
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return NextResponse.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
} 