'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sparkles,
  ArrowLeft,
  Save,
  Award,
  Image as ImageIcon,
  Camera,
  User,
  Mail,
  MapPin,
  Calendar,
  Coins,
  Heart,
  MessageCircle,
  TrendingUp,
  Crown,
  Users
} from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { update: updateSession } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    website: ''
  })
  const [userMemes, setUserMemes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 })
  const [userBadges, setUserBadges] = useState<any[]>([])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: '',
        location: '',
        website: ''
      })
      fetchUserMemes()
      fetchFollowStats()
      fetchBadges()
    }
  }, [user])

  const fetchUserMemes = async () => {
    try {
      const response = await fetch(`/api/memes?authorId=${user?.id}`)
      const data = await response.json()
      if (data.success) {
        setUserMemes(data.data)
      }
    } catch (error) {
      console.error('Error fetching memes:', error)
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

  const fetchBadges = async () => {
    try {
      const response = await fetch(`/api/badges?userId=${user?.id}`)
      const data = await response.json()
      setUserBadges(data.badges || [])
    } catch (error) {
      console.error('Error fetching badges:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await updateSession()
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

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
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="memes">Meme Saya</TabsTrigger>
            <TabsTrigger value="achievements">Pencapaian</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header Card */}
            <Card className="border-2 bg-gradient-to-br from-primary/10 to-background">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-primary/20">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                        {user.name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">{user.name}</h1>
                        {user.coins && user.coins > 10000 && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            Top Creator
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-yellow-500" />
                        <div>
                          <div className="text-2xl font-bold">{user.coins || 0}</div>
                          <div className="text-xs text-muted-foreground">Koin</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        <div>
                          <div className="text-2xl font-bold">{userBadges.length}</div>
                          <div className="text-xs text-muted-foreground">Medali</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="text-2xl font-bold">{followStats.followers}</div>
                          <div className="text-xs text-muted-foreground">Pengikut</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="text-2xl font-bold">{user.level || 1}</div>
                          <div className="text-xs text-muted-foreground">Level</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={() => router.push('/dashboard')}>
                        Lihat Dashboard
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditing ? 'Batal' : 'Edit Profil'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile Form */}
            {isEditing && (
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle>Edit Profil</CardTitle>
                  <CardDescription>Update informasi profil kamu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nama
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nama kamu"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Ceritakan tentang kamu..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Lokasi
                    </label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Jakarta, Indonesia"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <Input
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>

                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Profile Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Bergabung Sejak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-lg font-semibold">Januari 2024</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Meme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <span className="text-lg font-semibold">{userMemes.length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Like
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="text-lg font-semibold">0</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="memes" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Meme Saya
                </CardTitle>
                <CardDescription>
                  {userMemes.length} meme yang telah kamu buat
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userMemes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userMemes.map((meme) => (
                      <div key={meme.id} className="group relative rounded-lg overflow-hidden border-2 hover:border-primary/50 transition-all">
                        <img
                          src={meme.imageUrl}
                          alt={meme.title}
                          className="w-full aspect-square object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                          <h3 className="text-white font-semibold">{meme.title}</h3>
                          <div className="flex items-center gap-3 mt-2 text-white/80 text-sm">
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {meme.votes || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {meme._count?.comments || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2">Belum ada meme</h3>
                    <p className="text-muted-foreground mb-4">
                      Mulai buat meme dan bagikan ke komunitas!
                    </p>
                    <Button onClick={() => router.push('/')}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Buat Meme Pertama
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card className="border-2 bg-gradient-to-br from-yellow-500/10 to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Pencapaian & Medali
                </CardTitle>
                <CardDescription>
                  Kumpulkan medali dengan aktif di MemeVerse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userBadges.length > 0 ? (
                    userBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="p-4 rounded-lg border-2 bg-gradient-to-br from-yellow-500/10 to-background border-yellow-500/30 hover:shadow-lg transition-all"
                      >
                        <div className="text-5xl mb-3">{badge.icon || '🏆'}</div>
                        <h3 className="font-semibold text-lg">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
                        {badge.coinReward > 0 && (
                          <Badge className="mt-2 bg-yellow-500">
                            +{badge.coinReward} Koin
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    [
                      { name: 'Memer Pertama', desc: 'Buat meme pertama', icon: '🎉', unlocked: true, reward: '+10 Koin' },
                      { name: 'Kreator Aktif', desc: 'Buat 10 meme', icon: '⭐', unlocked: true, reward: '+50 Koin' },
                      { name: 'Pembicara', desc: 'Tulis 50 komentar', icon: '💬', unlocked: true, reward: '+25 Koin' },
                      { name: 'Viral Star', desc: 'Dapatkan 1000 like', icon: '🔥', unlocked: false, reward: '+100 Koin' },
                      { name: 'Top 10', desc: 'Masuk top 10 leaderboard', icon: '🏆', unlocked: false, reward: '+75 Koin' },
                      { name: 'Komunitas', desc: 'Dapatkan 100 follower', icon: '👥', unlocked: false, reward: '+50 Koin' },
                    ].map((achievement, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          achievement.unlocked
                            ? 'bg-gradient-to-br from-yellow-500/10 to-background border-yellow-500/30 hover:shadow-lg'
                            : 'bg-muted/30 opacity-50 border-muted'
                        }`}
                      >
                        <div className="text-5xl mb-3">{achievement.icon}</div>
                        <h3 className="font-semibold text-lg">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{achievement.desc}</p>
                        <Badge
                          variant={achievement.unlocked ? "default" : "secondary"}
                          className="mt-2"
                        >
                          {achievement.reward}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
