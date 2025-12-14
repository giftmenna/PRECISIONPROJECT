import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Calculate date 60 days ago
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Delete old competition image uploads
    const deletedCompetitionImages = await prisma.competitionImageUpload.deleteMany({
      where: {
        uploadedAt: {
          lt: sixtyDaysAgo
        }
      }
    });

    // Delete old grade competition image uploads
    const deletedGradeImages = await prisma.gradeCompetitionImageUpload.deleteMany({
      where: {
        uploadedAt: {
          lt: sixtyDaysAgo
        }
      }
    });

    return NextResponse.json({
      message: "Image cleanup completed successfully",
      deletedCompetitionImages: deletedCompetitionImages.count,
      deletedGradeImages: deletedGradeImages.count,
      cleanupDate: sixtyDaysAgo
    });

  } catch (error) {
    console.error("Image cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to cleanup images" },
      { status: 500 }
    );
  }
} 