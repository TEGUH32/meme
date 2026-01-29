import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

// Generate referral code
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate unique referral code if not exists
    if (!user.referralCode) {
      const referralCode = `MEME${user.id.substring(0, 6).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;

      await db.user.update({
        where: { id: user.id },
        data: { referralCode }
      });

      return NextResponse.json({ referralCode, referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?ref=${referralCode}` });
    }

    return NextResponse.json({
      referralCode: user.referralCode,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?ref=${user.referralCode}`
    });
  } catch (error) {
    console.error('Generate referral code error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Apply referral code
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already used a referral
    if (user.referredBy) {
      return NextResponse.json({ error: 'You have already used a referral code' }, { status: 400 });
    }

    const { referralCode } = await request.json();

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    // Find referrer by code
    const referrer = await db.user.findUnique({
      where: { referralCode }
    });

    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    if (referrer.id === user.id) {
      return NextResponse.json({ error: 'Cannot use your own referral code' }, { status: 400 });
    }

    // Update user with referral
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        referredBy: referrer.id,
        coins: { increment: 100 } // Bonus for new user
      }
    });

    // Award referrer
    await db.user.update({
      where: { id: referrer.id },
      data: { coins: { increment: 50 } }
    });

    // Create referral record
    await db.referral.create({
      data: {
        referrerId: referrer.id,
        referredId: user.id,
        coinReward: 50
      }
    });

    // Create transaction for referred user
    await db.transaction.create({
      data: {
        userId: user.id,
        type: 'referral',
        amount: 100,
        description: 'Referral bonus (new user)',
        metadata: JSON.stringify({ referrerId: referrer.id, referralCode })
      }
    });

    // Create transaction for referrer
    await db.transaction.create({
      data: {
        userId: referrer.id,
        type: 'referral',
        amount: 50,
        description: 'Referral reward (referred user)',
        metadata: JSON.stringify({ referredId: user.id, referralCode })
      }
    });

    // Create notification for referrer
    await db.notification.create({
      data: {
        type: 'coin',
        title: 'Referral Bonus!',
        message: `You earned 50 coins for referring ${user.name || 'a new user'}!`,
        userId: referrer.id,
        actionUrl: `/profile/${user.id}`,
        metadata: JSON.stringify({ amount: 50, referredId: user.id })
      }
    });

    return NextResponse.json({
      message: 'Referral code applied successfully!',
      coinsEarned: 100,
      totalCoins: updatedUser.coins
    });
  } catch (error) {
    console.error('Apply referral code error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get referral stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const referrals = await db.referral.findMany({
      where: { referrerId: user.id },
      include: {
        referredUser: {
          select: {
            name: true,
            image: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalReferrals = referrals.length;
    const totalCoinsEarned = referrals.reduce((sum, ref) => sum + ref.coinReward, 0);

    return NextResponse.json({
      referralCode: user.referralCode,
      referralLink: user.referralCode
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?ref=${user.referralCode}`
        : null,
      totalReferrals,
      totalCoinsEarned,
      referrals
    });
  } catch (error) {
    console.error('Get referral stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
