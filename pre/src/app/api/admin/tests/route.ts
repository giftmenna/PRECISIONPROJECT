import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET - Fetch all tests (alias of test sets)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tests = await prisma.testSet.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    return NextResponse.json({ tests });
  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 });
  }
}

// POST - Create a new test (alias of test set create)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      name,
      description,
      requiredGems,
      requiredGrade,
      selectedQuestions,
      isActive,
      timeLimit,
      gemsReward,
      rewardRule,
      maxWrongAllowed,
      revealResultAtEnd,
    } = await req.json();

    if (!name || !description || !selectedQuestions || selectedQuestions.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const test = await prisma.testSet.create({
      data: {
        name,
        description,
        requiredGems: requiredGems || 0,
        requiredGrade: requiredGrade || null,
        isActive: isActive || false,
        timeLimit: typeof timeLimit === "number" ? timeLimit : 0,
        gemsReward: gemsReward ? Number(gemsReward) : null,
        rewardRule: rewardRule || "ALL_CORRECT",
        maxWrongAllowed: typeof maxWrongAllowed === "number" ? maxWrongAllowed : 0,
        revealResultAtEnd: typeof revealResultAtEnd === "boolean" ? revealResultAtEnd : true,
        questions: {
          connect: selectedQuestions.map((questionId: string) => ({ id: questionId })),
        },
      },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    return NextResponse.json({ test, message: "Test created successfully" });
  } catch (error) {
    console.error("Error creating test:", error);
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 });
  }
} 