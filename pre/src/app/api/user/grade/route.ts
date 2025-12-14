import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { grade } = await req.json();

    if (!grade) {
      return NextResponse.json({ error: "Grade is required" }, { status: 400 });
    }

    const userEmail = session.user.email.toLowerCase();
    const user = await prisma.user.update({
      where: { email: userEmail },
      data: { grade }
    });

    return NextResponse.json({
      message: "Grade updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        grade: user.grade
      }
    });

  } catch (error) {
    console.error("Error updating user grade:", error);
    return NextResponse.json(
      { error: "Failed to update grade" },
      { status: 500 }
    );
  }
} 