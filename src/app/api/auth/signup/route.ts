import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validasi input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Nama, email, dan password harus diisi' },
        { status: 400 }
      )
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Format email tidak valid' },
        { status: 400 }
      )
    }

    // Validasi password
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Generate username dari email (fallback)
    const generateUsername = (email: string) => {
      const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
      return baseUsername || `user_${Date.now().toString().slice(-6)}`
    }

    const username = generateUsername(email)
    
    // Hash password dengan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user dengan password yang sudah di-hash
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        name: name.trim(),
        username,
        password: hashedPassword,
        coins: 100, // Welcome bonus
        level: 1,
        // Add default profile image
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        role: 'USER'
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        image: true,
        coins: true,
        level: true,
        role: true,
        createdAt: true
        // Jangan select password!
      }
    })

    // Try to award welcome medal (handle if medal doesn't exist)
    try {
      const welcomeMedal = await db.medal.findFirst({
        where: { 
          name: { 
            contains: 'Pertama',
            mode: 'insensitive'
          }
        }
      })

      if (welcomeMedal) {
        await db.userMedal.create({
          data: {
            userId: user.id,
            medalId: welcomeMedal.id
          }
        })
      } else {
        // Create default welcome medal if not exists
        const newMedal = await db.medal.create({
          data: {
            name: 'Memer Pertama',
            description: 'Selamat datang di MemeVerse!',
            icon: '🎉',
            rarity: 'COMMON'
          }
        })
        
        await db.userMedal.create({
          data: {
            userId: user.id,
            medalId: newMedal.id
          }
        })
      }
    } catch (medalError) {
      console.warn('Could not award welcome medal:', medalError)
      // Continue without medal - don't fail user creation
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
        message: 'Akun berhasil dibuat! Selamat bergabung di MemeVerse 🎉'
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating user:', error)
    
    // Handle specific Prisma errors
    let errorMessage = 'Gagal membuat akun'
    let statusCode = 500
    
    if (error.code === 'P2002') {
      // Unique constraint violation
      const field = error.meta?.target?.[0]
      if (field === 'email') {
        errorMessage = 'Email sudah terdaftar'
        statusCode = 400
      } else if (field === 'username') {
        errorMessage = 'Username sudah digunakan'
        statusCode = 400
      }
    } else if (error.code === 'P2025') {
      // Record not found
      errorMessage = 'Data tidak ditemukan'
      statusCode = 404
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    )
  }
}
