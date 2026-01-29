import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create badges with levels and categories
  const badges = await Promise.all([
    prisma.badge.upsert({
      where: { name: 'Pendaftar' },
      update: {},
      create: {
        name: 'Pendaftar',
        description: 'Buat akun dan login',
        icon: '🌟',
        color: '#FFD700',
        coinReward: 0,
        level: 1,
        category: 'social'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Meme Pertama' },
      update: {},
      create: {
        name: 'Meme Pertama',
        description: 'Buat meme pertama',
        icon: '🎉',
        color: '#FF6B6B',
        coinReward: 10,
        level: 1,
        category: 'content'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Kreator Rajin' },
      update: {},
      create: {
        name: 'Kreator Rajin',
        description: 'Buat 5 meme',
        icon: '🎭',
        color: '#4ECDC4',
        coinReward: 25,
        level: 1,
        category: 'content'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Kreator Aktif' },
      update: {},
      create: {
        name: 'Kreator Aktif',
        description: 'Buat 10 meme',
        icon: '🎨',
        color: '#95D5B2',
        coinReward: 50,
        level: 2,
        category: 'content'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Master Kreator' },
      update: {},
      create: {
        name: 'Master Kreator',
        description: 'Buat 50 meme',
        icon: '👑',
        color: '#FF6384',
        coinReward: 150,
        level: 3,
        category: 'content'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Komen Pertama' },
      update: {},
      create: {
        name: 'Komen Pertama',
        description: 'Tulis komentar pertama',
        icon: '💬',
        color: '#A8DADC',
        coinReward: 5,
        level: 1,
        category: 'social'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Pembicara' },
      update: {},
      create: {
        name: 'Pembicara',
        description: 'Tulis 25 komentar',
        icon: '🗣️',
        color: '#45B7D1',
        coinReward: 25,
        level: 2,
        category: 'social'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Komunitas' },
      update: {},
      create: {
        name: 'Komunitas',
        description: 'Tulis 100 komentar',
        icon: '👥',
        color: '#96CEB4',
        coinReward: 100,
        level: 3,
        category: 'social'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Penggemar' },
      update: {},
      create: {
        name: 'Penggemar',
        description: 'Like 10 meme',
        icon: '❤️',
        color: '#FF6B9D',
        coinReward: 15,
        level: 1,
        category: 'social'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Populer' },
      update: {},
      create: {
        name: 'Populer',
        description: 'Dapatkan 100 like',
        icon: '🔥',
        color: '#E74C3C',
        coinReward: 50,
        level: 2,
        category: 'social'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Viral Star' },
      update: {},
      create: {
        name: 'Viral Star',
        description: 'Dapatkan 1000 like',
        icon: '⭐',
        color: '#FFD93D',
        coinReward: 200,
        level: 3,
        category: 'content'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Top 10' },
      update: {},
      create: {
        name: 'Top 10',
        description: 'Masuk top 10 leaderboard',
        icon: '🏆',
        color: '#FFC300',
        coinReward: 75,
        level: 2,
        category: 'special'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Top 3' },
      update: {},
      create: {
        name: 'Top 3',
        description: 'Masuk top 3 leaderboard',
        icon: '🥇',
        color: '#FFD700',
        coinReward: 150,
        level: 3,
        category: 'special'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Streak 7 Hari' },
      update: {},
      create: {
        name: 'Streak 7 Hari',
        description: 'Login 7 hari berturut-turut',
        icon: '🔥',
        color: '#FF9500',
        coinReward: 30,
        level: 2,
        category: 'special'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Level 5' },
      update: {},
      create: {
        name: 'Level 5',
        description: 'Capai level 5',
        icon: '⬆️',
        color: '#4ADE80',
        coinReward: 25,
        level: 1,
        category: 'special'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Level 15' },
      update: {},
      create: {
        name: 'Level 15',
        description: 'Capai level 15',
        icon: '🚀',
        color: '#70E000',
        coinReward: 100,
        level: 2,
        category: 'special'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Explorer' },
      update: {},
      create: {
        name: 'Explorer',
        description: 'Lihat 100 meme',
        icon: '👀',
        color: '#9B59B6',
        coinReward: 20,
        level: 1,
        category: 'content'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Kolektor' },
      update: {},
      create: {
        name: 'Kolektor',
        description: 'Bookmark 10 meme',
        icon: '📚',
        color: '#6C5CE7',
        coinReward: 15,
        level: 1,
        category: 'content'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Viral Legend' },
      update: {},
      create: {
        name: 'Viral Legend',
        description: 'Meme viral 10000+ views',
        icon: '👑',
        color: '#FF4757',
        coinReward: 300,
        level: 4,
        category: 'special'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Video Kreator' },
      update: {},
      create: {
        name: 'Video Kreator',
        description: 'Upload 5 video',
        icon: '🎬',
        color: '#E94560',
        coinReward: 100,
        level: 2,
        category: 'content'
      }
    }),
    prisma.badge.upsert({
      where: { name: 'Full Stack' },
      update: {},
      create: {
        name: 'Full Stack',
        description: 'Capai semua badge kreator',
        icon: '🌟',
        color: '#F39C12',
        coinReward: 500,
        level: 5,
        category: 'special'
      }
    })
  ])

  console.log('✅ Created/updated badges')

  // Create demo users with referral codes
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'anakmama@demo.com' },
      update: {},
      create: {
        email: 'anakmama@demo.com',
        name: 'AnakMama',
        coins: 15420,
        level: 15,
        totalMemes: 25,
        totalComments: 50,
        totalLikes: 1000,
        referralCode: 'MEMEAMK',
        isPremium: true,
        premiumExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    }),
    prisma.user.upsert({
      where: { email: 'wibu@demo.com' },
      update: {},
      create: {
        email: 'wibu@demo.com',
        name: 'WibuBerat',
        coins: 12350,
        level: 13,
        totalMemes: 20,
        totalComments: 40,
        totalLikes: 800,
        referralCode: 'MEMEWBR',
        isPremium: false
      }
    }),
    prisma.user.upsert({
      where: { email: 'karyawan@demo.com' },
      update: {},
      create: {
        email: 'karyawan@demo.com',
        name: 'KaryawanGorilla',
        coins: 11200,
        level: 12,
        totalMemes: 18,
        totalComments: 35,
        totalLikes: 750,
        referralCode: 'MEMEKG'
      }
    }),
    prisma.user.upsert({
      where: { email: 'demo@demo.com' },
      update: {},
      create: {
        email: 'demo@demo.com',
        name: 'Demo User',
        coins: 1250,
        level: 5,
        totalMemes: 5,
        totalComments: 10,
        totalLikes: 50,
        referralCode: 'MEMEDEMO'
      }
    })
  ])

  console.log('✅ Created/updated users')

  // Award some badges to users
  await Promise.all([
    prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: users[0].id, badgeId: badges[1].id } },
      update: {},
      create: { userId: users[0].id, badgeId: badges[1].id, target: 1, progress: 1 }
    }),
    prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: users[1].id, badgeId: badges[5].id } },
      update: {},
      create: { userId: users[1].id, badgeId: badges[5].id, target: 1, progress: 1 }
    }),
    prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: users[0].id, badgeId: badges[1].id } },
      update: {},
      create: { userId: users[0].id, badgeId: badges[1].id, target: 1, progress: 1 }
    })
  ])

  console.log('✅ Awarded badges to users')

  // Create sample memes
  const memes = await Promise.all([
    prisma.meme.create({
      data: {
        title: 'Saingan Duit Kos',
        imageUrl: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=500&h=500&fit=crop',
        caption: 'Begadang nugas besoknya ujian',
        category: 'Sekolah',
        authorId: users[0].id,
        viralScore: 452,
        views: 1200,
        isVideo: false
      }
    }),
    prisma.meme.create({
      data: {
        title: 'Senin yang Menyenangkan',
        imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&h=500&fit=crop',
        caption: 'Kerja 9-5 tapi gajinya pas-pasan',
        category: 'Pekerjaan',
        authorId: users[2].id,
        viralScore: 789,
        views: 2500,
        isVideo: false
      }
    }),
    prisma.meme.create({
      data: {
        title: 'Anime Realita',
        imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&h=500&fit=crop',
        caption: 'Kalo bisa choose route gue pilih route jadi sultan',
        category: 'Anime',
        authorId: users[1].id,
        viralScore: 342,
        views: 800,
        isVideo: false
      }
    }),
    prisma.meme.create({
      data: {
        title: 'Kalo Iya Kenapa',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&h=500&fit=crop',
        caption: 'Pertanyaan yang mengubah hidup',
        category: 'Funny',
        authorId: users[0].id,
        viralScore: 234,
        views: 600,
        isVideo: false
      }
    }),
    prisma.meme.create({
      data: {
        title: 'Nostalgia SD',
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&h=500&fit=crop',
        caption: 'Masang tas di kepala jadi pilot',
        category: 'Nostalgia',
        authorId: users[1].id,
        viralScore: 567,
        views: 1500,
        isVideo: false
      }
    })
  ])

  console.log('✅ Created sample memes')

  // Create sample votes
  for (const meme of memes) {
    const voteCount = Math.floor(Math.random() * 10) + 3
    for (let i = 0; i < voteCount; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      try {
        await prisma.vote.create({
          data: {
            type: 'up',
            memeId: meme.id,
            userId: randomUser.id
          }
        })
      } catch (e) {
        // Skip duplicate votes
      }
    }
  }

  console.log('✅ Created sample votes')

  // Create sample comments
  await Promise.all([
    prisma.comment.create({
      data: {
        content: 'Ini banget wkwkwk',
        memeId: memes[0].id,
        userId: users[1].id
      }
    }),
    prisma.comment.create({
      data: {
        content: 'Senin memang mimpi buruk',
        memeId: memes[1].id,
        userId: users[0].id
      }
    }),
    prisma.comment.create({
      data: {
        content: 'Wibu detected',
        memeId: memes[2].id,
        userId: users[2].id
      }
    }),
    prisma.comment.create({
      data: {
        content: 'Sama persis sama gue!',
        memeId: memes[0].id,
        userId: users[2].id
      }
    })
  ])

  console.log('✅ Created sample comments')

  // Create FAQs
  await Promise.all([
    prisma.fAQ.create({
      data: {
        question: 'Apa itu MemeVerse?',
        answer: 'MemeVerse adalah platform media sosial berbasis meme terbesar di Indonesia. Di sini kamu bisa membuat, berbagi, dan menikmati konten meme seru dengan komunitas.',
        category: 'Umum',
        order: 1
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Bagaimana cara membuat meme?',
        answer: 'Klik tombol Buat Meme di navigasi, pilih atau upload gambar/video, beri judul dan caption, lalu pilih kategori. Kamu bisa membuat meme berupa gambar atau video!',
        category: 'Penggunaan',
        order: 2
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Bagaimana cara mendapatkan koin?',
        answer: 'Kamu bisa mendapatkan koin dengan: membuat meme (+10), berkomentar (+5), memberi like (+1), dan mendapatkan achievement/badge. Koin dapat ditukar dengan hadiah atau fitur premium.',
        category: 'Koin',
        order: 3
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Apa itu badge/achievement?',
        answer: 'Badge adalah pencapaian yang kamu dapatkan dengan aktif berpartisipasi. Ada 3 kategori: Konten (buat meme, bookmark), Sosial (like, komentar), dan Spesial (level, leaderboard, streak). Setiap badge memberikan koin bonus!',
        category: 'Gamifikasi',
        order: 4
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Bagaimana cara melaporkan bug atau konten yang melanggar?',
        answer: 'Pergi ke menu Pengaturan di profil > Lapor Bug. Pilih tipe laporan (Bug, Konten, atau User), isi detail, dan submit. Tim kami akan meninjau laporanmu dalam 24 jam.',
        category: 'Bantuan',
        order: 5
      }
    })
  ])

  console.log('✅ Created FAQs')

  // Create topics
  const topics = await Promise.all([
    prisma.topic.upsert({
      where: { slug: 'funny' },
      update: {},
      create: {
        name: 'Funny',
        slug: 'funny',
        description: 'Meme lucu yang bikin ketawa',
        icon: '😂',
        memeCount: 150
      }
    }),
    prisma.topic.upsert({
      where: { slug: 'anime' },
      update: {},
      create: {
        name: 'Anime',
        slug: 'anime',
        description: 'Meme anime dan manga',
        icon: '🎌',
        memeCount: 120
      }
    }),
    prisma.topic.upsert({
      where: { slug: 'sekolah' },
      update: {},
      create: {
        name: 'Sekolah',
        slug: 'sekolah',
        description: 'Meme tentang sekolah dan pelajaran',
        icon: '📚',
        memeCount: 80
      }
    }),
    prisma.topic.upsert({
      where: { slug: 'pekerjaan' },
      update: {},
      create: {
        name: 'Pekerjaan',
        slug: 'pekerjaan',
        description: 'Meme tentang dunia kerja',
        icon: '💼',
        memeCount: 95
      }
    }),
    prisma.topic.upsert({
      where: { slug: 'nostalgia' },
      update: {},
      create: {
        name: 'Nostalgia',
        slug: 'nostalgia',
        description: 'Meme yang bikin kenangan masa kecil',
        icon: '💭',
        memeCount: 75
      }
    }),
    prisma.topic.upsert({
      where: { slug: 'gaming' },
      update: {},
      create: {
        name: 'Gaming',
        slug: 'gaming',
        description: 'Meme gamer dan game',
        icon: '🎮',
        memeCount: 110
      }
    }),
    prisma.topic.upsert({
      where: { slug: 'teknologi' },
      update: {},
      create: {
        name: 'Teknologi',
        slug: 'teknologi',
        description: 'Meme tentang teknologi',
        icon: '💻',
        memeCount: 65
      }
    }),
    prisma.topic.upsert({
      where: { slug: 'relationship' },
      update: {},
      create: {
        name: 'Relationship',
        slug: 'relationship',
        description: 'Meme tentang hubungan',
        icon: '💕',
        memeCount: 90
      }
    })
  ])

  console.log('✅ Created topics')

  // Create some follows and topic follows
  await Promise.all([
    prisma.follow.create({
      data: {
        followerId: users[0].id,
        followingId: users[1].id
      }
    }),
    prisma.follow.create({
      data: {
        followerId: users[1].id,
        followingId: users[0].id
      }
    }),
    prisma.follow.create({
      data: {
        followerId: users[2].id,
        followingId: users[0].id
      }
    }),
    prisma.topicFollow.create({
      data: {
        userId: users[0].id,
        topicId: topics[0].id
      }
    }),
    prisma.topicFollow.create({
      data: {
        userId: users[0].id,
        topicId: topics[1].id
      }
    }),
    prisma.topicFollow.create({
      data: {
        userId: users[1].id,
        topicId: topics[1].id
      }
    }),
    prisma.topicFollow.create({
      data: {
        userId: users[2].id,
        topicId: topics[3].id
      }
    })
  ])

  console.log('✅ Created follows')

  // Create sample transactions
  await Promise.all([
    prisma.transaction.create({
      data: {
        userId: users[0].id,
        type: 'earned',
        amount: 50,
        description: 'Referral bonus',
        metadata: JSON.stringify({ referralCode: 'MEMEDEMO' })
      }
    }),
    prisma.transaction.create({
      data: {
        userId: users[1].id,
        type: 'premium',
        amount: -1000,
        description: 'Monthly Premium',
        metadata: JSON.stringify({ planId: 'monthly' })
      }
    }),
    prisma.transaction.create({
      data: {
        userId: users[0].id,
        type: 'earned',
        amount: 10,
        description: 'Created meme'
      }
    })
  ])

  console.log('✅ Created transactions')

  console.log('🎉 Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - Users: ${users.length}`)
  console.log(`   - Badges: ${badges.length}`)
  console.log(`   - Memes: ${memes.length}`)
  console.log(`   - FAQs: 5`)
  console.log(`   - Topics: ${topics.length}`)
  console.log(`   - Ready to use!`)
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
