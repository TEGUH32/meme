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
  Trophy,
  Crown,
  Medal,
  TrendingUp,
  Coins,
  Sparkles,
  ArrowLeft,
  Award,
  Flame,
  Star
} from 'lucide-react'

export default function LeaderboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('coins')

  useEffect(() => {
    fetchLeaderboard()
  }, [activeTab])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      const data = await response.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />
    return <span className="text-2xl font-bold text-muted-foreground">#{rank}</span>
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500/10 to-background border-yellow-500/30'
    if (rank === 2) return 'from-gray-400/10 to-background border-gray-400/30'
    if (rank === 3) return 'from-amber-600/10 to-background border-amber-600/30'
    return ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Papan Peringkat
                </h1>
                <p className="text-sm text-muted-foreground">Lihat siapa yang paling aktif!</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="coins" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Terbanyak Koin
            </TabsTrigger>
            <TabsTrigger value="memes" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Terbanyak Meme
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coins" className="space-y-6">
            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {users.slice(0, 3).map((u, idx) => (
                <Card
                  key={u.id}
                  className={`border-2 text-center ${
                    idx === 0
                      ? 'bg-gradient-to-br from-yellow-500/10 to-background border-yellow-500/30 transform md:scale-105'
                      : idx === 1
                      ? 'bg-gradient-to-br from-gray-400/10 to-background border-gray-400/30'
                      : 'bg-gradient-to-br from-amber-600/10 to-background border-amber-600/30'
                  }`}
                >
                  <CardHeader>
                    <div className="flex justify-center mb-2">
                      {getRankIcon(idx + 1)}
                    </div>
                    <Avatar className="h-20 w-20 mx-auto border-4 border-primary/20">
                      <AvatarImage src={u.image || undefined} />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {u.name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="mt-3">{u.name}</CardTitle>
                    <CardDescription>
                      {u._count?.medals || 0} Medali • Level {u.level || 1}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center gap-2">
                      <Coins className="h-6 w-6 text-yellow-500" />
                      <span className="text-4xl font-bold">{u.coins || 0}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Koin Terkumpul</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Full Leaderboard */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Peringkat Lengkap
                </CardTitle>
                <CardDescription>
                  Semua pengguna yang berpartisipasi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {users.map((u, idx) => (
                      <div
                        key={u.id}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                          u.id === user?.id
                            ? 'bg-primary/10 border-primary/30'
                            : getRankColor(idx + 1) || 'hover:bg-muted/50'
                        } ${getRankColor(idx + 1)}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 flex justify-center">
                            {idx < 3 ? getRankIcon(idx + 1) : <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>}
                          </div>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={u.image || undefined} />
                            <AvatarFallback className="text-sm">
                              {u.name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold flex items-center gap-2">
                              {u.name}
                              {u.id === user?.id && (
                                <Badge variant="secondary" className="text-xs">Kamu</Badge>
                              )}
                              {idx < 3 && <Badge className="bg-yellow-500 text-xs">Top {idx + 1}</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Level {u.level || 1} • {u._count?.medals || 0} medali
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xl font-bold flex items-center gap-1">
                              <Coins className="h-4 w-4 text-yellow-500" />
                              {u.coins || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">{u._count?.memes || 0} meme</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="memes" className="space-y-6">
            {/* Top 3 Creators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {users
                .sort((a, b) => (b._count?.memes || 0) - (a._count?.memes || 0))
                .slice(0, 3)
                .map((u, idx) => (
                  <Card
                    key={u.id}
                    className={`border-2 text-center ${
                      idx === 0
                        ? 'bg-gradient-to-br from-purple-500/10 to-background border-purple-500/30 transform md:scale-105'
                        : idx === 1
                        ? 'bg-gradient-to-br from-pink-500/10 to-background border-pink-500/30'
                        : 'bg-gradient-to-br from-indigo-500/10 to-background border-indigo-500/30'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex justify-center mb-2">
                        {idx === 0 ? <Crown className="h-6 w-6 text-purple-500" /> : idx === 1 ? <Medal className="h-6 w-6 text-pink-500" /> : <Medal className="h-6 w-6 text-indigo-500" />}
                      </div>
                      <Avatar className="h-20 w-20 mx-auto border-4 border-primary/20">
                        <AvatarImage src={u.image || undefined} />
                        <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                          {u.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="mt-3">{u.name}</CardTitle>
                      <CardDescription>
                        {u.coins || 0} Koin • Level {u.level || 1}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center gap-2">
                        <Flame className="h-6 w-6 text-orange-500" />
                        <span className="text-4xl font-bold">{u._count?.memes || 0}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Total Meme</p>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* Meme Leaderboard */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Kreator Terbanyak Meme
                </CardTitle>
                <CardDescription>
                  Pengguna dengan kontribusi meme terbanyak
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {users
                      .sort((a, b) => (b._count?.memes || 0) - (a._count?.memes || 0))
                      .map((u, idx) => (
                        <div
                          key={u.id}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                            u.id === user?.id
                              ? 'bg-primary/10 border-primary/30'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 flex justify-center">
                              {idx < 3 ? (
                                idx === 0 ? (
                                  <Crown className="h-5 w-5 text-purple-500" />
                                ) : idx === 1 ? (
                                  <Medal className="h-5 w-5 text-pink-500" />
                                ) : (
                                  <Medal className="h-5 w-5 text-indigo-500" />
                                )
                              ) : (
                                <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>
                              )}
                            </div>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={u.image || undefined} />
                              <AvatarFallback className="text-sm">
                                {u.name?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold flex items-center gap-2">
                                {u.name}
                                {u.id === user?.id && (
                                  <Badge variant="secondary" className="text-xs">Kamu</Badge>
                                )}
                                {idx < 3 && <Badge className="bg-purple-500 text-xs">Top {idx + 1}</Badge>}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Level {u.level || 1} • {u.coins || 0} koin
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-xl font-bold flex items-center gap-1">
                                <Flame className="h-4 w-4 text-orange-500" />
                                {u._count?.memes || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">meme</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
