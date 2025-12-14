import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { PushNotificationService } from "@/lib/push-notification-service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionCount, topic, sendToAll } = await req.json();

    if (!questionCount || questionCount <= 0) {
      return NextResponse.json(
        { error: "Invalid question count" },
        { status: 400 }
      );
    }

    // Send push notification for new questions
    const result = await PushNotificationService.sendNewQuestionsNotification(
      questionCount,
      topic,
      sendToAll || false
    );

    return NextResponse.json({
      success: true,
      message: "Push notifications sent successfully",
      result
    });

  } catch (error) {
    console.error("Error sending push notifications:", error);
    return NextResponse.json(
      { error: "Failed to send push notifications" },
      { status: 500 }
    );
  }
} 