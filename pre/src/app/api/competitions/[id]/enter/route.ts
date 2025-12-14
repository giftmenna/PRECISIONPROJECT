import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { wallet: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch competition
    const competition = await prisma.competition.findUnique({
      where: { id: params.id }
    });

    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    }

    if ((competition as any).status !== 'ACTIVE') {
      return NextResponse.json({ error: "Competition is not active" }, { status: 400 });
    }

    // Check if user already has an entry
    const existingEntry = await prisma.competitionEntry.findUnique({
      where: {
        competitionId_userId: {
          competitionId: params.id,
          userId: user.id
        }
      }
    });

    if (existingEntry) {
      return NextResponse.json({ error: "Already registered for this competition" }, { status: 400 });
    }

    // Check if user has enough gems (3 gems required)
    const requiredGems = 3;
    if (!user.wallet || Number(user.wallet.gemsBalance) < requiredGems) {
      return NextResponse.json({ 
        error: `Insufficient gems. Need ${requiredGems} gems to enter.` 
      }, { status: 402 });
    }

    // Deduct gems from wallet
    await prisma.wallet.update({
      where: { id: user.wallet.id },
      data: {
        gemsBalance: {
          decrement: requiredGems
        }
      }
    });

    // Add ledger entry for gem deduction
    await prisma.walletLedger.create({
      data: {
        walletId: user.wallet.id,
        amount: -requiredGems,
        type: 'ENTRY_FEE_GEM',
        refType: 'competition',
        refId: params.id
      }
    });

    // Create competition entry
    const entry = await prisma.competitionEntry.create({
      data: {
        competitionId: params.id,
        userId: user.id,
        status: 'CONFIRMED',
        method: 'GEM'
      }
    });

    return NextResponse.json({
      message: "Successfully entered competition",
      entry: {
        id: entry.id,
        status: entry.status,
        method: entry.method
      }
    });

  } catch (error) {
    console.error("Error entering competition:", error);
    return NextResponse.json(
      { error: "Failed to enter competition" },
      { status: 500 }
    );
  }
} 