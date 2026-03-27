"use client"

import { MediaProvider, useMedia } from "@/lib/media-context"
import { SidebarNav } from "@/components/sidebar-nav"
import { MobileNav } from "@/components/mobile-nav"
import { MusicPlayer } from "@/components/music-player"
import { VideoPlayer } from "@/components/video-player"
import { FilmLibrary } from "@/components/film-library"
import { LinksManager } from "@/components/links-manager"
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
        </div>
      </main>
      <MobileNav />
    </div>
  )
}

export default function Home() {
  return (
    <MediaProvider>
      <MainContent />
    </MediaProvider>
  )
}
