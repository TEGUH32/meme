import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verifikasi password jika perlu
    const { password } = await request.json()
    
    // Cari user untuk verifikasi password
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verifikasi password jika user menggunakan password auth
    if (user.password && password) {
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Password incorrect' }, { status: 400 })
      }
    } else if (user.password && !password) {
      // Jika user punya password tapi tidak dikirim
      return NextResponse.json(
        { error: 'Password required for account deletion' }, 
        { status: 400 }
      )
    }

    // Hapus semua data user secara bertahap
    // Mulai dengan menghapus data dependensi
    await db.$transaction(async (tx) => {
      // 1. Hapus notifications
      await tx.notification.deleteMany({
        where: { userId: session.user.id }
      })

      // 2. Hapus votes
      await tx.vote.deleteMany({
        where: { userId: session.user.id }
      })

      // 3. Hapus comments
      await tx.comment.deleteMany({
        where: { userId: session.user.id }
      })

      // 4. Hapus bookmarks
      await tx.bookmark.deleteMany({
        where: { userId: session.user.id }
      })

      // 5. Hapus user badges
      await tx.userBadge.deleteMany({
        where: { userId: session.user.id }
      })

      // 6. Hapus transactions
      await tx.transaction.deleteMany({
        where: { userId: session.user.id }
      })

      // 7. Hapus reports
      await tx.report.deleteMany({
        where: { reporterId: session.user.id }
      })

      // 8. Hapus topic follows
      await tx.topicFollow.deleteMany({
        where: { userId: session.user.id }
      })

      // 9. Hapus follows (follower dan following)
      await tx.follow.deleteMany({
        where: {
          OR: [
            { followerId: session.user.id },
            { followingId: session.user.id }
          ]
        }
      })

      // 10. Hapus referrals
      await tx.referral.deleteMany({
        where: {
          OR: [
            { referrerId: session.user.id },
            { referredId: session.user.id }
          ]
        }
      })

      // 11. Hapus sessions dan accounts (NextAuth)
      await tx.session.deleteMany({
        where: { userId: session.user.id }
      })
      
      await tx.account.deleteMany({
        where: { userId: session.user.id }
      })

      // 12. Hapus memes dan konten terkait
      const userMemes = await tx.meme.findMany({
        where: { authorId: session.user.id },
        select: { id: true }
      })
      
      const memeIds = userMemes.map(meme => meme.id)
      
      if (memeIds.length > 0) {
        // Hapus votes pada meme user
        await tx.vote.deleteMany({
          where: { memeId: { in: memeIds } }
        })

        // Hapus comments pada meme user
        await tx.comment.deleteMany({
          where: { memeId: { in: memeIds } }
        })

        // Hapus bookmarks pada meme user
        await tx.bookmark.deleteMany({
          where: { memeId: { in: memeIds } }
        })

        // Hapus meme topics
        await tx.memeTopic.deleteMany({
          where: { memeId: { in: memeIds } }
        })

        // Hapus memes user
        await tx.meme.deleteMany({
          where: { id: { in: memeIds } }
        })
      }

      // 13. Akhirnya hapus user
      await tx.user.delete({
        where: { id: session.user.id }
      })
    })

    return NextResponse.json({ 
      message: 'Account successfully deleted',
      success: true 
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete account',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
