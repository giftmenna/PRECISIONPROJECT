import * as bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export async function generateOTP(): Promise<string> {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function hashOTP(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export async function verifyOTP(otp: string, hashedOTP: string): Promise<boolean> {
  return bcrypt.compare(otp, hashedOTP);
}

export async function createOTPRecord(email: string, hashedOTP: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete any existing OTP records for this email first
  await prisma.oTPCode.deleteMany({
    where: { email: email.toLowerCase() }
  });

  // Create new OTP record
  await prisma.oTPCode.create({
    data: {
      email: email.toLowerCase(),
      codeHash: hashedOTP,
      expiresAt: expiresAt,
      // Note: attemptsLeft is not in the database schema
    }
  });
}

export async function getOTPRecord(email: string) {
  return prisma.oTPCode.findFirst({
    where: {
      email: email.toLowerCase(),
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function incrementOTPAttempts(email: string): Promise<void> {
  // Note: attemptsLeft field doesn't exist in schema, so this is a no-op for now
  // TODO: Add attemptsLeft field to OTPCode model if needed
  const otpRecord = await getOTPRecord(email);
  if (otpRecord) {
    // Skip update since attemptsLeft doesn't exist in schema
    console.log("OTP attempt logged for:", email);
  }
}

export async function deleteOTPRecord(email: string): Promise<void> {
  await prisma.oTPCode.deleteMany({
    where: { email: email.toLowerCase() }
  });
} 