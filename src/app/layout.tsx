import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MemeVerse - Komunitas Meme Terbesar",
  description: "Platform media sosial berbasis meme terbesar di Indonesia. Buat, bagikan, dan nikmati konten meme seru dengan komunitas!",
  keywords: ["MemeVerse", "Meme", "Indonesia", "Konten Lucu", "Social Media", "Komunitas Meme"],
  authors: [{ name: "MemeVerse Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "MemeVerse - Komunitas Meme Terbesar",
    description: "Platform media sosial berbasis meme terbesar di Indonesia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MemeVerse - Komunitas Meme Terbesar",
    description: "Platform media sosial berbasis meme terbesar di Indonesia",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
