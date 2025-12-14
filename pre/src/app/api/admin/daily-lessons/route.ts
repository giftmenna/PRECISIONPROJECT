import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { generateYouTubeThumbnail } from "@/lib/youtube-thumbnails";

export async function GET() {
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

    const lessons = await prisma.dailyLesson.findMany({
      include: {
        _count: {
          select: {
            watchedBy: true,
          },
        },
      },
      orderBy: {
        scheduleddate: "desc",
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error fetching daily lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily lessons" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      requiredWatchDuration,
      scheduledDate,
      scheduledTime,
      isActive,
      autoStack,
      gemsReward,
    } = body;

    // Validation
    if (!title || !description || !videoUrl || !duration || !requiredWatchDuration || !scheduledDate) {
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

    if (requiredWatchDuration <= 0 || requiredWatchDuration > duration) {
      return NextResponse.json(
        { error: "Required watch duration must be greater than 0 and not exceed total duration" },
        { status: 400 }
      );
    }

    // Allow any gem reward amount (including 0)
    const finalGemsReward = parseFloat(gemsReward) || 0;

    // Auto-generate thumbnail from YouTube URL if not provided
    let finalThumbnailUrl = thumbnailUrl;
    if (!thumbnailUrl && videoUrl) {
      finalThumbnailUrl = generateYouTubeThumbnail(videoUrl, 'hqdefault.jpg');
    }

    const lesson = await prisma.dailyLesson.create({
      data: {
        title,
        description,
        videourl: videoUrl,
        thumbnailurl: finalThumbnailUrl || null,
        duration: parseInt(duration),
        requiredwatchduration: parseInt(requiredWatchDuration),
        scheduleddate: new Date(scheduledDate),
        scheduledtime: scheduledTime || null,
        isactive: Boolean(isActive),
        autostack: Boolean(autoStack),
        gemsreward: finalGemsReward,
        updatedat: new Date(),
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("Error creating daily lesson:", error);
    return NextResponse.json(
      { error: "Failed to create daily lesson" },
      { status: 500 }
    );
  }
} 