import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import { join } from "path";

const avatarOptions = {
  sparkles: "sparkles.svg",
  zap: "zap.svg", 
  star: "star.svg",
  heart: "heart.svg",
  crown: "crown.svg",
  shield: "shield.svg",
  target: "target.svg"
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { avatarId } = await req.json();

    if (!avatarId || !avatarOptions[avatarId as keyof typeof avatarOptions]) {
      return NextResponse.json({ error: "Invalid avatar ID" }, { status: 400 });
    }

    const userEmail = session.user.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Read the SVG file and convert to base64
    const avatarFileName = avatarOptions[avatarId as keyof typeof avatarOptions];
    const avatarPath = join(process.cwd(), "public", "avatars", avatarFileName);
    
    try {
      const svgContent = await readFile(avatarPath, 'utf-8');
      const base64Data = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;

      // Update user's avatar in database with base64 data
      await prisma.user.update({
        where: { id: user.id },
        data: { avatar: base64Data }
      });

      return NextResponse.json({
        message: "Avatar selected successfully",
        avatarUrl: base64Data
      });
    } catch (fileError) {
      console.error("Error reading avatar file:", fileError);
      return NextResponse.json(
        { error: "Failed to load avatar file" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Avatar selection error:", error);
    return NextResponse.json(
      { error: "Failed to select avatar" },
      { status: 500 }
    );
  }
} 