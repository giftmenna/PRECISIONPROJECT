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

    const { amount, gemAmount, packageName } = await req.json();

    if (!amount || !gemAmount || !packageName) {
      return NextResponse.json(
        { error: "Missing required fields: amount, gemAmount, packageName" },
        { status: 400 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate reference for payment
    const reference = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // For now, skip database storage until migration is complete
    // TODO: Uncomment after database migration
    // const payment = await prisma.paymentTransaction.create({
    //   data: {
    //     userId: user.id,
    //     amount: amount,
    //     gemAmount: gemAmount,
    //     packageName: packageName,
    //     status: "PENDING",
    //     paymentMethod: "PAYSTACK",
    //     reference: reference,
    //   },
    // });

    // Initialize Paystack payment
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: amount * 100, // Paystack expects amount in kobo
        reference: reference,
        callback_url: `${process.env.NEXTAUTH_URL || 'https://precisionaw-gj052m6vf-giftmennas-projects.vercel.app'}/pricing?payment=success`,
        metadata: {
          user_id: user.id,
          gem_amount: gemAmount,
          package_name: packageName,
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      return NextResponse.json(
        { error: "Failed to initialize payment", details: paystackData },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
    });

  } catch (error) {
    console.error("Error initializing payment:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
} 