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

    const competitions = await prisma.gradeCompetition.findMany({
      include: {
        _count: {
          select: {
            entries: true,
            questions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ competitions });

  } catch (error) {
    console.error("Get grade competitions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch grade competitions" },
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
      grade,
      entryFee,
      timeLimit,
      status
    } = await req.json();

    // Validate required fields
    if (!name || !description || !startsAt || !endsAt || !grade) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create grade competition
    const competition = await prisma.gradeCompetition.create({
      data: {
        name,
        description,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        grade,
        entryFee,
        timeLimit: timeLimit || 1800,
        status
      }
    });

    return NextResponse.json({ competition });

  } catch (error) {
    console.error("Create grade competition error:", error);
    return NextResponse.json(
      { error: "Failed to create grade competition" },
      { status: 500 }
    );
  }
} 