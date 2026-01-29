import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    const bookmarks = await db.bookmark.findMany({
      where: { userId },
      include: {
        meme: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: bookmarks
    })
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookmarks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memeId, userId } = body

    if (!memeId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if already bookmarked
    const existing = await db.bookmark.findUnique({
      where: {
        memeId_userId: {
          memeId,
          userId
        }
      }
    })

    if (existing) {
      // Remove bookmark
      await db.bookmark.delete({
        where: { id: existing.id }
      })
      return NextResponse.json({
        success: true,
        bookmarked: false,
        message: 'Bookmark removed'
      })
    }

    // Create bookmark
    const bookmark = await db.bookmark.create({
      data: {
        memeId,
        userId
      }
    })

    return NextResponse.json({
      success: true,
      bookmarked: true,
      data: bookmark
    })
  } catch (error) {
    console.error('Error toggling bookmark:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to toggle bookmark' },
      { status: 500 }
    )
  }
}
