import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Competition, GradeCompetition, TestSet, MathQuestion, Prisma } from "@prisma/client";
import Decimal = Prisma.Decimal;

// Define a unified type for the final competition object
type CompetitionItem = {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  isLive: boolean;
  isUpcoming: boolean;
  isCompleted: boolean;
  prizePool: number;
  difficulty: string;
  type: 'weekly' | 'grade' | 'testset' | 'test';
  entryFee: number;
  entryPriceNgn?: number;
  entryType?: string;
  grade?: string;
  requiredGrade?: string;
  currentParticipants?: number;
  totalQuestions?: number;
  questionData?: any; // Define more specific types if needed
  testSetData?: any;  // Define more specific types if needed
};

// Helper function to transform a regular competition
const transformRegularCompetition = (
  competition: Competition & { _count: { entries: number } }
): CompetitionItem => {
  const now = new Date();
  const startTime = new Date(competition.startsAt);
  const endTime = new Date(competition.endsAt);
  const isActive = competition.status === 'ACTIVE';

  return {
    id: competition.id,
    title: competition.name,
    description: competition.description || '',
    startTime: competition.startsAt.toISOString(),
    endTime: competition.endsAt.toISOString(),
    currentParticipants: competition._count.entries,
    isActive,
    isLive: isActive && now >= startTime && now <= endTime,
    isUpcoming: competition.status === 'COMING_SOON' || (isActive && now < startTime),
    isCompleted: competition.status === 'COMPLETED' || (isActive && now > endTime),
    prizePool: Number(competition.prizeCashNgn),
    difficulty: 'MEDIUM', // Assuming default, adjust if available on model
    type: 'weekly',
    entryFee: Number(competition.entryPriceGem) || 0,
    entryPriceNgn: Number(competition.entryPriceNgn) || 0,
    entryType: competition.entryType,
    totalQuestions: competition.totalQuestions || competition.questionsPerDrop,
  };
};

// Helper function to transform a grade competition
const transformGradeCompetition = (
  competition: GradeCompetition & { _count: { entries: number; questions: number } }
): CompetitionItem => {
  const now = new Date();
  const startTime = new Date(competition.startsAt);
  const endTime = new Date(competition.endsAt);

  return {
    id: `grade_${competition.id}`,
    title: competition.name,
    description: competition.description || '',
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    isActive: competition.status === 'ACTIVE',
    isLive: competition.status === 'ACTIVE' && now >= startTime && now <= endTime,
    isUpcoming: competition.status === 'ACTIVE' && now < startTime,
    isCompleted: competition.status === 'COMPLETED' || (competition.status === 'ACTIVE' && now > endTime),
    prizePool: 0,
    difficulty: 'MEDIUM',
    type: 'grade',
    grade: competition.grade,
    entryFee: Number(competition.entryFee) || 0,
    totalQuestions: competition._count.questions,
    currentParticipants: competition._count.entries,
  };
};

// Helper function to transform a test set
const transformTestSet = (
  set: TestSet & { questions: Partial<MathQuestion>[]; _count: { questions: number } }
): CompetitionItem => {
  const startTime = new Date();
  const endTime = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

  return {
    id: `testset_${set.id}`,
    title: `Test: ${set.name}`,
    description: set.description,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    currentParticipants: 0,
    isActive: true,
    isLive: true,
    isUpcoming: false,
    isCompleted: false,
    prizePool: 0,
    difficulty: 'MEDIUM',
    type: 'testset',
    entryFee: Number(set.requiredGems) || 0,
    requiredGrade: set.requiredGrade || undefined,
    testSetData: {
      id: set.id,
      name: set.name,
      description: set.description,
      questions: set.questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        choices: q.choices,
        correct: q.correctChoice,
        topic: q.topic,
        timeLimit: q.timeLimit || 60,
        imageUrl: q.imageUrl,
      })),
      totalQuestions: set._count.questions,
    },
  };
};

// Helper function to transform a single competition question
const transformCompetitionQuestion = (question: MathQuestion): CompetitionItem => {
  const startTime = new Date();
  const endTime = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

  return {
    id: `question_${question.id}`,
    title: `Competition Question: ${question.prompt.substring(0, 50)}...`,
    description: question.prompt,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    currentParticipants: 0,
    isActive: true,
    isLive: true,
    isUpcoming: false,
    isCompleted: false,
    prizePool: Number(question.gems) || 0,
    difficulty: question.difficulty || 'MEDIUM',
    type: 'test',
    entryFee: Number(question.requiredGems) || 0,
    requiredGrade: question.grade || undefined,
    questionData: {
      id: question.id,
      prompt: question.prompt,
      choices: question.choices,
      correct: question.correctChoice,
      topic: question.topic,
      timeLimit: question.timeLimit || 60,
      imageUrl: question.imageUrl,
      requiredGrade: question.grade,
      requiredGems: question.requiredGems,
    },
  };
};

export async function GET(req: NextRequest) {
  try {
    console.log("Starting to fetch competitions...");

    // Run all database queries in parallel for better performance
    const [
      regularCompetitions,
      testSets, // Explicitly type the result to resolve the mismatch
      gradeCompetitions,
      competitionQuestions,
    ] = await Promise.all([
      prisma.competition.findMany({
        where: {
          status: { in: ['COMING_SOON', 'ACTIVE', 'COMPLETED'] },
        },
        include: {
          _count: { select: { entries: true } },
        },
        orderBy: { startsAt: 'asc' },
      }),
      prisma.testSet.findMany({
        where: {
          isActive: true,
        },
        include: {
          questions: {
            where: { isActive: true },
            select: { id: true, prompt: true, choices: true, correctChoice: true, topic: true, timeLimit: true, imageUrl: true }
          },
          _count: { select: { questions: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.gradeCompetition.findMany({
        where: {
          status: { in: ['ACTIVE', 'COMPLETED'] },
        },
        include: {
          _count: { select: { entries: true, questions: true } },
        },
        orderBy: { startsAt: 'asc' },
      }),
      prisma.mathQuestion.findMany({
        where: {
          source: 'competition',
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    console.log(`Fetched ${regularCompetitions.length} regular, ${gradeCompetitions.length} grade, ${testSets.length} test sets, and ${competitionQuestions.length} single questions.`);

    // Combine all competitions
    const allCompetitions: CompetitionItem[] = [
      ...regularCompetitions.map(transformRegularCompetition),
      ...gradeCompetitions.map(transformGradeCompetition),
      ...testSets.map(transformTestSet),
      ...competitionQuestions.map(transformCompetitionQuestion),
    ];

    return NextResponse.json(allCompetitions);
  } catch (error) {
    console.error("Error fetching competitions:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Failed to fetch competitions", details: errorMessage },
      { status: 500 }
    );
  }
}