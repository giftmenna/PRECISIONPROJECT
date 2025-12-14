import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const competitionId = formData.get('competitionId') as string;
    const questionId = formData.get('questionId') as string;
    const imageFile = formData.get('image') as File;

    if (!competitionId || !questionId || !imageFile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Check if competition exists and requires image upload
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId }
    });

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    // Check if question exists
    const question = await prisma.mathQuestion.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = imageFile.name.split('.').pop();
    const fileName = `competition_${competitionId}_question_${questionId}_user_${session.user.id}_${timestamp}.${fileExtension}`;

    // For now, we'll store the file path. In production, you'd upload to cloud storage
    const imageUrl = `/uploads/competitions/${fileName}`;

    // Save image upload record
    const imageUpload = await prisma.competitionImageUpload.create({
      data: {
        competitionId,
        questionId,
        userId: (session.user as any).id,
        imageUrl,
        reviewStatus: 'PENDING'
      }
    });

    return NextResponse.json({
      message: "Image uploaded successfully",
      imageUpload
    });

  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
} 