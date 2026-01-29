import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, memeId, userId } = body

    if (!type || !memeId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already voted
    const existingVote = await db.vote.findUnique({
      where: {
        memeId_userId: {
          memeId,
          userId
        }
      }
    })

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote if same type
        await db.vote.delete({
          where: { id: existingVote.id }
        })
      } else {
        // Update vote type if different
        await db.vote.update({
          where: { id: existingVote.id },
          data: { type }
        })
      }
    } else {
      // Create new vote
      await db.vote.create({
        data: {
          type,
          memeId,
          userId
        }
      })

      // Award coins for voting
      await db.user.update({
        where: { id: userId },
        data: { coins: { increment: 1 } }
      })

      // Notify the meme author
      if (type === 'up') {
        const meme = await db.meme.findUnique({
          where: { id: memeId },
          select: { authorId: true }
        })

        if (meme && meme.authorId !== userId) {
          await db.notification.create({
            data: {
              type: 'like',
              title: 'Like Baru',
              message: `Seseorang menyukai meme kamu`,
              userId: meme.authorId,
              metadata: JSON.stringify({ memeId })
            }
          })
        }
      }
    }

    // Get updated vote count
    const meme = await db.meme.findUnique({
      where: { id: memeId },
      include: {
        votes: true
      }
    })

    if (meme) {
      const upvotes = meme.votes.filter(v => v.type === 'up').length
      const downvotes = meme.votes.filter(v => v.type === 'down').length
      const voteScore = upvotes - downvotes

      // Update viral score
      await db.meme.update({
        where: { id: memeId },
        data: { viralScore: voteScore }
      })

      return NextResponse.json({
        success: true,
        data: {
          upvotes,
          downvotes,
          score: voteScore
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling vote:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to handle vote' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const memeId = searchParams.get('memeId')
    const userId = searchParams.get('userId')

    if (!memeId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing parameters' },
        { status: 400 }
      )
    }

    const vote = await db.vote.findUnique({
      where: {
        memeId_userId: {
          memeId,
          userId
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: vote
    })
  } catch (error) {
    console.error('Error fetching vote:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vote' },
      { status: 500 }
    )
  }
}
