import { NextResponse } from "next/server";
import { PushNotificationService } from "@/lib/push-notification-service";

export async function GET() {
  try {
    const vapidPublicKey = PushNotificationService.getVapidPublicKey();
    
    return NextResponse.json({
      vapidPublicKey
    });
  } catch (error) {
    console.error("Error getting VAPID key:", error);
    return NextResponse.json(
      { error: "VAPID key not configured" },
      { status: 500 }
    );
  }
} 