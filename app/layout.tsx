import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ServiceWorkerRegister } from '@/components/service-worker-register'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: 'BONZO_media_HUB',
  description: 'A comprehensive multimedia app with music, video, films, and website management',
  generator: 'v0.app',
  manifest: '/manifest.json',
  themeColor: '#00d4aa',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BONZO_HUB',
  },
  icons: {
    icon: [
      {
        url: '/icons/icon-512x512.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
    apple: '/icons/icon-512x512.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${jetbrainsMono.variable} font-mono antialiased`}>
        <ServiceWorkerRegister />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
