import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const topic = searchParams.get('topic');
    const difficulty = searchParams.get('difficulty');

    console.log('Practice API - Request params:', { limit, topic, difficulty });

    // Build where conditions
    const whereConditions: any = {
      isActive: true, // Only fetch active questions
      source: "PRACTICE", // Only fetch practice questions
    };

    if (topic) {
      whereConditions.topic = topic; // Use 'topic' not 'topicKey' (Prisma field name)
    }

    if (difficulty) {
      whereConditions.difficulty = difficulty;
    }

    // Fetch questions from database
    const questions = await prisma.mathQuestion.findMany({
      where: whereConditions,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        prompt: true,
        choices: true,
        correctChoice: true,
        topic: true,
        difficulty: true,
        explanation: true,
        imageUrl: true,
        timeLimit: true,
        gems: true
      }
    });

    console.log(`Found ${questions.length} questions`);

    // Transform questions to match expected format
    const transformedQuestions = questions.map(q => {
      // Parse choices
      let choices: string[] = [];
      let correctAnswer = q.correctChoice;

      try {
        if (typeof q.choices === 'string') {
          const parsed = JSON.parse(q.choices);
        if (Array.isArray(parsed)) {
          choices = parsed.filter((c: any) => c && typeof c === 'string') as string[];
        } else if (typeof parsed === 'object' && parsed !== null) {
          choices = Object.values(parsed).filter((c: any) => c && typeof c === 'string') as string[];
        }
      } else if (Array.isArray(q.choices)) {
        choices = q.choices.filter((c: any) => c && typeof c === 'string') as string[];
      } else if (typeof q.choices === 'object' && q.choices !== null) {
        choices = Object.values(q.choices).filter((c: any) => c && typeof c === 'string') as string[];
        }

        // If choices is an object and correctChoice is a key
        if (typeof q.choices === 'object' && q.choices !== null && !Array.isArray(q.choices)) {
          const choiceKeys = Object.keys(q.choices);
          if (choiceKeys.includes(q.correctChoice)) {
            correctAnswer = String(q.choices[q.correctChoice as keyof typeof q.choices]);
          }
        }
      } catch (error) {
        console.error('Error parsing choices for question:', q.id, error);
        choices = ['A', 'B', 'C', 'D']; // Fallback
      }

      return {
        id: q.id,
        prompt: q.prompt,
        choices: choices,
        correct: correctAnswer,
        topic: q.topic,
        difficulty: q.difficulty || 'medium',
        explanation: q.explanation || undefined,
        imageUrl: q.imageUrl || undefined,
        timeLimit: q.timeLimit || 0,
        gems: q.gems || 0
      };
    });

    return NextResponse.json({
      questions: transformedQuestions,
      total: transformedQuestions.length
    });

  } catch (error: any) {
    console.error("Practice API Error:", {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        error: "Failed to fetch practice questions",
        details: error.message
      },
      { status: 500 }
    );
  }
}