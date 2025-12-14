import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const modules = await prisma.learningModule.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: { questions: true }
        },
        attempts: session?.user?.email ? {
          where: {
            user: {
              email: session.user.email
            }
          },
          orderBy: {
            startedAt: 'desc'
          },
          take: 1
        } : false,
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Format modules with user progress
    const formattedModules = modules.map(module => ({
      ...module,
      userProgress: module.attempts && module.attempts.length > 0 ? {
        status: module.attempts[0].status,
        score: module.attempts[0].totalQuestions > 0 
          ? Math.round((module.attempts[0].score / module.attempts[0].totalQuestions) * 100)
          : 0,
        completedAt: module.attempts[0].completedAt
      } : undefined,
      attempts: undefined // Remove attempts from response
    }));

    return NextResponse.json({ modules: formattedModules });
  } catch (error) {
    console.error("Error fetching learning modules:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning modules" },
      { status: 500 }
    );
  }
} 