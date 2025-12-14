import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // No user authentication required - return empty attempts for guest users
    // This allows the practice page to work without requiring login
    
    return NextResponse.json({
      attempts: [],
      total: 0
    });

  } catch (error) {
    console.error("Error fetching user attempts:", error);
    return NextResponse.json(
      { error: "Failed to fetch user attempts" },
      { status: 500 }
    );
  }
} 