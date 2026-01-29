'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Home,
  Flame,
  Search,
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  Send,
  TrendingUp,
  Coins,
  Medal,
  Bell,
  LogOut,
  Plus,
  Filter,
  User,
  LayoutDashboard,
  Settings,
  Menu,
  X
} from 'lucide-react'

// Categories
const CATEGORIES = [
  'Funny', 'Relate', 'Nostalgia', 'Sad', 'Random', 'Sarcasm', 'Dark', 'Absurd', 'Cringe', 'Sus',
  'Gaming', 'Anime', 'Olahraga', 'Classic', 'Animal',
  'Sekolah', 'Pekerjaan', 'Kehidupan', 'Pertemanan', 'Menyentuh', 'High IQ',
  'Meme Daerah', 'Politik', 'Makanan', 'Komik', 'Berita', 'Music'
]

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('foryou')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [memes, setMemes] = useState<any[]>([])
  const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set())
  const [loadingLike, setLoadingLike] = useState<Set<string>>(new Set())
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newMeme, setNewMeme] = useState({ title: '', imageUrl: '', caption: '', category: 'Funny' })
  const [comments, setComments] = useState<{ [key: string]: any[] }>({})
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({})
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({})
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set())
  const [submittingComment, setSubmittingComment] = useState<Set<string>>(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMemes()
  }, [activeTab, selectedCategory, searchQuery])

  const fetchMemes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      if (activeTab === 'viral') {
        params.append('type', 'viral')
      } else if (activeTab === 'fresh') {
        params.append('type', 'fresh')
      }

      const response = await fetch(`/api/memes?${params}`)
      const data = await response.json()

      if (data.success) {
        setMemes(data.data)
        
        // Fetch user's liked memes if authenticated
        if (session?.user?.id) {
          const votesResponse = await fetch(`/api/votes?userId=${session.user.id}`)
          const votesData = await votesResponse.json()
          if (votesData.success && votesData.data) {
            const likedIds = votesData.data
              .filter((vote: any) => vote.type === 'up')
              .map((vote: any) => vote.memeId)
            setLikedMemes(new Set(likedIds))
          }
        }
      }
    } catch (error) {
      console.error('Error fetching memes:', error)
      toast.error('Gagal memuat meme', {
        description: 'Terjadi kesalahan saat memuat meme'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (memeId: string) => {
    if (!session?.user?.id) {
      signIn()
      return
    }

    try {
      // Add to loading state
      setLoadingLike(prev => new Set(prev).add(memeId))

      const isLiked = likedMemes.has(memeId)
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memeId,
          type: isLiked ? 'down' : 'up',
          userId: session.user.id
        })
      })

      const result = await response.json()

      if (result.success) {
        // Update liked state
        setLikedMemes(prev => {
          const newSet = new Set(prev)
          if (newSet.has(memeId)) {
            newSet.delete(memeId)
          } else {
            newSet.add(memeId)
          }
          return newSet
        })

        // Update votes locally with the correct score from API
        if (result.data?.score !== undefined) {
          setMemes(prev =>
            prev.map(meme =>
              meme.id === memeId
                ? { ...meme, votes: result.data.score }
                : meme
            )
          )
        } else {
          // Fallback if API doesn't return score
          setMemes(prev =>
            prev.map(meme =>
              meme.id === memeId
                ? { ...meme, votes: meme.votes + (isLiked ? -1 : 1) }
                : meme
            )
          )
        }

        // Show success toast
        if (!isLiked) {
          toast.success('Meme disukai!', {
            description: 'Kamu mendapatkan 1 koin'
          })
        }
      } else {
        console.error('Failed to vote:', result.error)
        toast.error('Gagal memproses like', {
          description: result.error || 'Terjadi kesalahan'
        })
      }
    } catch (error) {
      console.error('Error voting:', error)
      toast.error('Terjadi kesalahan', {
        description: 'Gagal memproses like'
      })
    } finally {
      // Remove from loading state
      setLoadingLike(prev => {
        const newSet = new Set(prev)
        newSet.delete(memeId)
        return newSet
      })
    }
  }

  const handleCreateMeme = async () => {
    if (!session?.user?.id) {
      signIn()
      return
    }

    try {
      const response = await fetch('/api/memes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMeme,
          authorId: session.user.id
        })
      })

      const data = await response.json()
      if (data.success) {
        setMemes([data.data, ...memes])
        setShowCreateDialog(false)
        setNewMeme({ title: '', imageUrl: '', caption: '', category: 'Funny' })
        toast.success('Meme berhasil dibuat!', {
          description: 'Meme kamu sekarang terlihat oleh semua orang'
        })
      } else {
        toast.error('Gagal membuat meme', {
          description: data.error || 'Terjadi kesalahan'
        })
      }
    } catch (error) {
      console.error('Error creating meme:', error)
      toast.error('Terjadi kesalahan', {
        description: 'Gagal membuat meme'
      })
    }
  }

  const fetchComments = async (memeId: string) => {
    if (comments[memeId]) return // Already loaded
    
    try {
      setLoadingComments(prev => new Set(prev).add(memeId))
      
      const response = await fetch(`/api/comments?memeId=${memeId}`)
      const data = await response.json()
      
      if (data.success) {
        setComments(prev => ({
          ...prev,
          [memeId]: data.data
        }))
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoadingComments(prev => {
        const newSet = new Set(prev)
        newSet.delete(memeId)
        return newSet
      })
    }
  }

  const handleComment = async (memeId: string) => {
    if (!session?.user?.id) {
      signIn()
      return
    }

    const comment = newComments[memeId]
    if (!comment || !comment.trim()) return

    try {
      setSubmittingComment(prev => new Set(prev).add(memeId))
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: comment,
          memeId,
          userId: session.user.id
        })
      })

      const result = await response.json()

      if (result.success) {
        setComments(prev => ({
          ...prev,
          [memeId]: [...(prev[memeId] || []), result.data]
        }))
        setNewComments(prev => ({ ...prev, [memeId]: '' }))

        setMemes(prev =>
          prev.map(meme =>
            meme.id === memeId
              ? { ...meme, _count: { ...meme._count, comments: (meme._count?.comments || 0) + 1 } }
              : meme
          )
        )

        toast.success('Komentar berhasil dikirim!', {
          description: 'Kamu mendapatkan 5 koin'
        })
      } else {
        console.error('Failed to add comment:', result.error)
        toast.error('Gagal mengirim komentar', {
          description: result.error || 'Terjadi kesalahan'
        })
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Terjadi kesalahan', {
        description: 'Gagal mengirim komentar'
      })
    } finally {
      setSubmittingComment(prev => {
        const newSet = new Set(prev)
        newSet.delete(memeId)
        return newSet
      })
    }
  }

  const handleShare = async (memeId: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cek meme ini di MemeVerse!',
          url: window.location.href
        })
      } catch (error) {
        console.log('Share canceled')
      }
    }
  }

  const filteredMemes = memes.filter(meme => {
    if (selectedCategory && meme.category !== selectedCategory) return false
    if (searchQuery && !meme.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const MemeCard = ({ meme }: { meme: any }) => (
    <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push(`/profile?userId=${meme.authorId}`)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={meme.author.image || undefined} />
              <AvatarFallback>{meme.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{meme.author.name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(meme.createdAt).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
          <Badge variant="secondary">{meme.category}</Badge>
        </div>
        <h3 className="text-lg font-bold mt-2">{meme.title}</h3>
      </CardHeader>
      <CardContent className="p-0">
        <img
          src={meme.imageUrl}
          alt={meme.title}
          className="w-full aspect-square object-cover"
        />
        {meme.caption && (
          <p className="p-4 text-sm text-muted-foreground">{meme.caption}</p>
        )}
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(meme.id)}
                disabled={loadingLike.has(meme.id)}
                className={`flex items-center gap-2 ${likedMemes.has(meme.id) ? 'text-red-500' : ''}`}
              >
                <Heart className={`h-4 w-4 ${likedMemes.has(meme.id) ? 'fill-current' : ''} ${loadingLike.has(meme.id) ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-semibold">{meme.votes || 0}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowComments(prev => ({ ...prev, [meme.id]: !prev[meme.id] }))
                  if (!showComments[meme.id]) {
                    fetchComments(meme.id)
                  }
                }}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-semibold">{meme._count?.comments || 0}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare(meme.id)}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {showComments[meme.id] && (
            <div className="mt-4 space-y-3">
              {loadingComments.has(meme.id) ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Memuat komentar...
                </div>
              ) : (
                <ScrollArea className="max-h-48">
                  {(comments[meme.id] || []).map((comment: any) => (
                    <div key={comment.id} className="text-sm p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={comment.user?.image || undefined} />
                          <AvatarFallback className="text-xs">
                            {comment.user?.name?.substring(0, 2).toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{comment.user?.name || 'Unknown'}</span>
                      </div>
                      <p className="ml-7">{comment.content}</p>
                    </div>
                  ))}
                </ScrollArea>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Tulis komentar..."
                  value={newComments[meme.id] || ''}
                  onChange={(e) => setNewComments(prev => ({ ...prev, [meme.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleComment(meme.id)}
                  disabled={submittingComment.has(meme.id)}
                  className="flex-1"
                />
                <Button 
                  size="sm" 
                  onClick={() => handleComment(meme.id)}
                  disabled={submittingComment.has(meme.id)}
                >
                  {submittingComment.has(meme.id) ? (
                    <Sparkles className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 animate-pulse mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold hidden sm:block">MemeVerse</h1>
            </div>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2">
              {session?.user ? (
                <>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => router.push('/dashboard')}>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => router.push('/leaderboard')}>
                    <TrendingUp className="h-4 w-4" />
                    Peringkat
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={session.user.image || undefined} />
                          <AvatarFallback>
                            {session.user.name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{session.user.name}</p>
                          <p className="text-xs text-muted-foreground">{session.user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <User className="h-4 w-4 mr-2" />
                        Profil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/settings')}>
                        <Settings className="h-4 w-4 mr-2" />
                        Pengaturan
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Keluar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Buat Meme
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Buat Meme Baru</DialogTitle>
                        <DialogDescription>
                          Buat dan bagikan meme kreatifmu ke komunitas
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Judul</Label>
                          <Input
                            placeholder="Beri judul meme-mu"
                            value={newMeme.title}
                            onChange={(e) => setNewMeme(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>URL Gambar</Label>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            value={newMeme.imageUrl}
                            onChange={(e) => setNewMeme(prev => ({ ...prev, imageUrl: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Kategori</Label>
                          <ScrollArea className="h-32 w-full border rounded-md p-2">
                            <div className="flex flex-wrap gap-2">
                              {CATEGORIES.map((cat) => (
                                <Badge
                                  key={cat}
                                  variant={newMeme.category === cat ? 'default' : 'outline'}
                                  className="cursor-pointer"
                                  onClick={() => setNewMeme(prev => ({ ...prev, category: cat }))}
                                >
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                        <div className="space-y-2">
                          <Label>Caption (Opsional)</Label>
                          <Textarea
                            placeholder="Tambahkan caption..."
                            value={newMeme.caption}
                            onChange={(e) => setNewMeme(prev => ({ ...prev, caption: e.target.value }))}
                            rows={3}
                          />
                        </div>
                        <Button onClick={handleCreateMeme} className="w-full">
                          <Send className="h-4 w-4 mr-2" />
                          Kirim Meme
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => signIn()}>
                    Masuk
                  </Button>
                  <Button size="sm" onClick={() => router.push('/auth/signup')}>
                    Daftar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t space-y-2">
              {session?.user ? (
                <>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/dashboard')}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/leaderboard')}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Peringkat
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Profil
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Pengaturan
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Keluar
                  </Button>
                  <Button className="w-full" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Meme
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => signIn()}>
                    Masuk
                  </Button>
                  <Button className="w-full" onClick={() => router.push('/auth/signup')}>
                    Daftar
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="foryou" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">For You</span>
            </TabsTrigger>
            <TabsTrigger value="fresh" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Fresh</span>
            </TabsTrigger>
            <TabsTrigger value="viral" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              <span className="hidden sm:inline">Viral</span>
            </TabsTrigger>
            <TabsTrigger value="telusuri" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Telusuri</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="foryou" className="space-y-4">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Filter Kategori</p>
              </div>
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  <Badge
                    variant={selectedCategory === null ? 'default' : 'outline'}
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Semua
                  </Badge>
                  {CATEGORIES.map((cat) => (
                    <Badge
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      className="cursor-pointer whitespace-nowrap"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 animate-pulse mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Memuat meme...</p>
              </div>
            ) : filteredMemes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMemes.map(meme => (
                  <MemeCard key={meme.id} meme={meme} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">Belum ada meme untuk kategori ini</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="fresh" className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 animate-pulse mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Memuat meme terbaru...</p>
              </div>
            ) : filteredMemes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMemes.map(meme => (
                  <MemeCard key={meme.id} meme={meme} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Belum ada meme</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="viral" className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 animate-pulse mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Memuat meme viral...</p>
              </div>
            ) : filteredMemes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMemes.map(meme => (
                  <MemeCard key={meme.id} meme={meme} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Belum ada meme</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="telusuri" className="space-y-4">
            <div className="mb-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari meme berdasarkan judul..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Filter Kategori:</p>
              </div>
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  <Badge
                    variant={selectedCategory === null ? 'default' : 'outline'}
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Semua
                  </Badge>
                  {CATEGORIES.map((cat) => (
                    <Badge
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      className="cursor-pointer whitespace-nowrap"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 animate-pulse mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Mencari meme...</p>
              </div>
            ) : filteredMemes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMemes.map(meme => (
                  <MemeCard key={meme.id} meme={meme} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Tidak ditemukan meme dengan kata kunci tersebut</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">MemeVerse</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Komunitas Meme Terbesar</li>
                <li>Buat & Bagikan Meme</li>
                <li>Dapatkan Koin & Medali</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Menu</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Beranda</a></li>
                <li><a href="/leaderboard" className="hover:text-foreground">Peringkat</a></li>
                <li><a href="/dashboard" className="hover:text-foreground">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Bantuan</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">FAQ</a></li>
                <li><a href="#" className="hover:text-foreground">Kontak</a></li>
                <li><a href="#" className="hover:text-foreground">Lapor Bug</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Syarat & Ketentuan</a></li>
                <li><a href="#" className="hover:text-foreground">Kebijakan Privasi</a></li>
                <li><a href="#" className="hover:text-foreground">Kebijakan Koin</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 MemeVerse. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Missing import for ImageIcon
const ImageIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
)
