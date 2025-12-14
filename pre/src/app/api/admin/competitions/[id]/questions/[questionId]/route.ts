import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// PUT - Update a question
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId } = await params;
    const body = await req.json();

    let updateData: any = {};

    // If it's just an activation toggle
    if (body.hasOwnProperty('isActive')) {
      updateData.isActive = body.isActive;
    } else {
      // Full question update
      const { prompt, choices, correct, topic, difficulty, imageUrl, timeLimit, requiredGrade, requiredGems } = body;
      updateData = {
        prompt,
        choices,
        correct,
        topic,
        difficulty,
        imageUrl: imageUrl || null,
        timeLimit: timeLimit || 60,
        requiredGrade: requiredGrade || null,
        requiredGems: requiredGems || 0
      };
    }

    const question = await prisma.mathQuestion.update({
      where: { id: questionId },
      data: updateData
    });

    return NextResponse.json({
      message: "Question updated successfully",
      question
    });

  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a question
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId } = await params;

    await prisma.mathQuestion.delete({
      where: { id: questionId }
    });

    return NextResponse.json({
      message: "Question deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
} 