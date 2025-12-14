import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const imageUploads = await prisma.competitionImageUpload.findMany({
      include: {
        competition: {
          select: {
            name: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        },
        question: {
          select: {
            question: true,
            topic: true
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    return NextResponse.json({ imageUploads });

  } catch (error) {
    console.error("Get image uploads error:", error);
    return NextResponse.json(
      { error: "Failed to fetch image uploads" },
      { status: 500 }
    );
  }
} 