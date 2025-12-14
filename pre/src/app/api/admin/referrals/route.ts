import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Placeholder data until database schema is updated
    const referrals = [
      {
        id: "1",
        referrerName: "John Doe",
        referrerEmail: "john@example.com",
        referredUserName: "Jane Smith",
        referredUserEmail: "jane@example.com",
        referralCode: "JOHN123",
        status: "pending",
        gemsAmount: 10,
        activityType: "practice",
        createdAt: new Date().toISOString(),
      }
    ];

    return NextResponse.json(referrals);
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
} 