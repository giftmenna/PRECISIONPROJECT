import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateOTP, hashOTP, createOTPRecord } from "@/lib/otp";
import { sendVerificationEmail } from "@/lib/email-service";
import { generateReferralCode } from "@/lib/referral-utils";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, referralCode } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Get IP address from request
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    let ipAddress = forwarded?.split(",")[0] || realIp || "unknown";

    // Clean up IPv6-mapped IPv4 addresses
    if (ipAddress.startsWith("::ffff:")) {
      ipAddress = ipAddress.replace("::ffff:", "");
    }

    // Handle localhost addresses
    if (ipAddress === "::1" || ipAddress === "127.0.0.1") {
      ipAddress = "localhost";
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Handle referral code if provided (placeholder until database schema is updated)
    let referredBy = null;
    if (referralCode) {
      console.log("Referral code provided:", referralCode);
      // TODO: Implement referral code lookup when database schema is updated
      // const referrer = await prisma.user.findUnique({
      //   where: { referralCode: referralCode }
      // });
      // if (referrer) {
      //   referredBy = referrer.id;
      // }
    }

    // Generate unique referral code for new user
    const newReferralCode = generateReferralCode();
    console.log("Generated referral code:", newReferralCode);

    // Create user
    const user = await (prisma.user.create as any)({
      data: {
        name,
        email: emailLower,
        password: hashedPassword,
        ipAddress,
        role: "user"
        // TODO: Add referralCode and referredBy when database schema is updated
        // referralCode: newReferralCode,
        // referredBy: referredBy
      }
    });

    // Generate and send OTP
    const otp = await generateOTP();
    const hashedOTP = await hashOTP(otp);
    
    try {
      await createOTPRecord(emailLower, hashedOTP);
    } catch (otpError) {
      console.error("OTP creation error:", otpError);
      // Continue with signup even if OTP creation fails
      console.log("OTP for development:", otp);
    }

    // Send verification email
    const emailResult = await sendVerificationEmail(emailLower, otp, name);

    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
      // Log OTP to console for development
      console.log("OTP for development:", otp);
      return NextResponse.json(
        { 
          message: "Account created but verification email failed. Check console for OTP.",
          otp: process.env.NODE_ENV === "development" ? otp : undefined
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { message: "Account created successfully. Please check your email for verification code." },
      { status: 201 }
    );

  } catch (error) {
    console.error("Signup error:", error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { 
        error: "Failed to create account",
        details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
} 