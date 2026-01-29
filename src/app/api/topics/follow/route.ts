import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

// Follow/Unfollow topic
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

    const { topicId } = await request.json();

    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
    }

    // Check if topic exists
    const topic = await db.topic.findUnique({
      where: { id: topicId }
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await db.topicFollow.findUnique({
      where: {
        userId_topicId: {
          userId: user.id,
          topicId
        }
      }
    });

    if (existingFollow) {
      // Unfollow
      await db.topicFollow.delete({
        where: {
          userId_topicId: {
            userId: user.id,
            topicId
          }
        }
      });

      await db.topic.update({
        where: { id: topicId },
        data: { memeCount: { decrement: 0 } } // Just to trigger update
      });

      return NextResponse.json({ message: 'Unfollowed topic successfully', following: false });
    } else {
      // Follow
      await db.topicFollow.create({
        data: {
          userId: user.id,
          topicId
        }
      });

      // Award coins for following topic
      await db.user.update({
        where: { id: user.id },
        data: { coins: { increment: 3 } }
      });

      // Create transaction
      await db.transaction.create({
        data: {
          userId: user.id,
          type: 'earned',
          amount: 3,
          description: 'Followed a topic',
          metadata: JSON.stringify({ topicId, topicName: topic.name })
        }
      });

      return NextResponse.json({ message: 'Followed topic successfully', following: true });
    }
  } catch (error) {
    console.error('Topic follow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
