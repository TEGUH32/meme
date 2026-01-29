import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (userId) {
      // Get user's medals
      const userMedals = await db.userMedal.findMany({
        where: { userId },
        include: {
          medal: true
        },
        orderBy: { earnedAt: 'desc' }
      })

      return NextResponse.json({
        success: true,
        data: userMedals
      })
    } else {
      // Get all available medals
      const medals = await db.medal.findMany({
        orderBy: { createdAt: 'asc' }
      })

      return NextResponse.json({
        success: true,
        data: medals
      })
    }
  } catch (error) {
    console.error('Error fetching medals:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch medals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, medalId } = body

    if (!userId || !medalId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already has this medal
    const existing = await db.userMedal.findUnique({
      where: {
        userId_medalId: {
          userId,
          medalId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'User already has this medal' },
        { status: 400 }
      )
    }

    // Award medal to user
    const userMedal = await db.userMedal.create({
      data: {
        userId,
        medalId
      },
      include: {
        medal: true
      }
    })

    // Award coins from medal
    if (userMedal.medal.coinReward > 0) {
      await db.user.update({
        where: { id: userId },
        data: { coins: { increment: userMedal.medal.coinReward } }
      })
    }

    // Notify user
    await db.notification.create({
      data: {
        type: 'medal',
        title: 'Medali Baru!',
        message: `Kamu mendapatkan medali: ${userMedal.medal.name}`,
        userId
      }
    })

    return NextResponse.json({
      success: true,
      data: userMedal
    })
  } catch (error) {
    console.error('Error awarding medal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to award medal' },
      { status: 500 }
    )
  }
}
