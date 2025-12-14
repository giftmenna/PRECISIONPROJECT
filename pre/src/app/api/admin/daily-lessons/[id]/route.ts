import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lesson = await prisma.dailyLesson.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            watchedBy: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error fetching daily lesson:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily lesson" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "admin")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      videourl,
      thumbnailurl,
      duration,
      scheduledDate,
      scheduledTime,
      isActive,
      autoStack,
      gemsReward,
    } = body;

    // Validation
    if (!title || !description || !videourl || !duration || !scheduledDate) {
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

    // Allow any gem reward amount (including 0)
    const finalGemsReward = parseFloat(gemsReward) || 0;

    const lesson = await prisma.dailyLesson.update({
      where: { id: params.id },
      data: {
        title,
        description,
        videourl,
        thumbnailurl: thumbnailurl || null,
        duration: parseInt(duration),
        scheduleddate: new Date(scheduledDate),
        scheduledtime: scheduledTime || null,
        isactive: Boolean(isActive),
        autostack: Boolean(autoStack),
        gemsreward: finalGemsReward,
      },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error updating daily lesson:", error);
    return NextResponse.json(
      { error: "Failed to update daily lesson" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const lessonId = params.id;
    const body = await req.json();
    const { isActive } = body;

    // Validate the lesson exists
    const existingLesson = await prisma.dailyLesson.findUnique({
      where: { id: lessonId },
    });

    if (!existingLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Update the lesson
    const updatedLesson = await prisma.dailyLesson.update({
      where: { id: lessonId },
      data: { isactive: Boolean(isActive) },
    });

    return NextResponse.json(updatedLesson);
  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: "Failed to update lesson" },
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
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const lessonId = params.id;

    // Delete the lesson
    await prisma.dailyLesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
} 