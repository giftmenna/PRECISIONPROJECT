import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Test 1: Check if Prisma is working
    console.log("Testing Prisma connection...");
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);

    // Test 2: Check environment variables
    const envCheck = {
      DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Missing",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "Missing",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Set" : "Missing",
      EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || "Missing",
      GMAIL_USER: process.env.GMAIL_USER ? "Set" : "Missing",
    };

    return NextResponse.json({
      success: true,
      message: "Test endpoint working",
      userCount,
      environment: envCheck,
      nodeEnv: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
