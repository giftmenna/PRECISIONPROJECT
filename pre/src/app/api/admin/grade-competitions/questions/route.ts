import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role?.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const questions = await prisma.gradeCompetitionQuestion.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          prompt: true,
          choices: true,
          correct: true,
          topic: true,
          difficulty: true,
          imageUrl: true,
          timeLimit: true,
          position: true,
          createdAt: true
        }
      });

      return NextResponse.json(questions);
    } catch (dbError) {
      // If the table doesn't exist, return empty array
      console.log("Grade competition questions table may not exist yet, returning empty array");
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error fetching grade competition questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role?.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      prompt, 
      choices, 
      correct, 
      topic, 
      difficulty, 
      imageUrl,
      timeLimit = 60,
      competitionId
    } = await req.json();

    if (!prompt || !topic || !difficulty || !competitionId) {
      return NextResponse.json(
        { error: "Missing required fields: prompt, topic, difficulty, and competitionId are required" },
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

    // Get the next position for this competition
    const lastQuestion = await prisma.gradeCompetitionQuestion.findFirst({
      where: { competitionId },
      orderBy: { position: 'desc' }
    });
    
    const position = (lastQuestion?.position || 0) + 1;

    const question = await prisma.gradeCompetitionQuestion.create({
      data: {
        prompt,
        choices,
        correct,
        topic,
        difficulty,
        imageUrl,
        timeLimit,
        position,
        competitionId
      }
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error creating grade competition question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
} 