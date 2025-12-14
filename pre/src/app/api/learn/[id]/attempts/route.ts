import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if module exists
    const module = await prisma.learningModule.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    // Check for existing in-progress attempt
    const existingAttempt = await prisma.learningAttempt.findUnique({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId: id,
        },
      },
    });

    if (existingAttempt) {
      // Return existing attempt if not completed
      if (existingAttempt.status !== "COMPLETED") {
        return NextResponse.json({ attemptId: existingAttempt.id });
      }
      
      // Delete old attempt if completed and create new one
      await prisma.learningAttempt.delete({
        where: { id: existingAttempt.id },
      });
    }

    // Create new attempt
    const attempt = await prisma.learningAttempt.create({
      data: {
        userId: user.id,
        moduleId: id,
        totalQuestions: module.questions.length,
        status: "IN_PROGRESS",
      },
    });

    return NextResponse.json({ attemptId: attempt.id });
  } catch (error) {
    console.error("Error creating learning attempt:", error);
    return NextResponse.json(
      { error: "Failed to create attempt" },
      { status: 500 }
    );
  }
}
