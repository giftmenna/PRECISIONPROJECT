import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

// GET video progress for a module
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const userId = (session.user as any).id;
    const { id: moduleId } = await params;

    // Get or create learning attempt
    let attempt = await prisma.learningAttempt.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
      select: {
        videoProgress: true,
        videoCompleted: true,
        lastWatchedAt: true,
      },
    });

    if (!attempt) {
      // Create new attempt if doesn't exist
      attempt = await prisma.learningAttempt.create({
        data: {
          userId,
          moduleId,
          videoProgress: 0,
          videoCompleted: false,
        },
        select: {
          videoProgress: true,
          videoCompleted: true,
          lastWatchedAt: true,
        },
      });
    }

    return NextResponse.json({
      videoProgress: attempt.videoProgress || 0,
      videoCompleted: attempt.videoCompleted || false,
      lastWatchedAt: attempt.lastWatchedAt,
    });
  } catch (error) {
    console.error("Error fetching video progress:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch progress";
    
    if (errorMessage === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: "Failed to fetch video progress" },
      { status: 500 }
    );
  }
}

// POST/PUT to save video progress
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const userId = (session.user as any).id;
    const { id: moduleId } = await params;
    const body = await req.json();
    const { videoProgress, videoCompleted } = body;

    if (typeof videoProgress !== 'number' || videoProgress < 0) {
      return NextResponse.json(
        { error: "Invalid video progress value" },
        { status: 400 }
      );
    }

    // Upsert learning attempt with video progress
    const attempt = await prisma.learningAttempt.upsert({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
      update: {
        videoProgress,
        videoCompleted: videoCompleted || false,
        lastWatchedAt: new Date(),
      },
      create: {
        userId,
        moduleId,
        videoProgress,
        videoCompleted: videoCompleted || false,
        lastWatchedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      videoProgress: attempt.videoProgress,
      videoCompleted: attempt.videoCompleted,
    });
  } catch (error) {
    console.error("Error saving video progress:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to save progress";
    
    if (errorMessage === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: "Failed to save video progress" },
      { status: 500 }
    );
  }
}
