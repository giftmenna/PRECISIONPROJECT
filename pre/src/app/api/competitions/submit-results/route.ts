import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { competitionId, score, totalQuestions, gemsEarned, timeSpent, startTime } = await req.json();

    const userEmail = session.user.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { wallet: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify competition entry exists
    const entry = await prisma.competitionEntry.findUnique({
      where: {
        competitionId_userId: {
          competitionId,
          userId: user.id
        }
      }
    });

    if (!entry) {
      return NextResponse.json({ error: "No competition entry found" }, { status: 404 });
    }

    // Calculate final gem reward based on performance
    const accuracy = score / totalQuestions;
    const timeBonus = Math.max(0, (1800 - timeSpent) / 1800) * 0.5; // Time bonus up to 50%
    const finalGemReward = gemsEarned * (1 + timeBonus);

    // Update user's wallet with earned gems
    if (finalGemReward > 0) {
      if (user.wallet) {
        await prisma.wallet.update({
          where: { id: user.wallet.id },
          data: {
            gemsBalance: {
              increment: finalGemReward
            }
          }
        });

        // Add ledger entry
        await prisma.walletLedger.create({
          data: {
            walletId: user.wallet.id,
            amount: finalGemReward,
            type: 'COMPETITION_REWARD',
            refType: 'competition',
            refId: competitionId
          }
        });
      } else {
        // Create new wallet
        const newWallet = await prisma.wallet.create({
          data: {
            userId: user.id,
            gemsBalance: finalGemReward
          }
        });

        // Add ledger entry
        await prisma.walletLedger.create({
          data: {
            walletId: newWallet.id,
            amount: finalGemReward,
            type: 'COMPETITION_REWARD',
            refType: 'competition',
            refId: competitionId
          }
        });
      }
    }

    // Update competition entry status to confirmed (already paid and completed)
    await prisma.competitionEntry.update({
      where: {
        competitionId_userId: {
          competitionId,
          userId: user.id
        }
      },
      data: {
        status: 'CONFIRMED'
      }
    });

    // Create leaderboard entry
    await prisma.competitionLeaderboard.upsert({
      where: {
        competitionId_userId: {
          competitionId,
          userId: user.id
        }
      },
      update: {
        gemsEarned: finalGemReward,
        correctTotal: score,
        avgTimeMs: Math.round((timeSpent / totalQuestions) * 1000) // Convert to milliseconds
      },
      create: {
        competitionId,
        userId: user.id,
        gemsEarned: finalGemReward,
        correctTotal: score,
        avgTimeMs: Math.round((timeSpent / totalQuestions) * 1000)
      }
    });

    return NextResponse.json({
      message: "Competition results submitted successfully",
      result: {
        score,
        totalQuestions,
        accuracy: accuracy * 100,
        gemsEarned: finalGemReward,
        timeBonus: timeBonus * 100
      }
    });

  } catch (error) {
    console.error("Error submitting competition results:", error);
    return NextResponse.json(
      { error: "Failed to submit competition results" },
      { status: 500 }
    );
  }
} 