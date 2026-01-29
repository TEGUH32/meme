import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // SUDAH DIPERBAIKI
import { db } from '@/lib/db';

// Get transaction history
export async function GET(request: NextRequest) {
  try {
    // Mengambil session berdasarkan authOptions dari lib
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
    const type = searchParams.get('type'); 

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

    // Calculate totals menggunakan aggregate/groupBy
    const totals = await db.transaction.groupBy({
      by: ['type'],
      where: { userId: user.id },
      _sum: {
        amount: true
      }
    });

    const totalEarned = totals
      .filter(t => ['earned', 'referral', 'reward'].includes(t.type))
      .reduce((sum, t) => sum + (t._sum.amount || 0), 0);

    const totalSpent = totals
      .filter(t => ['spent', 'premium'].includes(t.type))
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
