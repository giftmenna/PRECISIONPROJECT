import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Get all grade competitions with their status
    const gradeCompetitions = await prisma.gradeCompetition.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        startsAt: true,
        endsAt: true,
        grade: true,
        entryFee: true
      }
    });

    // Get all regular competitions with their status
    const regularCompetitions = await prisma.competition.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        startsAt: true,
        endsAt: true
      }
    });

    return NextResponse.json({
      gradeCompetitions,
      regularCompetitions,
      totalGradeCompetitions: gradeCompetitions.length,
      totalRegularCompetitions: regularCompetitions.length
    });

  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Debug failed", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 