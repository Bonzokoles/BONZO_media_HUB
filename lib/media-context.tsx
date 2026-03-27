"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverUrl: string
  audioUrl?: string
}

export interface Video {
  id: string
  title: string
  description: string
  duration: number
  thumbnailUrl: string
  videoUrl?: string
}

export interface Film {
  id: string
  title: string
  year: number
  genre: string[]
  rating: number
  posterUrl: string
  description: string
  director: string
}

export interface WebLink {
  id: string
  title: string
  url: string
  category: string
  favicon?: string
  description?: string
  createdAt: Date
}

type ActiveView = "music" | "video" | "films" | "links"

interface MediaContextType {
  activeView: ActiveView
  setActiveView: (view: ActiveView) => void
  currentTrack: Track | null
  setCurrentTrack: (track: Track | null) => void
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  currentVideo: Video | null
  setCurrentVideo: (video: Video | null) => void
  favorites: {
    tracks: string[]
    films: string[]
    links: string[]
  }
  toggleFavorite: (type: "tracks" | "films" | "links", id: string) => void
}

const MediaContext = createContext<MediaContextType | undefined>(undefined)

export function MediaProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<ActiveView>("music")
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [favorites, setFavorites] = useState<{
    tracks: string[]
    films: string[]
    links: string[]
  }>({
    tracks: [],
    films: [],
    links: [],
  })

  const toggleFavorite = useCallback((type: "tracks" | "films" | "links", id: string) => {
    setFavorites((prev) => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter((i) => i !== id)
        : [...prev[type], id],
    }))
  }, [])

  return (
    <MediaContext.Provider
      value={{
        activeView,
        setActiveView,
        currentTrack,
        setCurrentTrack,
        isPlaying,
        setIsPlaying,
        currentVideo,
        setCurrentVideo,
        favorites,
        toggleFavorite,
      }}
    >
      {children}
    </MediaContext.Provider>
  )
}

export function useMedia() {
  const context = useContext(MediaContext)
  if (!context) {
    throw new Error("useMedia must be used within a MediaProvider")
  }
  return context
}
