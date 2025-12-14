import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ];
    }

    if (status === "verified") {
      where.emailVerified = true;
    } else if (status === "unverified") {
      where.emailVerified = false;
    }

    // Get users with pagination and gem data
    const users = await (prisma.user.findMany as any)({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        ipAddress: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        wallet: {
          select: {
            gemsBalance: true
          }
        },
        _count: {
          select: {
            practiceAttempts: true,
            attempts: true
          }
        },
        practiceAttempts: {
          where: { isCorrect: true },
          select: { gemsEarned: true }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    });

    // Get total count
    const total = await prisma.user.count({ where });

    // Calculate activity data and gem statistics
    const usersWithActivity = users.map((user: any) => {
      const totalGemsEarned = user.practiceAttempts.reduce((sum: number, attempt: any) => 
        sum + Number(attempt.gemsEarned), 0
      );
      
      return {
        ...user,
        totalPracticeAttempts: user._count.practiceAttempts,
        totalCompetitionAttempts: user._count.attempts,
        totalGemsEarned: totalGemsEarned,
        currentGemsBalance: user.wallet ? Number(user.wallet.gemsBalance) : 0,
        lastActivity: user.updatedAt
      };
    });

    // Add hardcoded admin user to the results
    const adminUser = {
      id: "admin",
      name: "Admin",
      email: "admin@precisionaw.com",
      emailVerified: true,
      ipAddress: null,
      role: "ADMIN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalPracticeAttempts: 0,
      totalCompetitionAttempts: 0,
      totalGemsEarned: 0,
      currentGemsBalance: 0,
      lastActivity: new Date().toISOString(),
      isHardcoded: true
    };

    // Add admin user to the beginning of the list
    const allUsers = [adminUser, ...usersWithActivity];

    return NextResponse.json({
      users: allUsers,
      pagination: {
        page,
        limit,
        total: total + 1, // Include admin user in total
        pages: Math.ceil((total + 1) / limit)
      }
    });

  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userId, ...updateData } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await (prisma.user.update as any)({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
        ipAddress: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ user });

  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Delete user and all related data
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
} 