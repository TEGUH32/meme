import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const memeId = searchParams.get('memeId')

    const where: any = {}
    if (memeId) {
      where.memeId = memeId
    }

    const comments = await db.comment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: comments
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, memeId, userId } = body

    if (!content || !memeId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const comment = await db.comment.create({
      data: {
        content,
        memeId,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    // Award coins for commenting
    await db.user.update({
      where: { id: userId },
      data: { coins: { increment: 5 } }
    })

    // Notify the meme author
    const meme = await db.meme.findUnique({
      where: { id: memeId },
      select: { authorId: true }
    })

    if (meme && meme.authorId !== userId) {
      await db.notification.create({
        data: {
          type: 'comment',
          title: 'Komentar Baru',
          message: `Seseorang berkomentar pada meme kamu`,
          userId: meme.authorId,
          metadata: JSON.stringify({ memeId, commentId: comment.id })
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: comment
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
