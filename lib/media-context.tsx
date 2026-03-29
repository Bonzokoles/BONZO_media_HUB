"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

export interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverUrl: string
  audioUrl?: string
  sourceService?: string
  sourceUrl?: string
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
  favorites: {
    tracks: string[]
    films: string[]
    links: string[]
  }
  toggleFavorite: (type: "tracks" | "films" | "links", id: string) => void
  localTracks: Track[]
  addLocalTrack: (track: Track) => void
  addLocalTracks: (tracks: Track[]) => void
  removeLocalTrack: (id: string) => void
}

const MediaContext = createContext<MediaContextType | undefined>(undefined)

export function MediaProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<ActiveView>("music")
  const [favorites, setFavorites] = useState<{
    tracks: string[]
    films: string[]
    links: string[]
  }>(() => {
    if (typeof window === "undefined") return { tracks: [], films: [], links: [] }
    try {
      const saved = localStorage.getItem("bonzo-favorites")
      return saved ? JSON.parse(saved) : { tracks: [], films: [], links: [] }
    } catch { return { tracks: [], films: [], links: [] } }
  })
  const [localTracks, setLocalTracks] = useState<Track[]>([])

  useEffect(() => {
    try { localStorage.setItem("bonzo-favorites", JSON.stringify(favorites)) } catch {}
  }, [favorites])

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
