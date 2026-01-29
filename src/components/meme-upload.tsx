'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Upload, X, Image as ImageIcon, Loader2, Sparkles, Send } from 'lucide-react'

// Categories
const CATEGORIES = [
  'Funny', 'Relate', 'Nostalgia', 'Sad', 'Random', 'Sarcasm', 'Dark', 'Absurd', 'Cringe', 'Sus',
  'Gaming', 'Anime', 'Olahraga', 'Classic', 'Animal',
  'Sekolah', 'Pekerjaan', 'Kehidupan', 'Pertemanan', 'Menyentuh', 'High IQ',
  'Meme Daerah', 'Politik', 'Makanan', 'Komik', 'Berita', 'Music'
]

interface MemeUploadProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function MemeUpload({ onSuccess, onCancel }: MemeUploadProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Funny')
  const [caption, setCaption] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Format file tidak didukung', {
          description: 'Hanya JPEG, PNG, GIF, dan WebP yang diperbolehkan'
        })
        return
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast.error('Ukuran file terlalu besar', {
          description: 'Maksimal ukuran file adalah 10MB'
        })
        return
      }

      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (!imageFile) {
      toast.error('Gambar belum dipilih', {
        description: 'Silakan pilih gambar untuk diupload'
      })
      return
    }

    if (!title.trim()) {
      toast.error('Judul belum diisi', {
        description: 'Silakan beri judul untuk meme kamu'
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Upload image
      const formData = new FormData()
      formData.append('file', imageFile)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const uploadResult = await uploadResponse.json()

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Gagal mengupload gambar')
      }

      setUploadProgress(50)

      // Create meme
      const session = await fetch('/api/auth/session').then(res => res.json())
      
      const memeResponse = await fetch('/api/memes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          imageUrl: uploadResult.data.url,
          caption,
          category,
          authorId: session.user?.id
        })
      })

      const memeResult = await memeResponse.json()

      if (memeResult.success) {
        setUploadProgress(100)
        toast.success('Meme berhasil dibuat!', {
          description: 'Meme kamu sekarang terlihat oleh semua orang'
        })
        
        // Reset form
        setTitle('')
        setCaption('')
        setCategory('Funny')
        setImageFile(null)
        setImagePreview('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        onSuccess?.()
      } else {
        throw new Error(memeResult.error || 'Gagal membuat meme')
      }
    } catch (error) {
      console.error('Error uploading meme:', error)
      toast.error('Gagal membuat meme', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan'
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Buat Meme Baru
        </CardTitle>
        <CardDescription>
          Upload meme dari galeri dan bagikan ke komunitas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Upload Gambar</Label>
          {!imagePreview ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm font-medium">Klik atau drag gambar ke sini</p>
              <p className="text-xs text-muted-foreground mt-2">
                JPEG, PNG, GIF, WebP (Maksimal 10MB)
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Pilih Gambar
              </Button>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label>Judul *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Beri judul meme-mu"
            disabled={uploading}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Kategori</Label>
          <ScrollArea className="h-32 w-full border rounded-md p-2">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat}
                  variant={category === cat ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => !uploading && setCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <Label>Caption (Opsional)</Label>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Tambahkan caption..."
            rows={3}
            disabled={uploading}
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Mengupload...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleUpload}
            disabled={uploading || !imageFile || !title.trim()}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mengupload...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Kirim Meme
              </>
            )}
          </Button>
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={uploading}
            >
              Batal
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}