import Link from 'next/link'

export function Footer() {
  return (
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
              <li><Link href="/" className="hover:text-foreground">Beranda</Link></li>
              <li><Link href="/leaderboard" className="hover:text-foreground">Peringkat</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link href="/bookmarks" className="hover:text-foreground">Bookmark</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Bantuan</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">FAQ</Link></li>
              <li><Link href="#" className="hover:text-foreground">Kontak</Link></li>
              <li><Link href="#" className="hover:text-foreground">Lapor Bug</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Syarat & Ketentuan</Link></li>
              <li><Link href="#" className="hover:text-foreground">Kebijakan Privasi</Link></li>
              <li><Link href="#" className="hover:text-foreground">Kebijakan Koin</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2024 MemeVerse. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}
