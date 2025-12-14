import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, activityType, activityId } = await req.json();

    if (!userId || !activityType) {
      return NextResponse.json(
        { error: "User ID and activity type are required" },
        { status: 400 }
      );
    }

    // Get current referral settings
    const settingsResponse = await fetch(`${req.nextUrl.origin}/api/admin/referrals/settings`);
    let activityRewards = {
      practice: 10,
      competition: 15,
      daily_lesson: 8,
      any: 5
    };

    if (settingsResponse.ok) {
      const settings = await settingsResponse.json();
      activityRewards = settings.activityRewards || activityRewards;
    }

    // Determine gem reward based on activity type
    let gemReward = activityRewards.any; // default
    switch (activityType) {
      case 'practice':
        gemReward = activityRewards.practice;
        break;
      case 'competition':
        gemReward = activityRewards.competition;
        break;
      case 'daily_lesson':
        gemReward = activityRewards.daily_lesson;
        break;
      default:
        gemReward = activityRewards.any;
    }

    // Placeholder implementation - will be updated when database schema is ready
    console.log(`Triggering referral reward for user ${userId}, activity: ${activityType}, gems: ${gemReward}`);

    // TODO: Implement referral reward logic when database schema is updated
    // 1. Check if user was referred by someone
    // 2. Check if this is their first activity of the required type
    // 3. Create referral reward record with activity-specific gem amount
    // 4. Send notification to referrer
    // 5. Update referrer's gem balance

    return NextResponse.json({ 
      message: "Referral reward triggered successfully",
      userId,
      activityType,
      activityId,
      gemReward
    });
  } catch (error) {
    console.error("Error triggering referral reward:", error);
    return NextResponse.json(
      { error: "Failed to trigger referral reward" },
      { status: 500 }
    );
  }
} 