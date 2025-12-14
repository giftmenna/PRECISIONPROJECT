import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const PAYSTACK_SECRET_KEY = "sk_test_54bac629f29f850504ab96fd15abd6226a4a8082";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { error: "Missing reference" },
        { status: 400 }
      );
    }

    // For now, skip database lookup until migration is complete
    // TODO: Uncomment after database migration
    // const paymentTransaction = await prisma.paymentTransaction.findUnique({
    //   where: { reference },
    //   include: { user: { include: { wallet: true } } },
    // });

    // if (!paymentTransaction) {
    //   return NextResponse.json(
    //     { error: "Payment transaction not found" },
    //     { status: 404 }
    //   );
    // }

    // Get user details directly
    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase() },
      include: { wallet: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      return NextResponse.json(
        { error: "Failed to verify payment", details: paystackData },
        { status: 400 }
      );
    }

    const transaction = paystackData.data;

    if (transaction.status === "success") {
      // For now, add gems directly without payment transaction tracking
      // TODO: Add payment transaction tracking after database migration
      
      // Get or create user wallet
      let wallet = user.wallet;
      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: {
            userId: user.id,
            gemsBalance: 0,
          },
        });
      }

      // Add gems to wallet (hardcoded for now - should come from payment transaction)
      const gemsToAdd = 25; // Default gems for testing
      
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          gemsBalance: {
            increment: gemsToAdd,
          },
        },
      });

      // Add ledger entry
      await prisma.walletLedger.create({
        data: {
          walletId: wallet.id,
          amount: gemsToAdd,
          type: "ADMIN_ADJUSTMENT",
          refType: "gem_purchase",
          refId: reference,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Payment verified and gems added successfully",
        gemsAdded: gemsToAdd,
        newBalance: Number(wallet.gemsBalance) + gemsToAdd,
      });
    } else {
      return NextResponse.json(
        { error: "Payment verification failed", status: transaction.status },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
} 