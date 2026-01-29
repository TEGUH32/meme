'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Coins,
  TrendingUp,
  Medal,
  Image as ImageIcon,
  MessageCircle,
  Heart,
  Award,
  Sparkles,
  ArrowRight,
  Target,
  Clock,
  Zap,
  Users,
  Hash,
  Share2,
  Crown
} from 'lucide-react'

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalMemes: 0,
    totalComments: 0,
    totalLikes: 0,
    totalViews: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 })
  const [topics, setTopics] = useState<any[]>([])
  const [referralData, setReferralData] = useState<any>(null)
  const [userBadges, setUserBadges] = useState<any[]>([])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isLoading, isAuthenticated, router])

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`/api/users?id=${user?.id}`)
      const data = await response.json()
      if (data.success) {
        setStats({
          totalMemes: data.data._count?.memes || 0,
          totalComments: data.data._count?.comments || 0,
          totalLikes: 0,
          totalViews: 0
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch(`/api/memes`)
      const data = await response.json()
      if (data.success) {
        setRecentActivity(data.data.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching activity:', error)
    }
  }

  const fetchFollowStats = async () => {
    try {
      const response = await fetch(`/api/follow?userId=${user?.id}`)
      const data = await response.json()
      setFollowStats({ followers: data.followers || 0, following: data.following || 0 })
    } catch (error) {
      console.error('Error fetching follow stats:', error)
    }
  }

  const fetchTopics = async () => {
    try {
      const response = await fetch(`/api/topics`)
      const data = await response.json()
      setTopics(data.slice(0, 6))
    } catch (error) {
      console.error('Error fetching topics:', error)
    }
  }

  const fetchReferralData = async () => {
    try {
      const response = await fetch(`/api/referral`)
      const data = await response.json()
      setReferralData(data)
    } catch (error) {
      console.error('Error fetching referral data:', error)
    }
  }

  const fetchBadges = async () => {
    try {
      const response = await fetch(`/api/badges?userId=${user?.id}`)
      const data = await response.json()
      setUserBadges(data.badges || [])
    } catch (error) {
      console.error('Error fetching badges:', error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserStats()
      fetchRecentActivity()
      fetchFollowStats()
      fetchTopics()
      fetchReferralData()
      fetchBadges()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 animate-pulse mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Dashboard</h1>
            </div>
            <Button variant="outline" onClick={() => router.push('/')}>
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Profile Card */}
        <Card className="mb-8 border-2 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-primary/20">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {user.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-gradient-to-r from-primary to-primary/60">
                      Level {user.level || 1}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Medal className="h-3 w-3" />
                      Memer Aktif
                    </Badge>
                  </div>
                </div>
              </div>
              <Button onClick={() => router.push('/profile')} className="flex items-center gap-2">
                Edit Profil
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Meme</CardTitle>
              <ImageIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalMemes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Meme yang kamu buat
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Komentar</CardTitle>
              <MessageCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalComments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Komentar yang kamu tulis
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Koin</CardTitle>
              <Coins className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{user.coins || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Mata uang virtual
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all bg-gradient-to-br from-yellow-500/10 to-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medali</CardTitle>
              <Award className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">5</div>
              <p className="text-xs text-muted-foreground mt-1">
                Medali yang didapat
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="topics">Topik</TabsTrigger>
            <TabsTrigger value="achievements">Pencapaian</TabsTrigger>
            <TabsTrigger value="analytics">Analitik</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Aktivitas Terbaru
                  </CardTitle>
                  <CardDescription>Meme terbaru di komunitas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    {recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity.map((meme) => (
                          <div key={meme.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img src={meme.imageUrl} alt={meme.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{meme.title}</h4>
                              <p className="text-sm text-muted-foreground">{meme.category}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {meme.votes || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  {meme._count?.comments || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Belum ada meme</p>
                        <Button variant="link" onClick={() => router.push('/')}>
                          Buat meme sekarang
                        </Button>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-2 bg-gradient-to-br from-primary/5 to-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Aksi Cepat
                  </CardTitle>
                  <CardDescription>Pintasan ke fitur populer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" onClick={() => router.push('/')}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Buat Meme Baru
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/leaderboard')}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Lihat Leaderboard
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/profile')}>
                    <Award className="h-4 w-4 mr-2" />
                    Lihat Medali
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/wallet')}>
                    <Coins className="h-4 w-4 mr-2" />
                    Dompet Koin
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/premium')}>
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Premium
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/settings')}>
                    <Target className="h-4 w-4 mr-2" />
                    Pengaturan Akun
                  </Button>
                </CardContent>
              </Card>

              {/* Follow Stats */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Statistik Follow
                  </CardTitle>
                  <CardDescription>Pengikut dan yang diikuti</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-background rounded-lg">
                      <div className="text-3xl font-bold text-primary">{followStats.followers}</div>
                      <div className="text-sm text-muted-foreground mt-1">Pengikut</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-secondary/10 to-background rounded-lg">
                      <div className="text-3xl font-bold">{followStats.following}</div>
                      <div className="text-sm text-muted-foreground mt-1">Mengikuti</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Referral Card */}
              <Card className="border-2 bg-gradient-to-br from-green-500/10 to-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-green-500" />
                    Program Referral
                  </CardTitle>
                  <CardDescription>Undang teman dan dapat koin!</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Total Undangan</span>
                      <span className="font-bold">{referralData?.totalReferrals || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Total Koin Dapat</span>
                      <span className="font-bold text-green-500">+{referralData?.totalCoinsEarned || 0}</span>
                    </div>
                    {referralData?.referralLink && (
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Kode Referral Kamu:</p>
                        <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                          {referralData.referralCode || 'MEME123'}
                        </code>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="topics" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" />
                  Topik Populer
                </CardTitle>
                <CardDescription>Ikuti topik yang kamu suka untuk konten yang relevan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="p-4 rounded-lg border-2 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer bg-gradient-to-br from-primary/5 to-background"
                    >
                      <div className="text-4xl mb-2">{topic.icon || '📌'}</div>
                      <h3 className="font-semibold">{topic.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{topic.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs">
                          {topic._count?.followers || 0} pengikut
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {topic.memeCount} meme
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>🏆 Pencapaian</CardTitle>
                <CardDescription>Medali dan prestasi yang kamu dapatkan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userBadges.length > 0 ? (
                    userBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="p-4 rounded-lg border-2 bg-gradient-to-br from-yellow-500/10 to-background border-yellow-500/20 transition-all hover:shadow-lg"
                      >
                        <div className="text-4xl mb-2">{badge.icon || '🏆'}</div>
                        <h3 className="font-semibold">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
                        {badge.coinReward > 0 && (
                          <Badge className="mt-2 bg-yellow-500">
                            +{badge.coinReward} Koin
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <>
                      {[
                        { name: 'Memer Pertama', desc: 'Buat meme pertama', icon: '🎉', unlocked: true },
                        { name: 'Kreator Aktif', desc: 'Buat 10 meme', icon: '⭐', unlocked: true },
                        { name: 'Pembicara', desc: 'Tulis 50 komentar', icon: '💬', unlocked: true },
                        { name: 'Viral Star', desc: 'Meme 1000 like', icon: '🔥', unlocked: false },
                        { name: 'Top 10', desc: 'Masuk top 10', icon: '🏆', unlocked: false },
                      ].map((achievement, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            achievement.unlocked
                              ? 'bg-gradient-to-br from-yellow-500/10 to-background border-yellow-500/20'
                              : 'bg-muted/30 opacity-60'
                          }`}
                        >
                          <div className="text-4xl mb-2">{achievement.icon}</div>
                          <h3 className="font-semibold">{achievement.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{achievement.desc}</p>
                          {achievement.unlocked && (
                            <Badge className="mt-2 bg-green-500">Terbuka</Badge>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>📊 Analitik Performa</CardTitle>
                <CardDescription>Statistik performa konten kamu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold text-primary">{stats.totalMemes}</div>
                      <div className="text-sm text-muted-foreground mt-1">Total Meme</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold text-green-500">0</div>
                      <div className="text-sm text-muted-foreground mt-1">Total Views</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-500">0%</div>
                      <div className="text-sm text-muted-foreground mt-1">Engagement Rate</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-muted-foreground">
                      Fitur analitik lengkap akan segera hadir! 🚀
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
