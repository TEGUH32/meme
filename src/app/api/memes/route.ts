import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const type = searchParams.get('type') // 'foryou', 'fresh', 'viral'

    const where: any = {}

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.title = {
        contains: search
      }
    }

    let orderBy: any = { createdAt: 'desc' }

    if (type === 'viral') {
      orderBy = { viralScore: 'desc' }
    } else if (type === 'fresh') {
      orderBy = { createdAt: 'desc' }
    }

    const memes = await db.meme.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      },
      orderBy
    })

    // Calculate vote counts from viralScore
    const memesWithCounts = memes.map(meme => ({
      ...meme,
      votes: meme.viralScore || 0
    }))

    return NextResponse.json({
      success: true,
      data: memesWithCounts
    })
  } catch (error) {
    console.error('Error fetching memes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch memes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, imageUrl, caption, category, authorId, isAnonymous } = body

    if (!title || !imageUrl || !category || !authorId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const meme = await db.meme.create({
      data: {
        title,
        imageUrl,
        caption,
        category,
        authorId,
        isAnonymous: isAnonymous || false
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    // Award coins for creating meme
    await db.user.update({
      where: { id: authorId },
      data: { coins: { increment: 10 } }
    })

    return NextResponse.json({
      success: true,
      data: meme
    })
  } catch (error) {
    console.error('Error creating meme:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create meme' },
      { status: 500 }
    )
  }
}
