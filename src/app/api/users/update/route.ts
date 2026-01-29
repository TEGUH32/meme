import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, bio, location, website } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    const user = await db.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        // Bio, location, website would need new fields in schema
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        coins: true,
        level: true
      }
    })

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
