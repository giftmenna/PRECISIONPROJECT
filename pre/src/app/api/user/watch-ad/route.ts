import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { AD_SETTINGS } from '@/lib/ad-config';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user and their wallet
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { wallet: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has watched an ad recently (within 1 hour)
    const lastAdWatch = await prisma.adWatch.findFirst({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (lastAdWatch) {
      const timeRemaining = 60 * 60 * 1000 - (Date.now() - lastAdWatch.createdAt.getTime());
      const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000));
      
      return NextResponse.json(
        { 
          error: 'Please wait before watching another ad',
          timeRemaining: hoursRemaining
        },
        { status: 429 }
      );
    }

    // Award gems (0.003 gems per ad)
    const gemsEarned = AD_SETTINGS.gemsReward;
    const currentBalance = parseFloat(user.wallet?.gemsBalance?.toString() || '0');
    const newBalance = currentBalance + gemsEarned;

    // Update wallet balance
    await prisma.wallet.upsert({
      where: { userId: user.id },
      update: { gemsBalance: newBalance },
      create: { userId: user.id, gemsBalance: gemsEarned }
    });

    // Record the ad watch
    await prisma.adWatch.create({
      data: {
        userId: user.id,
        gemsEarned: gemsEarned,
        adType: 'VIDEO_AD'
      }
    });

    return NextResponse.json({
      success: true,
      gemsEarned: gemsEarned,
      newBalance: newBalance,
      message: 'Gems awarded successfully!'
    });

  } catch (error) {
    console.error('Error processing ad watch:', error);
    return NextResponse.json(
      { error: 'Failed to process ad watch' },
      { status: 500 }
    );
  }
} 