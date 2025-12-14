import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP, hashOTP, createOTPRecord, deleteOTPRecord } from "@/lib/otp";
import { sendVerificationEmail } from "@/lib/email-service";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: emailLower }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete any existing OTP records for this email
    await deleteOTPRecord(emailLower);

    // Generate new OTP
    const otp = await generateOTP();
    const hashedOTP = await hashOTP(otp);
    await createOTPRecord(emailLower, hashedOTP);

    // Send verification email
    const emailResult = await sendVerificationEmail(emailLower, otp, user.name || undefined);

    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
      // Log OTP to console for development
      console.log("OTP for development:", otp);
      return NextResponse.json(
        { 
          message: "Verification code sent. Check console for OTP.",
          otp: process.env.NODE_ENV === "development" ? otp : undefined
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Verification code sent to your email" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
} 