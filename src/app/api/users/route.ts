import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (id) {
      // Get specific user
      const user = await db.user.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              memes: true,
              comments: true,
              medals: true
            }
          }
        }
      })

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: user
      })
    } else {
      // Get leaderboard
      const users = await db.user.findMany({
        include: {
          _count: {
            select: {
              memes: true,
              medals: true
            }
          }
        },
        orderBy: { coins: 'desc' },
        take: 50
      })

      return NextResponse.json({
        success: true,
        data: users
      })
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, image, googleId } = body

    // Check if user exists
    let user
    if (googleId) {
      user = await db.user.findUnique({
        where: { googleId }
      })
    } else if (email) {
      user = await db.user.findUnique({
        where: { email }
      })
    }

    if (!user) {
      // Create new user
      user = await db.user.create({
        data: {
          email: email || '',
          name,
          image,
          googleId
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
