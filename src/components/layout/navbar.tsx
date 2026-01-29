'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sparkles,
  Menu,
  X,
  LayoutDashboard,
  TrendingUp,
  User,
  Settings,
  LogOut,
  Plus,
  Bookmark,
  Wallet,
  Crown
} from 'lucide-react'
import { useState } from 'react'
import { NotificationBell } from './notification-bell'

interface NavbarProps {
  onCreateMeme?: () => void
}

export function Navbar({ onCreateMeme }: NavbarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
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
                  <span>Dashboard</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => router.push('/leaderboard')}>
                  <TrendingUp className="h-4 w-4" />
                  <span>Peringkat</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => router.push('/wallet')}>
                  <Wallet className="h-4 w-4" />
                  <span>Dompet</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => router.push('/premium')}>
                  <Crown className="h-4 w-4" />
                  <span>Premium</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => router.push('/bookmarks')}>
                  <Bookmark className="h-4 w-4" />
                  <span>Bookmark</span>
                </Button>
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.image || undefined} />
                        <AvatarFallback className="text-xs">
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
                    <DropdownMenuItem onClick={() => router.push('/wallet')}>
                      <Wallet className="h-4 w-4 mr-2" />
                      Dompet Koin
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/premium')}>
                      <Crown className="h-4 w-4 mr-2" />
                      Premium
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/bookmarks')}>
                      <Bookmark className="h-4 w-4 mr-2" />
                      Bookmark
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
                <Button size="sm" className="flex items-center gap-2" onClick={onCreateMeme}>
                  <Plus className="h-4 w-4" />
                  <span>Buat Meme</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => router.push('/auth/signin')}>
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
                <div className="px-4 py-3 flex items-center gap-3 bg-muted/30 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={session.user.image || undefined} />
                    <AvatarFallback>
                      {session.user.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user.email}</p>
                  </div>
                </div>
                <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/dashboard')}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/leaderboard')}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Peringkat
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/wallet')}>
                  <Wallet className="h-4 w-4 mr-2" />
                  Dompet
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/premium')}>
                  <Crown className="h-4 w-4 mr-2" />
                  Premium
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/bookmarks')}>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Bookmark
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
                <Button className="w-full mt-2" onClick={onCreateMeme}>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Meme
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/auth/signin')}>
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
  )
}
