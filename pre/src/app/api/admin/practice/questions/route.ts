import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all practice questions (math questions)
    const questions = await prisma.mathQuestion.findMany({
      orderBy: { createdAt: 'desc' },
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
        gems: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching practice questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch practice questions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      prompt,
      choices,
      correctChoice,
      topic,
      difficulty,
      explanation,
      imageUrl,
      timeLimit,
      gems,
    } = body;

    // Create new question
    const question = await prisma.mathQuestion.create({
      data: {
        prompt,
        choices,
        correctChoice,
        topic,
        difficulty: difficulty || "medium",
        explanation,
        imageUrl,
        timeLimit: timeLimit || 60,
        gems: gems || 0,
        isActive: true,
        source: "PRACTICE",
      },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error("Error creating practice question:", error);
    return NextResponse.json(
      { error: "Failed to create practice question" },
      { status: 500 }
    );
  }
}
