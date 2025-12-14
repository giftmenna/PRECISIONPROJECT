import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/lib/notification-service";

export async function GET(req: NextRequest) {
  try {
    // Verify this is a legitimate cron request (you can add more security)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

    // Find scheduled notifications that are due to be sent
    const scheduledNotifications = await prisma.notification.findMany({
      where: {
        scheduledAt: {
          not: null,
          lte: thirtyMinutesFromNow
        },
        isRead: false
      },
      include: {
        user: true
      }
    });

    const results = [];

    for (const notification of scheduledNotifications) {
      try {
        // Send the real-time notification
        await NotificationService.sendRealTimeNotification(
          notification.userId,
          {
            type: notification.type as any,
            title: notification.title,
            message: notification.message,
            data: notification.data
          }
        );

        // Mark as sent (you could add a 'sent' field to track this)
        await prisma.notification.update({
          where: { id: notification.id },
          data: { scheduledAt: null } // Remove scheduled time to mark as sent
        });

        results.push({
          id: notification.id,
          status: 'sent',
          userId: notification.userId
        });
      } catch (error) {
        console.error(`Failed to send scheduled notification ${notification.id}:`, error);
        results.push({
          id: notification.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Also check for competitions starting soon
    const upcomingCompetitions = await prisma.competition.findMany({
      where: {
        startsAt: {
          gte: now,
          lte: thirtyMinutesFromNow
        },
        status: "ACTIVE"
      }
    });

    for (const competition of upcomingCompetitions) {
      try {
        await NotificationService.sendCompetitionNotification({
          id: competition.id,
          name: competition.name,
          startsAt: competition.startsAt,
          entryPriceGem: competition.entryPriceGem ? Number(competition.entryPriceGem) : undefined
        });
      } catch (error) {
        console.error(`Failed to send competition notification for ${competition.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      scheduledNotificationsSent: results.length,
      upcomingCompetitions: upcomingCompetitions.length,
      results
    });

  } catch (error) {
    console.error("Error in scheduled notification cron:", error);
    return NextResponse.json(
      { error: "Failed to process scheduled notifications" },
      { status: 500 }
    );
  }
} 