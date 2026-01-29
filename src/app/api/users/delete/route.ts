// app/api/user/delete/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function DELETE(request: NextRequest) {
  try {
    console.log('Delete account request received')
    
    const session = await getServerSession(authOptions)
    console.log('Session:', session?.user)
    
    if (!session?.user) {
      console.log('No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    let body
    try {
      body = await request.json()
      console.log('Request body:', body)
    } catch (error) {
      console.log('No body or invalid JSON')
      body = {}
    }
    
    const { password } = body
    
    // Cari user untuk verifikasi
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      console.log('User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('User found:', { id: user.id, email: user.email, hasPassword: !!user.password })

    // Verifikasi password jika user punya password
    if (user.password) {
      console.log('User has password, verifying...')
      if (!password) {
        console.log('Password required but not provided')
        return NextResponse.json(
          { error: 'Password required for account deletion' }, 
          { status: 400 }
        )
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password)
      console.log('Password valid:', isValidPassword)
      
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Password incorrect' }, { status: 400 })
      }
    } else {
      console.log('User has no password (social login)')
    }

    console.log('Starting account deletion process...')
    
    // Mulai transaction untuk menghapus semua data
    await db.$transaction(async (tx) => {
      console.log('Transaction started')
      
      // Delete notifications
      await tx.notification.deleteMany({
        where: { userId: session.user.id }
      })
      console.log('Notifications deleted')
      
      // Delete votes
      await tx.vote.deleteMany({
        where: { userId: session.user.id }
      })
      console.log('Votes deleted')
      
      // Delete comments
      await tx.comment.deleteMany({
        where: { userId: session.user.id }
      })
      console.log('Comments deleted')
      
      // Delete bookmarks
      await tx.bookmark.deleteMany({
        where: { userId: session.user.id }
      })
      console.log('Bookmarks deleted')
      
      // Delete user badges
      await tx.userBadge.deleteMany({
        where: { userId: session.user.id }
      })
      console.log('User badges deleted')
      
      // Delete transactions
      await tx.transaction.deleteMany({
        where: { userId: session.user.id }
      })
      console.log('Transactions deleted')
      
      // Delete reports
      await tx.report.deleteMany({
        where: { reporterId: session.user.id }
      })
      console.log('Reports deleted')
      
      // Delete topic follows
      await tx.topicFollow.deleteMany({
        where: { userId: session.user.id }
      })
      console.log('Topic follows deleted')
      
      // Delete follows
      await tx.follow.deleteMany({
        where: {
          OR: [
            { followerId: session.user.id },
            { followingId: session.user.id }
          ]
        }
      })
      console.log('Follows deleted')
      
      // Delete referrals
      await tx.referral.deleteMany({
        where: {
          OR: [
            { referrerId: session.user.id },
            { referredId: session.user.id }
          ]
        }
      })
      console.log('Referrals deleted')
      
      // Delete sessions dan accounts (NextAuth)
      await tx.session.deleteMany({
        where: { userId: session.user.id }
      })
      console.log('Sessions deleted')
      
      await tx.account.deleteMany({
        where: { userId: session.user.id }
      })
      console.log('Accounts deleted')
      
      // Hapus memes dan konten terkait
      const userMemes = await tx.meme.findMany({
        where: { authorId: session.user.id },
        select: { id: true }
      })
      
      console.log('User memes found:', userMemes.length)
      
      if (userMemes.length > 0) {
        const memeIds = userMemes.map(meme => meme.id)
        
        // Hapus votes pada meme user
        await tx.vote.deleteMany({
          where: { memeId: { in: memeIds } }
        })
        console.log('Meme votes deleted')
        
        // Hapus comments pada meme user
        await tx.comment.deleteMany({
          where: { memeId: { in: memeIds } }
        })
        console.log('Meme comments deleted')
        
        // Hapus bookmarks pada meme user
        await tx.bookmark.deleteMany({
          where: { memeId: { in: memeIds } }
        })
        console.log('Meme bookmarks deleted')
        
        // Hapus meme topics
        await tx.memeTopic.deleteMany({
          where: { memeId: { in: memeIds } }
        })
        console.log('Meme topics deleted')
        
        // Hapus memes user
        await tx.meme.deleteMany({
          where: { id: { in: memeIds } }
        })
        console.log('User memes deleted')
      }
      
      // Akhirnya hapus user
      await tx.user.delete({
        where: { id: session.user.id }
      })
      console.log('User deleted')
    })

    console.log('Account deletion completed successfully')
    
    return NextResponse.json({ 
      message: 'Account successfully deleted',
      success: true 
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete account',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
