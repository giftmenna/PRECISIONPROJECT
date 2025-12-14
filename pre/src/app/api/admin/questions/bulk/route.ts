import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questions } = await req.json();

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Invalid questions data" },
        { status: 400 }
      );
    }

    const createdQuestions = [];

    for (const questionData of questions) {
      const { prompt, choices, correct, topic, difficulty, explanation } = questionData;

      if (!prompt || !topic || !difficulty || !correct) {
        continue; // Skip invalid questions
      }

      try {
        const questionDataToCreate = {
          // Required fields
          prompt,
          topic,
          difficulty,
          choices: choices || {},
          correctChoice: correct,
          correct: correct, // Some Prisma versions might need this
          explanation: explanation || null,
          timeLimit: 60,
          gems: 0,
          grade: null,
          position: 0,
          // Required fields with default values
          source: 'admin_bulk_upload',
          uidExternal: `bulk_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
          // Timestamps
          createdAt: new Date(),
          updatedAt: new Date(),
          // Set isActive to true by default
          isActive: true
        };

        const question = await prisma.mathQuestion.create({
          data: questionDataToCreate
        });
        createdQuestions.push(question);
      } catch (error) {
        console.error("Error creating question:", error);
        // Continue with other questions
      }
    }

    return NextResponse.json({
      message: `Successfully created ${createdQuestions.length} questions`,
      createdCount: createdQuestions.length,
      questions: createdQuestions
    });
  } catch (error) {
    console.error("Error bulk uploading questions:", error);
    return NextResponse.json(
      { error: "Failed to bulk upload questions" },
      { status: 500 }
    );
  }
} 