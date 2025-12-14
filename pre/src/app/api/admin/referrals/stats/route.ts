import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Placeholder data until database schema is updated
    return NextResponse.json({
      totalReferrals: 0,
      totalRewardsPaid: 0,
      pendingRewards: 0,
      activeReferrers: 0
    });
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral statistics" },
      { status: 500 }
    );
  }
} 