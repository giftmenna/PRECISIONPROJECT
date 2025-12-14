import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      prompt, 
      choices, 
      correct, 
      topic, 
      difficulty, 
      imageUrl,
      timeLimit = 60
    } = await req.json();

    if (!prompt || !topic || !difficulty) {
      return NextResponse.json(
        { error: "Missing required fields: prompt, topic, and difficulty are required" },
        { status: 400 }
      );
    }

    if (!choices || choices.length === 0 || !correct) {
      return NextResponse.json(
        { error: "Multiple choice questions require choices and correct answer" },
        { status: 400 }
      );
    }

    // Validate that choices array contains the correct answer
    if (!choices.includes(correct)) {
      return NextResponse.json(
        { error: "Correct answer must be one of the provided choices" },
        { status: 400 }
      );
    }

    const question = await prisma.gradeCompetitionQuestion.update({
      where: { id: params.id },
      data: {
        prompt,
        choices,
        correct,
        topic,
        difficulty,
        imageUrl,
        timeLimit
      }
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error updating grade competition question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
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
    
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.gradeCompetitionQuestion.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting grade competition question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
} 