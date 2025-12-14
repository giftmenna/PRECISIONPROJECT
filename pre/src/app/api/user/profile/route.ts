/**
 * TODO: Create src/app/api/messages/route.ts with the direct messaging API
 * See the implementation code at the bottom of this file or in the chat
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if requesting another user's profile
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get('userId');

    let user;
    if (requestedUserId) {
      // Fetch the requested user's profile
      user = await prisma.user.findUnique({
        where: { id: requestedUserId },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          grade: true,
          gender: true,
          age: true,
          country: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          emailVerified: true
        }
      });
    } else {
      // Fetch the logged-in user's own profile
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          grade: true,
          gender: true,
          age: true,
          country: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          emailVerified: true
        }
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, grade: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { name, gender, age, country, grade } = await req.json();

    // Validate gender if provided
    if (gender !== undefined) {
      const allowed = ["male", "female"];
      if (!allowed.includes(gender)) {
        return NextResponse.json({ error: "Invalid gender. Allowed values: male, female" }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (gender !== undefined) updateData.gender = gender;
    if (age !== undefined) updateData.age = age;
    if (country !== undefined) updateData.country = country;
    
    // Only allow grade update if it hasn't been set before
    if (grade !== undefined && !user.grade) {
      updateData.grade = grade;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        grade: true,
        gender: true,
        age: true,
        country: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        emailVerified: true
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
} 