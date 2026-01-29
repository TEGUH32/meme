import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// Premium plans configuration
const PREMIUM_PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Premium',
    durationMonths: 1,
    price: 1000,
    features: [
      'Upload 100 memes per day (vs 10)',
      'Exclusive premium badges',
      'Priority support',
      'No ads',
      'Access to premium-only content',
      'Custom profile theme',
      'Early access to new features'
    ]
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly Premium',
    durationMonths: 12,
    price: 10000,
    features: [
      'All monthly benefits',
      'Save 20% compared to monthly',
      'Upload 200 memes per day',
      'Exclusive premium badges (limited edition)',
      'VIP support priority',
      'Featured in leaderboard',
      'Special premium crown on profile',
      'Monthly bonus coins (500 coins)'
    ]
  },
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime Premium',
    durationMonths: 999, // Effectively lifetime
    price: 50000,
    features: [
      'All yearly benefits',
      'One-time payment, lifetime access',
      'Upload unlimited memes',
      'All exclusive badges forever',
      '24/7 dedicated support',
      'Always featured at top of leaderboard',
      'Golden lifetime badge',
      '5000 coins bonus immediately'
    ]
  }
};

// Get premium plans
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    let userPremiumStatus = null;
    if (session?.user?.email) {
      const user = await db.user.findUnique({
        where: { email: session.user.email }
      });

      if (user) {
        userPremiumStatus = {
          isPremium: user.isPremium,
          premiumExpiry: user.premiumExpiry,
          remainingDays: user.premiumExpiry
            ? Math.max(0, Math.ceil((new Date(user.premiumExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            : 0
        };
      }
    }

    return NextResponse.json({
      plans: PREMIUM_PLANS,
      userPremiumStatus
    });
  } catch (error) {
    console.error('Get premium plans error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Purchase premium
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

    const { planId } = await request.json();

    if (!planId || !PREMIUM_PLANS[planId as keyof typeof PREMIUM_PLANS]) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    const plan = PREMIUM_PLANS[planId as keyof typeof PREMIUM_PLANS];

    // Check if user has enough coins
    if (user.coins < plan.price) {
      return NextResponse.json({
        error: 'Insufficient coins',
        required: plan.price,
        current: user.coins
      }, { status: 400 });
    }

    // Calculate expiry date
    let expiryDate: Date;
    if (user.isPremium && user.premiumExpiry && new Date(user.premiumExpiry) > new Date()) {
      // Extend existing premium
      expiryDate = new Date(user.premiumExpiry);
      expiryDate.setMonth(expiryDate.getMonth() + plan.durationMonths);
    } else {
      // New premium or expired premium
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + plan.durationMonths);
    }

    // Deduct coins and activate premium
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        coins: { decrement: plan.price },
        isPremium: true,
        premiumExpiry: expiryDate
      }
    });

    // Create transaction
    await db.transaction.create({
      data: {
        userId: user.id,
        type: 'premium',
        amount: -plan.price,
        description: `Purchased ${plan.name}`,
        metadata: JSON.stringify({ planId, planName: plan.name, price: plan.price })
      }
    });

    // Award bonus coins for lifetime plan
    if (planId === 'lifetime') {
      await db.user.update({
        where: { id: user.id },
        data: { coins: { increment: 5000 } }
      });

      await db.transaction.create({
        data: {
          userId: user.id,
          type: 'reward',
          amount: 5000,
          description: 'Lifetime Premium bonus coins',
          metadata: JSON.stringify({ bonus: true, planId: 'lifetime' })
        }
      });
    }

    // Create notification
    await db.notification.create({
      data: {
        type: 'premium',
        title: 'Premium Activated! 🎉',
        message: `You have successfully upgraded to ${plan.name}! Enjoy all premium features.`,
        userId: user.id,
        actionUrl: '/dashboard',
        metadata: JSON.stringify({ planId, planName: plan.name, expiryDate })
      }
    });

    return NextResponse.json({
      message: 'Premium activated successfully',
      plan: plan.name,
      expiryDate,
      newCoins: updatedUser.coins
    });
  } catch (error) {
    console.error('Purchase premium error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Cancel premium (disable auto-renewal simulation)
export async function DELETE(request: NextRequest) {
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

    if (!user.isPremium) {
      return NextResponse.json({ error: 'You are not a premium member' }, { status: 400 });
    }

    // Note: In a real system, this would cancel auto-renewal
    // For now, we'll just set expiry to current date to expire immediately
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { premiumExpiry: new Date() }
    });

    await db.notification.create({
      data: {
        type: 'system',
        title: 'Premium Expired',
        message: 'Your premium membership has been cancelled. You can upgrade again anytime.',
        userId: user.id,
        actionUrl: '/premium'
      }
    });

    return NextResponse.json({
      message: 'Premium cancelled successfully',
      isPremium: false
    });
  } catch (error) {
    console.error('Cancel premium error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
