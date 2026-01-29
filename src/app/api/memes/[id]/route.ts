import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meme = await db.meme.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            coins: true,
            level: true
          }
        },
        comments: {
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
        },
        votes: {
          include: {
            user: {
              select: {
                id: true
              }
            }
          }
        }
      }
    })

    if (!meme) {
      return NextResponse.json(
        { success: false, error: 'Meme not found' },
        { status: 404 }
      )
    }

    const upvotes = meme.votes.filter(v => v.type === 'up').length
    const downvotes = meme.votes.filter(v => v.type === 'down').length

    return NextResponse.json({
      success: true,
      data: {
        ...meme,
        votes: upvotes - downvotes
      }
    })
  } catch (error) {
    console.error('Error fetching meme:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meme' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.meme.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Meme deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting meme:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete meme' },
      { status: 500 }
    )
  }
}
