import { NextRequest, NextResponse } from "next/server";

// In-memory settings storage (replace with database storage later)
let referralSettings = {
  gemsPerReferral: 10,
  minimumActivityRequired: "practice",
  autoApprove: false,
  activityRewards: {
    practice: 10,
    competition: 15,
    daily_lesson: 8,
    any: 5
  }
};

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json(referralSettings);
  } catch (error) {
    console.error("Error fetching referral settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { gemsPerReferral, minimumActivityRequired, autoApprove, activityRewards } = body;

    // Update settings
    referralSettings = {
      gemsPerReferral: gemsPerReferral || 10,
      minimumActivityRequired: minimumActivityRequired || "practice",
      autoApprove: autoApprove || false,
      activityRewards: {
        practice: activityRewards?.practice || 10,
        competition: activityRewards?.competition || 15,
        daily_lesson: activityRewards?.daily_lesson || 8,
        any: activityRewards?.any || 5
      }
    };

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating referral settings:", error);
    return NextResponse.json(
      { error: "Failed to update referral settings" },
      { status: 500 }
    );
  }
} 