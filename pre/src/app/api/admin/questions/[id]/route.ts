import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET - Fetch a single question by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const question = await prisma.mathQuestion.findUnique({
      where: { id },
      select: {
        id: true,
        prompt: true,
        choices: true,
        correctChoice: true,
        topic: true,
        difficulty: true,
        imageUrl: true,
        timeLimit: true,
        grade: true,
        requiredGems: true,
        explanation: true,
        gems: true
      }
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // For daily lesson questions, check grade requirement
    if (question.dailyLessonId && question.grade) {
      const userGrade = (session.user as any)?.grade;
      if (userGrade && userGrade !== question.grade) {
        return NextResponse.json({ 
          error: `This question is for ${question.grade} students only` 
        }, { status: 403 });
      }
    }

    return NextResponse.json({
      question: {
        ...question,
        timeLimit: question.timeLimit || 60
      }
    });

  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}

// ... (previous imports remain the same)

// DELETE - Delete a question by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || typeof userRole !== "string" || userRole.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if question exists
    const question = await prisma.mathQuestion.findUnique({
      where: { id }
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Delete the question
    await prisma.mathQuestion.delete({
      where: { id }
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

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || typeof userRole !== "string" || userRole.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    // Handle different types of updates
    if (body.hasOwnProperty('isActive')) {
      // Convert isActive to boolean if it's a string
      const isActive = typeof body.isActive === 'string' 
        ? body.isActive.toLowerCase() === 'true'
        : Boolean(body.isActive);
      
      // Update isActive
      const question = await prisma.mathQuestion.update({
        where: { id },
        data: { isActive }
      });
      
      return NextResponse.json({ 
        message: "Question activation status updated successfully",
        question 
      });
    }

    // Full question update
    const { prompt, choices, correct, topic, difficulty, explanation, timeLimit, gems, grade, requiredGems } = body;
    
    // Create typed update data
    const updateData: {
      prompt?: any;
      topic?: any;
      difficulty?: any;
      explanation?: any;
      timeLimit?: number;
      gems?: number;
      grade?: any;
      requiredGems?: any;
      choices?: any;
      correctChoice?: string;
    } = {
      prompt,
      topic,
      difficulty,
      explanation,
      timeLimit: typeof timeLimit === 'number' ? timeLimit : undefined,
      gems: typeof gems === 'number' ? gems : undefined,
      grade,
      requiredGems
    };

    if (choices) {
      updateData.choices = choices;
      if (correct) {
        updateData.correctChoice = correct;
      }
    }

    const question = await prisma.mathQuestion.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ 
      message: "Question updated successfully",
      question 
    });
  } catch (error) {
    console.error("Error updating question:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: "Failed to update question", details: errorMessage },
      { status: 500 }
    );
  }
}