import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const modules = await prisma.learningModule.findMany({
      include: {
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json({ modules });
  } catch (error) {
    console.error("Error fetching learning modules:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch learning modules";
    
    if (errorMessage === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (errorMessage === "Admin access required") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: "Failed to fetch learning modules" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const {
      title,
      description,
      topic,
      notes,
      videoUrl,
      thumbnailUrl,
      duration,
      gemsReward,
      isActive,
      order,
    } = body;

    // Validation
    if (!title || !topic || !videoUrl || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (duration <= 0) {
      return NextResponse.json(
        { error: "Duration must be greater than 0" },
        { status: 400 }
      );
    }

    const module = await prisma.learningModule.create({
      data: {
        title,
        description: description || null,
        topic,
        notes: notes || null,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        duration: parseInt(duration),
        gemsReward: gemsReward && gemsReward > 0 ? parseFloat(gemsReward) : null,
        isActive: Boolean(isActive),
        order: parseInt(order) || 0,
      },
    });

    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    console.error("Error creating learning module:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create learning module";
    
    if (errorMessage === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (errorMessage === "Admin access required") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: "Failed to create learning module" },
      { status: 500 }
    );
  }
} 