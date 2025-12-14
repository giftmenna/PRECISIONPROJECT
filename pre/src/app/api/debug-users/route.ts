import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Get all users with their wallet and practice data
    const users = await prisma.user.findMany({
      include: {
        wallet: true,
        practiceAttempts: {
          where: { isCorrect: true },
          select: { gemsEarned: true, createdAt: true }
        },
        _count: {
          select: {
            practiceAttempts: true
          }
        }
      }
    });

    const usersWithGems = users.map(user => {
      const totalGemsEarned = user.practiceAttempts.reduce((sum, attempt) => 
        sum + Number(attempt.gemsEarned), 0
      );
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        wallet: user.wallet ? {
          id: user.wallet.id,
          gemsBalance: Number(user.wallet.gemsBalance),
          createdAt: user.wallet.createdAt,
          updatedAt: user.wallet.updatedAt
        } : null,
        practiceStats: {
          totalAttempts: user._count.practiceAttempts,
          totalGemsEarned: totalGemsEarned,
          practiceAttempts: user.practiceAttempts.map(attempt => ({
            gemsEarned: Number(attempt.gemsEarned),
            createdAt: attempt.createdAt
          }))
        }
      };
    });

    return NextResponse.json({
      totalUsers: users.length,
      users: usersWithGems,
      summary: {
        totalGemsInWallets: usersWithGems.reduce((sum, user) => 
          sum + (user.wallet ? user.wallet.gemsBalance : 0), 0
        ),
        totalGemsEarned: usersWithGems.reduce((sum, user) => 
          sum + user.practiceStats.totalGemsEarned, 0
        ),
        usersWithWallets: usersWithGems.filter(user => user.wallet).length,
        usersWithPractice: usersWithGems.filter(user => user.practiceStats.totalAttempts > 0).length
      }
    });

  } catch (error) {
    console.error("Debug users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch debug data", details: error },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, action } = await req.json();

    if (action === "create-wallets") {
      // Create wallets for users who don't have them
      const usersWithoutWallets = await prisma.user.findMany({
        where: {
          wallet: null
        },
        select: {
          id: true,
          email: true,
          name: true
        }
      });

      const createdWallets = [];
      for (const user of usersWithoutWallets) {
        const wallet = await prisma.wallet.create({
          data: {
            userId: user.id,
            gemsBalance: 0
          }
        });
        createdWallets.push({
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          walletId: wallet.id,
          gemsBalance: Number(wallet.gemsBalance)
        });
      }

      return NextResponse.json({
        message: `Created ${createdWallets.length} wallets for users`,
        createdWallets
      });
    }

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email: email || "admin@precisionaw.com",
        password: password || "admin123",
        name: name || "Admin User",
        role: "admin",
        emailVerified: true,
        wallet: {
          create: {
            gemsBalance: 0
          }
        }
      },
      include: {
        wallet: true
      }
    });

    return NextResponse.json({
      message: "Admin user created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        wallet: user.wallet ? {
          id: user.wallet.id,
          gemsBalance: Number(user.wallet.gemsBalance)
        } : null
      }
    });

  } catch (error) {
    console.error("Create admin user error:", error);
    return NextResponse.json(
      { error: "Failed to create admin user", details: error },
      { status: 500 }
    );
  }
} 