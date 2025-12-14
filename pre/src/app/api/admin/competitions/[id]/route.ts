import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role?.toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const competition = await prisma.competition.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            entries: true,
            drops: true
          }
        },
        entries: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        drops: {
          orderBy: { indexInCompetition: 'asc' }
        }
      }
    });

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ competition });

  } catch (error) {
    console.error("Get competition error:", error);
    return NextResponse.json(
      { error: "Failed to fetch competition" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
      questionsPerDrop,
      entryType,
      entryPriceNgn,
      entryPriceGem,
      prizeCashNgn,
      status,
      timeLimit,
      requireImageUpload,
      showExplanations
    } = await req.json();

    // Validate required fields
    if (!name || !description || !startsAt || !endsAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update competition
    const competition = await prisma.competition.update({
      where: { id: params.id },
      data: {
        name,
        description,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        dropIntervalHours,
        dropOpenMinutes,
        questionsPerDrop,
        entryType,
        entryPriceNgn: entryType === 'PAID' ? entryPriceNgn : null,
        entryPriceGem: entryType === 'PAID' ? entryPriceGem : null,
        prizeCashNgn,
        status,
        timeLimit: timeLimit || 1800,
        requireImageUpload: requireImageUpload || false,
        showExplanations: showExplanations !== false
      }
    });

    return NextResponse.json({ competition });

  } catch (error) {
    console.error("Update competition error:", error);
    return NextResponse.json(
      { error: "Failed to update competition" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role?.toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete competition and all related data
    await prisma.competition.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      { message: "Competition deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Delete competition error:", error);
    return NextResponse.json(
      { error: "Failed to delete competition" },
      { status: 500 }
    );
  }
} 