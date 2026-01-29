import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Create user (in production, hash password properly)
    const user = await db.user.create({
      data: {
        email,
        name,
        coins: 100, // Welcome bonus
        level: 1
      }
    })

    // Award welcome medal
    const welcomeMedal = await db.medal.findFirst({
      where: { name: 'Memer Pertama' }
    })

    if (welcomeMedal) {
      await db.userMedal.create({
        data: {
          userId: user.id,
          medalId: welcomeMedal.id
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal membuat akun' },
      { status: 500 }
    )
  }
}
