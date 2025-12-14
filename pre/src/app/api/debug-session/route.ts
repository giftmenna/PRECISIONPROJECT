import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      hasSession: !!session,
      sessionData: session,
      userAgent: req.headers.get("user-agent"),
      cookies: req.headers.get("cookie"),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to get session",
      details: error,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 