'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Loader2, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { signOut } from 'next-auth/react'

interface DeleteAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userHasPassword: boolean
}

export function DeleteAccountModal({ 
  open, 
  onOpenChange,
  userHasPassword 
}: DeleteAccountModalProps) {
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'warning' | 'confirm' | 'verify'>('warning')

  const handleDeleteAccount = async () => {
    if (userHasPassword && step === 'warning') {
      setStep('verify')
      return
    }

    if (!userHasPassword && step === 'warning') {
      setStep('confirm')
      return
    }

    if (step === 'verify' && !password) {
      toast.error('Password harus diisi')
      return
    }

    if (step === 'confirm' && confirmText !== 'DELETE') {
      toast.error('Harap ketik DELETE untuk konfirmasi')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: userHasPassword ? password : undefined }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Akun berhasil dihapus')
        
        // Redirect ke halaman utama
        setTimeout(() => {
          signOut({ callbackUrl: '/' })
        }, 1500)
        
        onOpenChange(false)
      } else {
        toast.error(data.error || 'Gagal menghapus akun')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Terjadi kesalahan saat menghapus akun')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setStep('warning')
    setPassword('')
    setConfirmText('')
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            {step === 'warning' && <AlertTriangle className="h-5 w-5" />}
            {step === 'verify' && <Shield className="h-5 w-5" />}
            {step === 'confirm' && <AlertTriangle className="h-5 w-5" />}
            <AlertDialogTitle>
              {step === 'warning' && 'Hapus Akun?'}
              {step === 'verify' && 'Verifikasi Password'}
              {step === 'confirm' && 'Konfirmasi Penghapusan'}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {step === 'warning' && (
              <div className="space-y-3">
                <p>
                  Apakah Anda yakin ingin menghapus akun Anda? Tindakan ini:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Menghapus semua meme, komentar, dan data Anda</li>
                  <li>Menghapus semua statistik dan pencapaian</li>
                  <li>Tidak dapat dibatalkan atau dipulihkan</li>
                  <li>Menghapus semua data pribadi Anda dari sistem</li>
                </ul>
                <p className="font-semibold pt-2">
                  Data yang dihapus tidak dapat dikembalikan!
                </p>
              </div>
            )}

            {step === 'verify' && (
              <div className="space-y-3">
                <p>
                  Untuk melanjutkan penghapusan akun, harap masukkan password Anda:
                </p>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                  />
                </div>
              </div>
            )}

            {step === 'confirm' && (
              <div className="space-y-3">
                <p>
                  Untuk memastikan ini bukan kesalahan, ketik{' '}
                  <span className="font-bold text-destructive">DELETE</span>{' '}
                  pada kolom di bawah:
                </p>
                <div className="space-y-2">
                  <Label htmlFor="confirm">
                    Ketik <span className="font-bold">DELETE</span> untuk konfirmasi
                  </Label>
                  <Input
                    id="confirm"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                    placeholder="DELETE"
                    className="font-mono uppercase"
                  />
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  Setelah Anda mengetik DELETE dan klik Hapus, akun Anda akan segera dihapus.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={handleCancel}
            disabled={loading}
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={
              loading || 
              (step === 'verify' && !password) ||
              (step === 'confirm' && confirmText !== 'DELETE')
            }
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                {step === 'warning' ? 'Lanjutkan' : 'Hapus Akun Saya'}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
