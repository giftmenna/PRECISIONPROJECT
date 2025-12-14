import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Create a test learning module
    const testModule = await prisma.learningModule.create({
      data: {
        title: "Direct Proportion",
        description: "Learn about direct proportion relationships in mathematics",
        topic: "algebra",
        notes: "In our daily lives, we often come across situations where two quantities are related in such a way that when one quantity increases, the other also increases proportionally.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Example video URL
        duration: 330, // 5:30 in seconds
        gemsReward: 0.01,
        isActive: true,
        order: 1,
        questions: {
          create: [
            {
              prompt: "If Mrs. Judith receives #9,000 for 10 days as her pay, how much does she make in 15 days?",
              choices: {
                "A": "#13,500",
                "B": "#12,000", 
                "C": "#14,000",
                "D": "#13,000"
              },
              correct: "A",
              explanation: "Using direct proportion: 9000/10 = x/15. Cross multiply: 9000 × 15 = 10 × x. Therefore, x = 135,000/10 = 13,500.",
              order: 1
            }
          ]
        }
      },
      include: {
        questions: true
      }
    });

    return NextResponse.json({ 
      success: true,
      message: "Test module created successfully",
      module: testModule
    });
  } catch (error) {
    console.error("Error creating test module:", error);
    return NextResponse.json(
      { 
        error: "Failed to create test module",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 