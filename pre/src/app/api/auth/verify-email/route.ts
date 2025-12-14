import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOTPRecord, verifyOTP, incrementOTPAttempts, deleteOTPRecord } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();

    // Get OTP record
    const otpRecord = await getOTPRecord(emailLower);

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValid = await verifyOTP(otp, otpRecord.codeHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Update user email verification status
    await prisma.user.update({
      where: { email: emailLower },
      data: { emailVerified: true }
    });

    // Delete OTP record
    await deleteOTPRecord(emailLower);

    // Get the user for session creation
    const user = await prisma.user.findUnique({
      where: { email: emailLower }
    });

    return NextResponse.json(
      { 
        message: "Email verified successfully",
        user: {
          id: user?.id,
          email: user?.email,
          name: user?.name
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
} 