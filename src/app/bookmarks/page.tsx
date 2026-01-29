'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Bookmark as BookmarkIcon,
  Heart,
  MessageCircle,
  Sparkles,
  Filter
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function BookmarksPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      fetchBookmarks()
    }
  }, [user])

  const fetchBookmarks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/bookmarks?userId=${user?.id}`)
      const data = await response.json()
      if (data.success) {
        setBookmarks(data.data)
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = async (memeId: string) => {
    try {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memeId,
          userId: user?.id
        })
      })

      setBookmarks(prev => prev.filter(b => b.memeId !== memeId))
    } catch (error) {
      console.error('Error toggling bookmark:', error)
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookmarkIcon className="h-6 w-6 text-primary" />
                Bookmark
              </h1>
              <p className="text-sm text-muted-foreground">
                {bookmarks.length} meme tersimpan
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {loading ? (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 animate-pulse mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Memuat bookmark...</p>
          </div>
        ) : bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="overflow-hidden border-2 hover:shadow-lg transition-all group">
                <div className="relative">
                  <img
                    src={bookmark.meme.imageUrl}
                    alt={bookmark.meme.title}
                    className="w-full aspect-square object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/90 hover:bg-background"
                    onClick={() => toggleBookmark(bookmark.memeId)}
                  >
                    <BookmarkIcon className="h-5 w-5 fill-current text-primary" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={bookmark.meme.author.image || undefined} />
                      <AvatarFallback className="text-xs">
                        {bookmark.meme.author.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {bookmark.meme.author.name}
                    </span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {bookmark.meme.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-3 line-clamp-2">{bookmark.meme.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {bookmark.meme.votes || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {bookmark.meme._count?.comments || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookmarkIcon className="h-24 w-24 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-xl font-semibold mb-2">Belum ada bookmark</h3>
            <p className="text-muted-foreground mb-6">
              Simpan meme yang kamu suka untuk dilihat nanti!
            </p>
            <Button onClick={() => router.push('/')}>
              <Sparkles className="h-4 w-4 mr-2" />
              Jelajahi Meme
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
