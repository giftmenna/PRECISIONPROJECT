import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const moduleId = params.id;
    const questions = await prisma.learningQuestion.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching learning questions:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch learning questions";
    
    if (errorMessage === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (errorMessage === "Admin access required") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: "Failed to fetch learning questions" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const moduleId = params.id;
    const body = await req.json();
    const { prompt, choices, correct, explanation, order } = body;

    // Validation
    if (!prompt || !choices || !correct) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const question = await prisma.learningQuestion.create({
      data: {
        moduleId,
        prompt,
        choices,
        correct,
        explanation: explanation || null,
        order: parseInt(order) || 0,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Error creating learning question:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create learning question";
    
    if (errorMessage === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (errorMessage === "Admin access required") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: "Failed to create learning question" },
      { status: 500 }
    );
  }
} 