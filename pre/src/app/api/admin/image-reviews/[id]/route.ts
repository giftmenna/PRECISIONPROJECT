import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { reviewStatus, reviewNotes, isCorrect } = await req.json();

    const updatedImageUpload = await prisma.competitionImageUpload.update({
      where: { id: params.id },
      data: {
        reviewStatus,
        reviewNotes,
        isCorrect,
        reviewedBy: (session.user as any).id,
        reviewedAt: new Date()
      }
    });

    return NextResponse.json({
      message: "Review updated successfully",
      imageUpload: updatedImageUpload
    });

  } catch (error) {
    console.error("Update image review error:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
} 