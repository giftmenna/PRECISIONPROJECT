import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

function withTimeout<T>(promise: Promise<T>, ms = 4000): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error("timeout")), ms);
    promise
      .then((value) => { clearTimeout(id); resolve(value); })
      .catch((err) => { clearTimeout(id); reject(err); });
  });
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const activities: any[] = [];

    const safe = async <T>(p: Promise<T>, fallback: T) => {
      try { return await withTimeout(p, 3500); } catch { return fallback; }
    };

    // Get recent user registrations
    const recentUsers = await safe(
      prisma.user.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true }
      }),
      [] as any[]
    );

    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user_registration',
        title: 'New user registered',
        description: `${user.email}`,
        timestamp: user.createdAt,
        icon: 'Users',
        color: 'green'
      });
    });

    // Get recent practice attempts with gems earned
    const recentGemsEarned = await safe(
      prisma.practiceAttempt.findMany({
        where: { isCorrect: true, gemsEarned: { gt: 0 } },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } }
      }),
      [] as any[]
    );

    recentGemsEarned.forEach(attempt => {
      activities.push({
        id: `gems-${attempt.id}`,
        type: 'gems_earned',
        title: 'Gems earned',
        description: `${attempt.user.name || attempt.user.email} earned ${Number(attempt.gemsEarned).toFixed(3)} gems`,
        timestamp: attempt.createdAt,
        icon: 'Gem',
        color: 'yellow',
        value: Number(attempt.gemsEarned).toFixed(3)
      });
    });

    // Get recent competition entries
    const recentEntries = await safe(
      prisma.competitionEntry.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          competition: { select: { name: true } }
        }
      }),
      [] as any[]
    );

    recentEntries.forEach(entry => {
      activities.push({
        id: `entry-${entry.id}`,
        type: 'competition_entry',
        title: 'Competition entry',
        description: `${entry.user.name || entry.user.email} joined ${entry.competition.name}`,
        timestamp: entry.createdAt,
        icon: 'Trophy',
        color: 'blue'
      });
    });

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentActivities = activities.slice(0, 5);

    return NextResponse.json({ activities: recentActivities });

  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent activity", activities: [] },
      { status: 500 }
    );
  }
} 