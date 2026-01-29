'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sparkles,
  ArrowLeft,
  Save,
  Bell,
  Shield,
  User,
  LogOut,
  Moon,
  Sun,
  Globe,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    likeNotifications: true,
    commentNotifications: true,
    medalNotifications: true
  })
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showStats: true
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isLoading, isAuthenticated, router])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    // Simulate saving
    setTimeout(() => {
      setLoading(false)
      toast.success('Pengaturan berhasil disimpan!')
    }, 1000)
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
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <h1 className="text-xl font-bold">Pengaturan</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">Akun</TabsTrigger>
            <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
            <TabsTrigger value="privacy">Privasi</TabsTrigger>
            <TabsTrigger value="appearance">Tampilan</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informasi Akun
                </CardTitle>
                <CardDescription>
                  Kelola informasi dasar akun kamu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user.email} disabled />
                  <p className="text-xs text-muted-foreground">
                    Email tidak dapat diubah. Hubungi support jika perlu mengubah email.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Nama</Label>
                  <Input defaultValue={user.name} placeholder="Nama kamu" />
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Ceritakan tentang dirimu..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleSaveSettings} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Zona Bahaya
                </CardTitle>
                <CardDescription>
                  Tindakan ini tidak dapat dibatalkan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                  <h3 className="font-semibold mb-2">Hapus Akun</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Menghapus akun akan menghapus semua data kamu secara permanen termasuk meme, komentar, dan statistik.
                  </p>
                  <Button variant="destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Hapus Akun Saya
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Preferensi Notifikasi
                </CardTitle>
                <CardDescription>
                  Pilih notifikasi yang ingin kamu terima
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifikasi Email</Label>
                    <p className="text-xs text-muted-foreground">
                      Terima notifikasi penting melalui email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifikasi Push</Label>
                    <p className="text-xs text-muted-foreground">
                      Terima notifikasi langsung di browser
                    </p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, pushNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifikasi Like</Label>
                    <p className="text-xs text-muted-foreground">
                      Dapatkan notifikasi saat seseorang menyukai meme kamu
                    </p>
                  </div>
                  <Switch
                    checked={notifications.likeNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, likeNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifikasi Komentar</Label>
                    <p className="text-xs text-muted-foreground">
                      Dapatkan notifikasi saat ada komentar baru
                    </p>
                  </div>
                  <Switch
                    checked={notifications.commentNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, commentNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifikasi Medali</Label>
                    <p className="text-xs text-muted-foreground">
                      Dapatkan notifikasi saat mendapat medali baru
                    </p>
                  </div>
                  <Switch
                    checked={notifications.medalNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, medalNotifications: checked })
                    }
                  />
                </div>

                <Button onClick={handleSaveSettings} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Menyimpan...' : 'Simpan Preferensi'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Pengaturan Privasi
                </CardTitle>
                <CardDescription>
                  Kontrol siapa yang dapat melihat konten kamu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Profil Publik</Label>
                    <p className="text-xs text-muted-foreground">
                      Izinkan orang lain melihat profil kamu
                    </p>
                  </div>
                  <Switch
                    checked={privacy.profileVisible}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, profileVisible: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tampilkan Email</Label>
                    <p className="text-xs text-muted-foreground">
                      Tampilkan email di profil publik
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showEmail}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, showEmail: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tampilkan Statistik</Label>
                    <p className="text-xs text-muted-foreground">
                      Tampilkan statistik meme dan like di profil
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showStats}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, showStats: checked })
                    }
                  />
                </div>

                <Button onClick={handleSaveSettings} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Keamanan</CardTitle>
                <CardDescription>
                  Kelola keamanan akun kamu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="h-4 w-4 mr-2" />
                  Ganti Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Key className="h-4 w-4 mr-2" />
                  Two-Factor Authentication
                  <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Tampilan
                </CardTitle>
                <CardDescription>
                  Sesuaikan tampilan aplikasi sesuai preferensi kamu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-3 block">Tema</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-2 h-24"
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="h-6 w-6" />
                      <span className="text-sm">Light</span>
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-2 h-24"
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="h-6 w-6" />
                      <span className="text-sm">Dark</span>
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-2 h-24"
                      onClick={() => setTheme('system')}
                    >
                      <Globe className="h-6 w-6" />
                      <span className="text-sm">System</span>
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <h3 className="font-semibold mb-2">Tema Aktif: {theme}</h3>
                  <p className="text-sm text-muted-foreground">
                    Teks ini ditampilkan dengan tema yang dipilih.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6 border-2">
          <CardContent className="p-6">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Keluar dari Akun
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
