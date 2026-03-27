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
  sourceService?: string   // "soundcloud" | "tidal" | "indieshuffle" | "musicatlas" | "local"
  sourceUrl?: string       // URL skąd pochodzi utwór
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

type ActiveView = "music" | "video" | "films" | "links" | "streams"

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
  // Globalna biblioteka lokalnych tracków (z plików + ze streamów)
  localTracks: Track[]
  addLocalTrack: (track: Track) => void
  addLocalTracks: (tracks: Track[]) => void
  removeLocalTrack: (id: string) => void
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
  const [localTracks, setLocalTracks] = useState<Track[]>([])

  const toggleFavorite = useCallback((type: "tracks" | "films" | "links", id: string) => {
    setFavorites((prev) => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter((i) => i !== id)
        : [...prev[type], id],
    }))
  }, [])

  const addLocalTrack = useCallback((track: Track) => {
    setLocalTracks((prev) => {
      // Unikaj duplikatów po id
      if (prev.find((t) => t.id === track.id)) return prev
      return [...prev, track]
    })
  }, [])

  const addLocalTracks = useCallback((tracks: Track[]) => {
    setLocalTracks((prev) => {
      const existingIds = new Set(prev.map((t) => t.id))
      const newTracks = tracks.filter((t) => !existingIds.has(t.id))
      return [...prev, ...newTracks]
    })
  }, [])

  const removeLocalTrack = useCallback((id: string) => {
    setLocalTracks((prev) => prev.filter((t) => t.id !== id))
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
        localTracks,
        addLocalTrack,
        addLocalTracks,
        removeLocalTrack,
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
