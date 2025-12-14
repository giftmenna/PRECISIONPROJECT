import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("Testing database connection...");
    
    // Test basic database connection
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
    
    // Test regular competitions table
    try {
      const regularCount = await prisma.competition.count();
      console.log("Regular competitions count:", regularCount);
    } catch (error) {
      console.error("Error accessing regular competitions:", error);
    }
    
    // Test grade competitions table
    try {
      const gradeCount = await prisma.gradeCompetition.count();
      console.log("Grade competitions count:", gradeCount);
    } catch (error) {
      console.error("Error accessing grade competitions:", error);
    }
    
    return NextResponse.json({
      message: "Database test completed",
      userCount,
      regularCompetitionsCount: await prisma.competition.count().catch(() => 'Error'),
      gradeCompetitionsCount: await prisma.gradeCompetition.count().catch(() => 'Error')
    });

  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      { error: "Database test failed", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 