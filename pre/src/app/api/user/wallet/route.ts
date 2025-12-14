import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase();
    
    // Get or create user wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: session.user.id,
          gemsBalance: 0,
        },
      });
    }

    return NextResponse.json({
      gemsBalance: wallet.gemsBalance.toString(),
      walletId: wallet.id,
    });

  } catch (error) {
    console.error("Error fetching user wallet:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, amount, reason } = await req.json();

    if (action !== 'deduct') {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Get user wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: session.user.id,
          gemsBalance: 0,
        },
      });
    }

    const currentBalance = parseFloat(wallet.gemsBalance.toString());
    
    if (currentBalance < amount) {
      return NextResponse.json({ 
        error: "Insufficient gems",
        currentBalance: currentBalance,
        requiredAmount: amount
      }, { status: 400 });
    }

    const newBalance = currentBalance - amount;

    // Update wallet
    const updatedWallet = await prisma.wallet.update({
      where: { userId: session.user.id },
      data: { gemsBalance: newBalance }
    });

    // Record the transaction
    await prisma.walletLedger.create({
      data: {
        walletId: wallet.id,
        amount: -amount,
        type: 'ENTRY_FEE_GEM',
        refType: 'TEST_QUESTION',
        refId: reason || 'Test question entry'
      }
    });

    return NextResponse.json({
      success: true,
      newBalance: newBalance,
      deductedAmount: amount,
      message: "Gems deducted successfully"
    });

  } catch (error) {
    console.error("Error updating wallet:", error);
    return NextResponse.json(
      { error: "Failed to update wallet" },
      { status: 500 }
    );
  }
} 