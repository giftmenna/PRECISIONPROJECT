import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const module = await prisma.learningModule.findUnique({
      where: {
        id,
        isActive: true,
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            prompt: true,
            choices: true,
            correct: true,
            explanation: true,
            imageUrl: true,
            order: true,
          }
        },
      },
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ module });
  } catch (error) {
    console.error("Error fetching learning module:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning module" },
      { status: 500 }
    );
  }
}
