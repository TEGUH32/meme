import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

// Follow/Unfollow user
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

    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if already following
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: targetUserId
        }
      }
    });

    if (existingFollow) {
      // Unfollow
      await db.follow.delete({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: targetUserId
          }
        }
      });

      return NextResponse.json({ message: 'Unfollowed successfully', following: false });
    } else {
      // Follow
      const follow = await db.follow.create({
        data: {
          followerId: user.id,
          followingId: targetUserId
        }
      });

      // Create notification for the followed user
      await db.notification.create({
        data: {
          type: 'follow',
          title: 'New Follower',
          message: `${user.name || 'Someone'} started following you`,
          userId: targetUserId,
          actionUrl: `/profile/${user.id}`,
          metadata: JSON.stringify({ followerId: user.id, followerName: user.name })
        }
      });

      // Award coins for following (social interaction)
      await db.user.update({
        where: { id: user.id },
        data: { coins: { increment: 5 } }
      });

      // Create transaction
      await db.transaction.create({
        data: {
          userId: user.id,
          type: 'earned',
          amount: 5,
          description: 'Followed a user',
          metadata: JSON.stringify({ targetUserId })
        }
      });

      return NextResponse.json({ message: 'Followed successfully', following: true });
    }
  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get following/followers count
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const followers = await db.follow.count({
      where: { followingId: userId }
    });

    const following = await db.follow.count({
      where: { followerId: userId }
    });

    const isFollowing = searchParams.get('currentUserId')
      ? !!(await db.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: searchParams.get('currentUserId')!,
              followingId: userId
            }
          }
        }))
      : false;

    return NextResponse.json({ followers, following, isFollowing });
  } catch (error) {
    console.error('Get follow stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
