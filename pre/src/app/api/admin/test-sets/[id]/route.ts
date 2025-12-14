import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET - Fetch a single test set by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const testSet = await prisma.testSet.findUnique({
      where: { id },
      include: {
        questions: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            prompt: true,
            choices: true,
            correct: true,
            topic: true,
            difficulty: true,
            imageUrl: true,
            timeLimit: true
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      }
    });

    if (!testSet) {
      return NextResponse.json({ error: "Test set not found" }, { status: 404 });
    }

    // Check if test set is active
    if (!testSet.isActive) {
      return NextResponse.json({ error: "Test set not available" }, { status: 403 });
    }

    // For test sets, check grade requirement
    if (testSet.requiredGrade) {
      const userGrade = (session.user as any)?.grade;
      if (userGrade && userGrade !== testSet.requiredGrade) {
        return NextResponse.json({ 
          error: `This test set is for ${testSet.requiredGrade} students only` 
        }, { status: 403 });
      }
    }

    return NextResponse.json({
      testSet: {
        ...testSet,
        questions: testSet.questions.map(q => ({
          ...q,
          timeLimit: q.timeLimit || 60
        }))
      }
    });

  } catch (error) {
    console.error("Error fetching test set:", error);
    return NextResponse.json(
      { error: "Failed to fetch test set" },
      { status: 500 }
    );
  }
} 