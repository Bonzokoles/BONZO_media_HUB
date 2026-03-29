"use client"

import dynamic from "next/dynamic"
import { MediaProvider, useMedia } from "@/lib/media-context"
import { SidebarNav } from "@/components/sidebar-nav"
import { MobileNav } from "@/components/mobile-nav"
import { MusicPlayer } from "@/components/music-player"
import { VideoPlayer } from "@/components/video-player"
import { FilmLibrary } from "@/components/film-library"
import { LinksManager } from "@/components/links-manager"
import { StreamsPanel } from "@/components/streams-panel"
import { MobileHeader } from "@/components/mobile-header"

function MainContent() {
  const { activeView } = useMedia()

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      <SidebarNav />
      <main className="flex-1 overflow-hidden lg:ml-64">
        <MobileHeader />
        <div className="h-[calc(100vh-64px)] lg:h-screen">
          {activeView === "music" && <MusicPlayer />}
          {activeView === "video" && <VideoPlayer />}
          {activeView === "films" && <FilmLibrary />}
          {activeView === "links" && <LinksManager />}
          {activeView === "streams" && <StreamsPanel />}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}

function App() {
  return (
    <MediaProvider>
      <MainContent />
    </MediaProvider>
  )
}

const ClientApp = dynamic(() => Promise.resolve({ default: App }), {
  ssr: false,
  loading: () => (
    <div style={{ backgroundColor: '#0a0a12', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4aa', fontFamily: 'monospace', fontSize: '14px', letterSpacing: '0.1em' }}>
      BONZO_media_HUB...
    </div>
  ),
})

export default function Home() {
  return <ClientApp />
}
