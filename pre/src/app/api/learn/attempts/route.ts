import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ attempts: [] });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ attempts: [] });
    }

    const attempts = await prisma.learningAttempt.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
    });

    return NextResponse.json({ attempts });
  } catch (error) {
    console.error("Error fetching learning attempts:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning attempts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { moduleId, score, totalQuestions } = await req.json();

    const session = await getServerSession(authOptions);

    // Resolve user
    let userId = "guest-user-id";
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (user) {
        userId = user.id;
      }
    }

    // Load module to determine server-side gems reward
    const module = await prisma.learningModule.findUnique({
      where: { id: moduleId },
      select: { gemsReward: true },
    });

    const computedGems = module?.gemsReward ? Number(module.gemsReward) : 0;

    // Create learning attempt record
    const attempt = await prisma.learningAttempt.create({
      data: {
        userId,
        moduleId,
        score,
        totalQuestions,
        gemsEarned: computedGems,
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    // If authenticated and gems > 0, credit wallet and add ledger
    if (userId !== "guest-user-id" && computedGems > 0) {
      await prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.upsert({
          where: { userId },
          create: { userId, gemsBalance: 0 },
          update: {},
        });

        await tx.wallet.update({
          where: { id: wallet.id },
          data: { gemsBalance: { increment: computedGems } },
        });

        await tx.walletLedger.create({
          data: {
            walletId: wallet.id,
            amount: computedGems,
            type: "PRACTICE_REWARD",
            refType: "LEARN_MODULE",
            refId: moduleId,
          },
        });
      });
    }

    return NextResponse.json({
      message: "Learning attempt saved successfully",
      attempt,
    });
  } catch (error) {
    console.error("Error saving learning attempt:", error);
    return NextResponse.json(
      { error: "Failed to save learning attempt" },
      { status: 500 }
    );
  }
} 