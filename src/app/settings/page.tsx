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
  Trash2,
  Home,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { DeleteAccountModal } from '@/components/modals/delete-account-modal'

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  likeNotifications: boolean
  commentNotifications: boolean
  medalNotifications: boolean
}

interface PrivacySettings {
  profileVisible: boolean
  showEmail: boolean
  showStats: boolean
}

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading, updateUser } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  
  const [activeTab, setActiveTab] = useState('account')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [saveLoading, setSaveLoading] = useState<string | null>(null)
  
  // Form states
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  
  // Settings states
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    likeNotifications: true,
    commentNotifications: true,
    medalNotifications: true
  })
  
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisible: true,
    showEmail: false,
    showStats: true
  })

  // Load user data dan settings
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setBio(user.bio || '')
      
      // Load notification settings
      if (user.settingsNotifications) {
        setNotifications(user.settingsNotifications)
      }
      
      // Load privacy settings
      if (user.settingsPrivacy) {
        setPrivacy(user.settingsPrivacy)
      }
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  const handleSaveSettings = async (type: 'profile' | 'notifications' | 'privacy' | 'appearance') => {
    setSaveLoading(type)
    
    let data: any = {}
    
    switch (type) {
      case 'profile':
        data = { name, bio }
        break
      case 'notifications':
        data = notifications
        break
      case 'privacy':
        data = privacy
        break
      case 'appearance':
        data = { theme }
        break
    }
    
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data }),
      })

      const result = await response.json()

      if (response.ok) {
        // Update user data di context
        updateUser(result)
        
        toast.success('Pengaturan berhasil disimpan!', {
          description: `Pengaturan ${getTabName(type)} telah diperbarui`,
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        })
      } else {
        toast.error(result.error || `Gagal menyimpan pengaturan ${getTabName(type)}`)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Terjadi kesalahan saat menyimpan pengaturan')
    } finally {
      setSaveLoading(null)
    }
  }

  const handleCancelChanges = (type: 'profile' | 'notifications' | 'privacy' | 'appearance') => {
    switch (type) {
      case 'profile':
        setName(user?.name || '')
        setBio(user?.bio || '')
        break
      case 'notifications':
        if (user?.settingsNotifications) {
          setNotifications(user.settingsNotifications)
        }
        break
      case 'privacy':
        if (user?.settingsPrivacy) {
          setPrivacy(user.settingsPrivacy)
        }
        break
      case 'appearance':
        setTheme(user?.settingsAppearance?.theme || 'system')
        break
    }
    
    toast.info('Perubahan dibatalkan', {
      icon: <XCircle className="h-5 w-5 text-yellow-500" />,
    })
  }

  const getTabName = (type: string) => {
    switch (type) {
      case 'profile': return 'profil'
      case 'notifications': return 'notifikasi'
      case 'privacy': return 'privasi'
      case 'appearance': return 'tampilan'
      default: return type
    }
  }

  const handleChangePassword = () => {
    toast.info('Fitur ganti password akan segera tersedia')
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  // Check if settings have changes
  const hasProfileChanges = name !== (user?.name || '') || bio !== (user?.bio || '')
  
  const hasNotificationChanges = user?.settingsNotifications 
    ? JSON.stringify(notifications) !== JSON.stringify(user.settingsNotifications)
    : false
    
  const hasPrivacyChanges = user?.settingsPrivacy
    ? JSON.stringify(privacy) !== JSON.stringify(user.settingsPrivacy)
    : false

  const hasAppearanceChanges = theme !== (user?.settingsAppearance?.theme || 'system')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 animate-pulse mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Memuat pengaturan...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Header dengan Back to Home */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={handleBackToHome}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Beranda
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
            </div>
            <h1 className="text-xl font-bold">Pengaturan</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Akun
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifikasi
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              Privasi
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Globe className="h-4 w-4 mr-2" />
              Tampilan
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
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
                  <Input value={user?.email || ''} disabled />
                  <p className="text-xs text-muted-foreground">
                    Email tidak dapat diubah. Hubungi support jika perlu mengubah email.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Nama</Label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama kamu" 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input 
                    value={user?.username || ''} 
                    disabled
                    placeholder="Username"
                  />
                  <p className="text-xs text-muted-foreground">
                    Username tidak dapat diubah
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Ceritakan tentang dirimu..."
                    rows={3}
                  />
                </div>

                <div className="pt-4">
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{user?.level || 1}</div>
                      <div className="text-xs text-muted-foreground">Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{user?.coins || 0}</div>
                      <div className="text-xs text-muted-foreground">Koin</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{user?.streak || 0}</div>
                      <div className="text-xs text-muted-foreground">Streak</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={() => handleSaveSettings('profile')} 
                    disabled={saveLoading === 'profile' || !hasProfileChanges}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveLoading === 'profile' ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleCancelChanges('profile')}
                    disabled={!hasProfileChanges}
                  >
                    Batal
                  </Button>
                </div>
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
              <CardContent>
                <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                  <h3 className="font-semibold mb-2">Hapus Akun</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Menghapus akun akan menghapus semua data kamu secara permanen.
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={() => setDeleteModalOpen(true)}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus Akun Saya
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
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

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={() => handleSaveSettings('notifications')} 
                    disabled={saveLoading === 'notifications' || !hasNotificationChanges}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveLoading === 'notifications' ? 'Menyimpan...' : 'Simpan Preferensi'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleCancelChanges('notifications')}
                    disabled={!hasNotificationChanges}
                  >
                    Batal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
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

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={() => handleSaveSettings('privacy')} 
                    disabled={saveLoading === 'privacy' || !hasPrivacyChanges}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveLoading === 'privacy' ? 'Menyimpan...' : 'Simpan Pengaturan'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleCancelChanges('privacy')}
                    disabled={!hasPrivacyChanges}
                  >
                    Batal
                  </Button>
                </div>
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
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleChangePassword}
                >
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

          {/* Appearance Tab */}
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
                  <h3 className="font-semibold mb-2">
                    Tema Aktif: {theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Teks ini ditampilkan dengan tema yang dipilih.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleSaveSettings('appearance')}
                    disabled={saveLoading === 'appearance' || !hasAppearanceChanges}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveLoading === 'appearance' ? 'Menyimpan...' : 'Simpan Tema'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleCancelChanges('appearance')}
                    disabled={!hasAppearanceChanges}
                  >
                    Batal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Logout Button */}
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

      {/* Delete Account Modal */}
      <DeleteAccountModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        userHasPassword={!!user?.password}
      />
    </div>
  )
}
