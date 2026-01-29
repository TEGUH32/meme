import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

// Get all topics
export async function GET() {
  try {
    const topics = await db.topic.findMany({
      orderBy: { memeCount: 'desc' },
      include: {
        _count: {
          select: { followers: true }
        }
      }
    });

    return NextResponse.json(topics);
  } catch (error) {
    console.error('Get topics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create new topic (admin only in production)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, icon } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Topic name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const topic = await db.topic.create({
      data: {
        name,
        slug,
        description,
        icon
      }
    });

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Create topic error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
