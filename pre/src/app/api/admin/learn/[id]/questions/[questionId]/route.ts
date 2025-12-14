import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; questionId: string } }
) {
  try {
    await requireAdmin();

    const { id: moduleId, questionId } = params;

    const question = await prisma.learningQuestion.findFirst({
      where: { id: questionId, moduleId },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error fetching learning question:", error);
    return NextResponse.json({ error: "Failed to fetch learning question" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; questionId: string } }
) {
  try {
    await requireAdmin();

    const { id: moduleId, questionId } = params;
    const body = await req.json();
    const { prompt, choices, correct, explanation, order } = body;

    if (!prompt || !choices || !correct) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.learningQuestion.findFirst({
      where: { id: questionId, moduleId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const updated = await prisma.learningQuestion.update({
      where: { id: questionId },
      data: {
        prompt,
        choices,
        correct,
        explanation: explanation || null,
        order: parseInt(order) || 0,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating learning question:", error);
    return NextResponse.json({ error: "Failed to update learning question" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; questionId: string } }
) {
  try {
    await requireAdmin();

    const { id: moduleId, questionId } = params;

    const existing = await prisma.learningQuestion.findFirst({
      where: { id: questionId, moduleId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    await prisma.learningQuestion.delete({ where: { id: questionId } });

    return NextResponse.json({ message: "Question deleted" });
  } catch (error) {
    console.error("Error deleting learning question:", error);
    return NextResponse.json({ error: "Failed to delete learning question" }, { status: 500 });
  }
} 