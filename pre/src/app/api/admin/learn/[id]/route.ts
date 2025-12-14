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
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role?.toUpperCase() !== "ADMIN" && user.role?.toLowerCase() !== "admin")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const moduleId = params.id;
    const module = await prisma.learningModule.findUnique({
      where: { id: moduleId },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    });

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    return NextResponse.json(module);
  } catch (error) {
    console.error("Error fetching learning module:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning module" },
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
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role?.toUpperCase() !== "ADMIN" && user.role?.toLowerCase() !== "admin")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const moduleId = params.id;
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

    const module = await prisma.learningModule.update({
      where: { id: moduleId },
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

    return NextResponse.json(module);
  } catch (error) {
    console.error("Error updating learning module:", error);
    return NextResponse.json(
      { error: "Failed to update learning module" },
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

    if (!user || (user.role?.toUpperCase() !== "ADMIN" && user.role?.toLowerCase() !== "admin")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const moduleId = params.id;
    const body = await req.json();
    const { isActive } = body;

    const module = await prisma.learningModule.update({
      where: { id: moduleId },
      data: { isActive: Boolean(isActive) },
    });

    return NextResponse.json(module);
  } catch (error) {
    console.error("Error updating learning module:", error);
    return NextResponse.json(
      { error: "Failed to update learning module" },
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

    if (!user || (user.role?.toUpperCase() !== "ADMIN" && user.role?.toLowerCase() !== "admin")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const moduleId = params.id;

    await prisma.learningModule.delete({
      where: { id: moduleId },
    });

    return NextResponse.json({ message: "Module deleted successfully" });
  } catch (error) {
    console.error("Error deleting learning module:", error);
    return NextResponse.json(
      { error: "Failed to delete learning module" },
      { status: 500 }
    );
  }
} 