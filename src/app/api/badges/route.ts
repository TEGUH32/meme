import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const badges = await db.badge.findMany({
      orderBy: { level: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: badges
    })
  } catch (error) {
    console.error('Error fetching badges:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch badges' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, badgeId } = body

    if (!userId || !badgeId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if badge exists
    const badge = await db.badge.findUnique({
      where: { id: badgeId }
    })

    if (!badge) {
      return NextResponse.json(
        { success: false, error: 'Badge not found' },
        { status: 404 }
      )
    }

    // Check if user already has this badge
    const existing = await db.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId
        }
      }
    })

    if (existing) {
      // Update progress
      const updated = await db.userBadge.update({
        where: { id: existing.id },
        data: {
          progress: { increment: 1 }
        }
      })
      
      // Check if target reached
      if (updated.progress >= updated.target) {
        // Award coins
        await db.user.update({
          where: { id: userId },
          data: { coins: { increment: badge.coinReward } }
        })

        // Update target to next level
        await db.userBadge.update({
          where: { id: existing.id },
          data: {
            target: { increment: 1 },
            progress: 0
          }
        })

        // Create notification
        await db.notification.create({
          data: {
            type: 'badge',
            title: `🏆 Badge Baru: ${badge.name}`,
            message: `Kamu mendapatkan badge level ${existing.target + 1}!`,
            userId
          }
        })
      }

      return NextResponse.json({
        success: true,
        data: updated
      })
    }

    // Create new user-badge
    const userBadge = await db.userBadge.create({
      data: {
        userId,
        badgeId,
        progress: 1
      }
    })

    // Award coins on first achievement
    await db.user.update({
      where: { id: userId },
      data: { coins: { increment: Math.floor(badge.coinReward / 2) } }
    })

    return NextResponse.json({
      success: true,
      data: userBadge
    })
  } catch (error) {
    console.error('Error awarding badge:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to award badge' },
      { status: 500 }
    )
  }
}
