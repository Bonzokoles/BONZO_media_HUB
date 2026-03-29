import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ServiceWorkerRegister } from '@/components/service-worker-register'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono"
});

export const viewport: Viewport = {
  themeColor: '#00d4aa',
}

export const metadata: Metadata = {
  title: 'BONZO_media_HUB',
  description: 'A comprehensive multimedia app with music, video, films, and website management',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BONZO_HUB',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-152x152.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning style={{ backgroundColor: '#0a0a12', colorScheme: 'dark' }}>
      <body suppressHydrationWarning className={`${jetbrainsMono.variable} font-mono antialiased`} style={{ backgroundColor: '#0a0a12' }}>
        <ServiceWorkerRegister />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
