import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET - Fetch all test sets
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testSets = await prisma.testSet.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      }
    });

    return NextResponse.json({ testSets });
  } catch (error) {
    console.error("Error fetching test sets:", error);
    return NextResponse.json(
      { error: "Failed to fetch test sets" },
      { status: 500 }
    );
  }
}

// POST - Create a new test set
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, requiredGems, requiredGrade, selectedQuestions, isActive, timeLimit, gemsReward, rewardRule, maxWrongAllowed, revealResultAtEnd } = await req.json();

    // Validation
    if (!name || !description || !selectedQuestions || selectedQuestions.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create the test set
    const testSet = await prisma.testSet.create({
      data: {
        name,
        description,
        requiredGems: requiredGems || 0,
        requiredGrade: requiredGrade || null,
        isActive: isActive || false,
        timeLimit: typeof timeLimit === 'number' ? timeLimit : 0,
        gemsReward: gemsReward ? Number(gemsReward) : null,
        rewardRule: rewardRule || 'ALL_CORRECT',
        maxWrongAllowed: typeof maxWrongAllowed === 'number' ? maxWrongAllowed : 0,
        revealResultAtEnd: typeof revealResultAtEnd === 'boolean' ? revealResultAtEnd : true,
        questions: {
          connect: selectedQuestions.map((questionId: string) => ({ id: questionId }))
        }
      },
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      }
    });

    return NextResponse.json({ 
      testSet,
      message: "Test set created successfully" 
    });

  } catch (error) {
    console.error("Error creating test set:", error);
    return NextResponse.json(
      { error: "Failed to create test set" },
      { status: 500 }
    );
  }
} 