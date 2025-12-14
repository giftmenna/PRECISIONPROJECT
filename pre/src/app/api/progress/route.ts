import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        wallet: true,
        practiceAttempts: {
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            question: true
          }
        },
        competitionEntries: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            competition: true
          }
        },
        gradeCompetitionEntries: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            competition: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate real-time statistics
    const totalPractice = user.practiceAttempts.length;
    const totalCompetitions = user.competitionEntries.length + user.gradeCompetitionEntries.length;
    const totalGems = user.wallet?.gemsBalance || 0;

    // Calculate average score from practice attempts
    const practiceScores = user.practiceAttempts.map((attempt: any) => {
      return attempt.isCorrect ? 100 : 0;
    });
    const averageScore = practiceScores.length > 0 
      ? Math.round(practiceScores.reduce((a: number, b: number) => a + b, 0) / practiceScores.length)
      : 0;

    // Get topic progress from practice attempts
    const topicStats = new Map<string, { correct: number; total: number }>();
    
    user.practiceAttempts.forEach((attempt: any) => {
      if (attempt.question?.topic) {
        const topic = attempt.question.topic;
        const current = topicStats.get(topic) || { correct: 0, total: 0 };
        current.total += 1;
        if (attempt.isCorrect) {
          current.correct += 1;
        }
        topicStats.set(topic, current);
      }
    });

    const topics = Array.from(topicStats.entries()).map(([name, stats]) => ({
      name,
      progress: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      questions: stats.total
    }));

    // Generate recent activity from practice attempts and competition entries
    type Activity = {
      type: string;
      description: string;
      date: string;
      gems: number;
    };
    
    const recentActivity: Activity[] = [];

    // Add practice activities
    user.practiceAttempts.slice(0, 10).forEach((attempt: any) => {
      const topic = attempt.question?.topic || "Math";
      recentActivity.push({
        type: "practice",
        description: `${attempt.isCorrect ? "Completed" : "Attempted"} ${topic} Practice`,
        date: attempt.createdAt.toISOString(),
        gems: attempt.isCorrect ? 5 : 0
      });
    });

    // Add competition activities
    [...user.competitionEntries, ...user.gradeCompetitionEntries].slice(0, 10).forEach((entry: any) => {
      recentActivity.push({
        type: "competition",
        description: `Participated in ${entry.competition.name}`,
        date: entry.createdAt.toISOString(),
        gems: 10 // Default gems for participation
      });
    });

    // Sort activities by date and take the most recent 8
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recentActivityFormatted = recentActivity.slice(0, 8).map(activity => ({
      ...activity,
      date: formatRelativeTime(new Date(activity.date))
    }));

    // Calculate weekly and monthly progress
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyAttempts = user.practiceAttempts.filter(
      (attempt: any) => attempt.createdAt >= weekAgo
    );
    const monthlyAttempts = user.practiceAttempts.filter(
      (attempt: any) => attempt.createdAt >= monthAgo
    );

    const weeklyProgress = weeklyAttempts.length > 0 
      ? Math.min(100, Math.round((weeklyAttempts.filter((a: any) => a.isCorrect).length / weeklyAttempts.length) * 100))
      : 0;
    const monthlyProgress = monthlyAttempts.length > 0 
      ? Math.min(100, Math.round((monthlyAttempts.filter((a: any) => a.isCorrect).length / monthlyAttempts.length) * 100))
      : 0;

    // Get global rank (simplified - in real app, this would be more complex)
    const totalUsers = await prisma.user.count();
    const rank = Math.floor(Math.random() * totalUsers) + 1; // Placeholder for now

    const progressData = {
      totalPractice,
      totalCompetitions,
      totalGems: Number(totalGems),
      averageScore,
      rank,
      weeklyProgress,
      monthlyProgress,
      topics,
      recentActivity: recentActivityFormatted
    };

    return NextResponse.json(progressData);

  } catch (error) {
    console.error("Error fetching progress data:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress data" },
      { status: 500 }
    );
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
} 