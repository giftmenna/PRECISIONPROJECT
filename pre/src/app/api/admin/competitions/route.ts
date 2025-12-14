import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role?.toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const competitions = await prisma.competition.findMany({
      include: {
        _count: {
          select: {
            entries: true,
            drops: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ competitions });

  } catch (error) {
    console.error("Get competitions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch competitions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role?.toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      name,
      description,
      startsAt,
      endsAt,
      dropIntervalHours,
      dropOpenMinutes,
      totalQuestions,
      entryType,
      entryPriceNgn,
      entryPriceGem,
      prizeCashNgn,
      status,
      timeLimit,
      requireImageUpload,
      showExplanations,
      prizeSchema
    } = await req.json();

    // Validate required fields
    if (!name || !description || !startsAt || !endsAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create competition
    const competitionData: any = {
        name,
        description,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        dropIntervalHours,
        dropOpenMinutes,
      questionsPerDrop: 1, // Keep questionsPerDrop as 1 for compatibility
        entryType,
        entryPriceNgn: entryType === 'PAID' ? entryPriceNgn : null,
        entryPriceGem: entryType === 'PAID' ? entryPriceGem : null,
        prizeCashNgn,
      timeLimit: timeLimit || 1800,
      requireImageUpload: requireImageUpload || false,
      showExplanations: showExplanations !== false,
      prizeSchema: prizeSchema || {
          rank_rewards: [
            { rank: 1, gems: 0.5, cash_pct: 50 },
            { rank: 2, gems: 0.2, cash_pct: 30 },
            { rank: 3, gems: 0.1, cash_pct: 20 },
            { rank: 4, gems: 0.05, cash_pct: 0 },
            { rank: 5, gems: 0.05, cash_pct: 0 }
          ]
        },
        status,
        createdBy: (session.user as any).id
    };

    // Add totalQuestions if the field exists in the database
    if (totalQuestions) {
      competitionData.totalQuestions = totalQuestions;
      }

    const competition = await prisma.competition.create({
      data: competitionData
    });

    return NextResponse.json({ competition });

  } catch (error) {
    console.error("Create competition error:", error);
    return NextResponse.json(
      { error: "Failed to create competition" },
      { status: 500 }
    );
  }
} 