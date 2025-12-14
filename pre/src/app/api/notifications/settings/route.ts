import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { notificationSettings: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create default settings if none exist
    if (!user.notificationSettings) {
      const defaultSettings = await prisma.notificationSettings.create({
        data: {
          userId: user.id,
          pushEnabled: true,
          emailEnabled: true,
          newQuestionsEnabled: true,
          competitionEnabled: true,
          practiceEnabled: true,
          reminderEnabled: true,
          welcomeMessagesEnabled: true
        }
      });

      return NextResponse.json({
        settings: defaultSettings
      });
    }

    return NextResponse.json({
      settings: user.notificationSettings
    });

  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { notificationSettings: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates = await req.json();

    // Create settings if they don't exist
    if (!user.notificationSettings) {
      const newSettings = await prisma.notificationSettings.create({
        data: {
          userId: user.id,
          pushEnabled: updates.pushEnabled ?? true,
          emailEnabled: updates.emailEnabled ?? true,
          newQuestionsEnabled: updates.newQuestionsEnabled ?? true,
          competitionEnabled: updates.competitionEnabled ?? true,
          practiceEnabled: updates.practiceEnabled ?? true,
          reminderEnabled: updates.reminderEnabled ?? true,
          welcomeMessagesEnabled: updates.welcomeMessagesEnabled ?? true
        }
      });

      return NextResponse.json({
        settings: newSettings
      });
    }

    // Update existing settings
    const updatedSettings = await prisma.notificationSettings.update({
      where: { userId: user.id },
      data: updates
    });

    return NextResponse.json({
      settings: updatedSettings
    });

  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    );
  }
} 