import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

// Get transaction history
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // Filter by type: earned, spent, referral, premium, reward

    const whereClause: any = { userId: user.id };
    if (type) {
      whereClause.type = type;
    }

    const transactions = await db.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    // Calculate totals
    const totals = await db.transaction.groupBy({
      by: ['type'],
      where: { userId: user.id },
      _sum: {
        amount: true
      }
    });

    const totalEarned = totals
      .filter(t => t.type === 'earned' || t.type === 'referral' || t.type === 'reward')
      .reduce((sum, t) => sum + (t._sum.amount || 0), 0);

    const totalSpent = totals
      .filter(t => t.type === 'spent' || t.type === 'premium')
      .reduce((sum, t) => sum + (t._sum.amount || 0), 0);

    return NextResponse.json({
      transactions,
      totals: {
        totalEarned,
        totalSpent,
        balance: user.coins
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
