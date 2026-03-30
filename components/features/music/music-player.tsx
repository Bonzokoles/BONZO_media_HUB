"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useMedia, type Track } from "@/lib/media-context"
import { sampleTracks } from "@/lib/sample-data"
import { MusicLibraryAI } from "./music-library-ai"
import { AudioVisualizer } from "./audio-visualizer"
import { VisualizerSettings, defaultVisualizerConfig, type VisualizerConfig } from "./visualizer-settings"
import { cn } from "@/lib/utils"
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Search,
  FolderOpen,
  Upload,
  X,
  Music,
  ListPlus,
  List,
  Plus,
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
  Brain,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type VisualizerType = "matrix" | "spectrum" | "oscilloscope" | "particles" | "waveform3d" | "frequency" | "circular" | "terrain"
type RepeatMode = "none" | "all" | "one"

interface Playlist {
  id: string
  name: string
  tracks: Track[]
  createdAt: Date
}

interface BufferState {
  trackId: string
  progress: number
  loaded: boolean
}

export function MusicPlayer() {
  const { favorites, toggleFavorite, localTracks, addLocalTracks, removeLocalTrack: removeLocalTrackFromCtx } = useMedia()
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [volume, setVolume] = useState<number>(75)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [visualizerType, setVisualizerType] = useState<VisualizerType>("spectrum")
  const [visualizerConfig, setVisualizerConfig] = useState<VisualizerConfig>({ ...defaultVisualizerConfig })
  const [searchQuery, setSearchQuery] = useState("")
  const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null)
  
  // Playlist & Queue state
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const saved = localStorage.getItem("bonzo-playlists")
      if (!saved) return []
      const parsed = JSON.parse(saved) as Array<Omit<Playlist, "createdAt"> & { createdAt: string }>
      return parsed.map(pl => ({ ...pl, createdAt: new Date(pl.createdAt) }))
    } catch { return [] }
  })
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null)
  const [queue, setQueue] = useState<Track[]>([])
  const [queueIndex, setQueueIndex] = useState<number>(0)
  const [showQueue, setShowQueue] = useState(false)
  const [showPlaylists, setShowPlaylists] = useState(false)
  const [showAILibrary, setShowAILibrary] = useState(false)
  const [isFullVisualizer, setIsFullVisualizer] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [shuffleEnabled, setShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("none")
  
  // Buffer state
  const [bufferStates, setBufferStates] = useState<Map<string, BufferState>>(new Map())
  const [isBuffering, setIsBuffering] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const preloadAudioRef = useRef<HTMLAudioElement | null>(null)
  const preloadedTracksRef = useRef<Set<string>>(new Set())

  const allTracks = [...sampleTracks, ...localTracks]

  const ensureTrackSelected = useCallback(() => {
    if (currentTrack) return currentTrack
    const fallbackTrack = queue[queueIndex] || sampleTracks[0]
    setCurrentTrack(fallbackTrack)
    return fallbackTrack
  }, [currentTrack, queue, queueIndex, setCurrentTrack])

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Buffer/preload next track
  const preloadTrack = useCallback((track: Track) => {
    if (!track.audioUrl || preloadedTracksRef.current.has(track.id)) return
    preloadedTracksRef.current.add(track.id)

    if (!preloadAudioRef.current) {
      preloadAudioRef.current = new Audio()
    }

    const audio = preloadAudioRef.current
    audio.preload = "auto"
    audio.src = track.audioUrl

    setBufferStates(prev => {
      const newMap = new Map(prev)
      newMap.set(track.id, { trackId: track.id, progress: 0, loaded: false })
      return newMap
    })
    
    audio.onprogress = () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1)
        const duration = audio.duration || 1
        const progress = (bufferedEnd / duration) * 100
        
        setBufferStates(prev => {
          const newMap = new Map(prev)
          newMap.set(track.id, { trackId: track.id, progress, loaded: progress >= 100 })
          return newMap
        })
      }
    }
    
    audio.oncanplaythrough = () => {
      setBufferStates(prev => {
        const newMap = new Map(prev)
        newMap.set(track.id, { trackId: track.id, progress: 100, loaded: true })
        return newMap
      })
    }
    
    audio.load()
  }, [])

  // Preload next track in queue
  useEffect(() => {
    if (queue.length > 0 && queueIndex < queue.length - 1) {
      const nextTrack = queue[queueIndex + 1]
      preloadTrack(nextTrack)
    }
  }, [queueIndex, queue, preloadTrack])

  // Persist playlists — strip blob URLs (local files can't survive reload)
  useEffect(() => {
    try {
      const serializable = playlists.map(pl => ({
        ...pl,
        tracks: pl.tracks.map(t => ({
          ...t,
          audioUrl: t.audioUrl?.startsWith("blob:") ? undefined : t.audioUrl,
        })),
      }))
      localStorage.setItem("bonzo-playlists", JSON.stringify(serializable))
    } catch {}
  }, [playlists])

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
    if (!queue.find((queuedTrack) => queuedTrack.id === track.id)) {
      setQueue((prev) => [...prev, track])
      setQueueIndex(queue.length)
    } else {
      setQueueIndex(queue.findIndex((queuedTrack) => queuedTrack.id === track.id))
    }
  }

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track])
  }

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index))
    if (index < queueIndex) {
      setQueueIndex(prev => prev - 1)
    }
  }

  const moveInQueue = (from: number, to: number) => {
    setQueue(prev => {
      const newQueue = [...prev]
      const [item] = newQueue.splice(from, 1)
      newQueue.splice(to, 0, item)
      return newQueue
    })
    
    // Update queue index if needed
    if (from === queueIndex) {
      setQueueIndex(to)
    } else if (from < queueIndex && to >= queueIndex) {
      setQueueIndex(prev => prev - 1)
    } else if (from > queueIndex && to <= queueIndex) {
      setQueueIndex(prev => prev + 1)
    }
  }

  const playFromQueue = (index: number) => {
    if (queue[index]) {
      setQueueIndex(index)
      setCurrentTrack(queue[index])
      setIsPlaying(true)
    }
  }

  const playNext = () => {
    if (queue.length === 0) return
    
    if (repeatMode === "one") {
      const audio = audioRef.current
      if (audio) {
        audio.currentTime = 0
        audio.play()
      }
      return
    }
    
    let nextIndex = queueIndex + 1
    
    if (shuffleEnabled) {
      nextIndex = Math.floor(Math.random() * queue.length)
    }
    
    if (nextIndex >= queue.length) {
      if (repeatMode === "all") {
        nextIndex = 0
      } else {
        setIsPlaying(false)
        return
      }
    }
    
    playFromQueue(nextIndex)
  }

  const playPrevious = () => {
    if (queue.length === 0) return
    
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    
    let prevIndex = queueIndex - 1
    if (prevIndex < 0) {
      prevIndex = repeatMode === "all" ? queue.length - 1 : 0
    }
    
    playFromQueue(prevIndex)
  }

  const stopPlayback = () => {
    setIsPlaying(false)
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = 0
      setProgress(0)
    }
  }

  // Playlist functions
  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return
    
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name: newPlaylistName.trim(),
      tracks: [],
      createdAt: new Date()
    }
    
    setPlaylists(prev => [...prev, newPlaylist])
    setNewPlaylistName("")
  }

  const addToPlaylist = (playlistId: string, track: Track) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId && !pl.tracks.find(t => t.id === track.id)) {
        return { ...pl, tracks: [...pl.tracks, track] }
      }
      return pl
    }))
  }

  const removeFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, tracks: pl.tracks.filter(t => t.id !== trackId) }
      }
      return pl
    }))
  }

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(pl => pl.id !== playlistId))
    if (activePlaylist?.id === playlistId) {
      setActivePlaylist(null)
    }
  }

  const loadPlaylistToQueue = (playlist: Playlist) => {
    setQueue(playlist.tracks)
    setQueueIndex(0)
    setActivePlaylist(playlist)
    if (playlist.tracks.length > 0) {
      setCurrentTrack(playlist.tracks[0])
    }
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return

    const newTracks = await Promise.all(
      Array.from(files)
        .filter((file) => file.type.startsWith("audio/"))
        .map(
          (file, index) =>
            new Promise<Track>((resolve) => {
              const url = URL.createObjectURL(file)
              const probe = document.createElement("audio")
              probe.preload = "metadata"
              probe.src = url
              probe.onloadedmetadata = () => {
                const detectedDuration = Number.isFinite(probe.duration) ? Math.round(probe.duration) : 0
                resolve({
                  id: `local-${Date.now()}-${index}`,
                  title: file.name.replace(/\.[^/.]+$/, ""),
                  artist: "Local File",
                  album: "Local Library",
                  duration: detectedDuration,
                  coverUrl: "",
                  audioUrl: url,
                })
              }
              probe.onerror = () => {
                resolve({
                  id: `local-${Date.now()}-${index}`,
                  title: file.name.replace(/\.[^/.]+$/, ""),
                  artist: "Local File",
                  album: "Local Library",
                  duration: 0,
                  coverUrl: "",
                  audioUrl: url,
                })
              }
            })
        )
    )

    addLocalTracks(newTracks)
  }

  useEffect(() => {
    const onLocalFiles = (event: Event) => {
      const custom = event as CustomEvent<{ kind: "music" | "video"; files: File[] }>
      if (custom.detail?.kind !== "music") return

      const selected = custom.detail.files || []
      if (!selected.length) return

      const dataTransfer = new DataTransfer()
      selected.forEach((file) => dataTransfer.items.add(file))
      handleFileSelect(dataTransfer.files)
    }

    window.addEventListener("bonzo-local-files", onLocalFiles)
    return () => window.removeEventListener("bonzo-local-files", onLocalFiles)
  }, [addLocalTracks])

  const removeLocalTrack = (trackId: string) => {
    const track = localTracks.find((t) => t.id === trackId)
    if (track?.audioUrl) {
      URL.revokeObjectURL(track.audioUrl)
    }
    removeLocalTrackFromCtx(trackId)
    if (currentTrack?.id === trackId) {
      setCurrentTrack(null)
      setIsPlaying(false)
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      setProgress(audio.currentTime)
      setDuration(audio.duration || 0)
    }

    const handleEnded = () => {
      playNext()
    }

    const handleWaiting = () => {
      setIsBuffering(true)
    }

    const handlePlaying = () => {
      setIsBuffering(false)
    }

    audio.addEventListener("timeupdate", updateProgress)
    audio.addEventListener("loadedmetadata", updateProgress)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("waiting", handleWaiting)
    audio.addEventListener("playing", handlePlaying)

    return () => {
      audio.removeEventListener("timeupdate", updateProgress)
      audio.removeEventListener("loadedmetadata", updateProgress)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("waiting", handleWaiting)
      audio.removeEventListener("playing", handlePlaying)
    }
  }, [queue, queueIndex, repeatMode, shuffleEnabled])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack?.audioUrl) return

    audio.src = currentTrack.audioUrl
    audio.volume = isMuted ? 0 : volume / 100
    
    if (isPlaying) {
      audio.play().catch(() => {})
    }
  }, [currentTrack])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = isMuted ? 0 : volume / 100
  }, [volume, isMuted])

  useEffect(() => {
    if (!currentTrack && sampleTracks[0]) {
      setCurrentTrack(sampleTracks[0])
    }

    if (queue.length === 0) {
      setQueue(sampleTracks)
      setQueueIndex(0)
    }
  }, [currentTrack, queue.length, setCurrentTrack])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullVisualizer(false)
      }
    }

    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  const togglePlayback = () => {
    ensureTrackSelected()
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (audio && duration) {
      audio.currentTime = value[0]
      setProgress(value[0])
    }
  }

  const cycleRepeatMode = () => {
    setRepeatMode(prev => {
      if (prev === "none") return "all"
      if (prev === "all") return "one"
      return "none"
    })
  }

  const filteredTracks = allTracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeTrack = currentTrack || sampleTracks[0]

  const visualizerOptions: { type: VisualizerType; label: string }[] = [
    { type: "spectrum", label: "SPECTRUM" },
    { type: "matrix", label: "MATRIX" },
    { type: "oscilloscope", label: "SCOPE" },
    { type: "particles", label: "PARTICLES" },
    { type: "waveform3d", label: "3D_WAVE" },
    { type: "frequency", label: "RADIAL" },
    { type: "circular", label: "CIRCULAR" },
    { type: "terrain", label: "TERRAIN" },
  ]

  return (
    <>
    <div className="flex h-full flex-col font-mono">
      <audio ref={audioRef} preload="auto" />
      
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      <input
        ref={folderInputRef}
        type="file"
        accept="audio/*"
        multiple
        // @ts-ignore
        webkitdirectory=""
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-widest text-primary">
            {">"} AUDIO_PLAYER
            <span className="ml-2 inline-flex items-center gap-1 align-middle rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-primary/80">
              ENGINE: WEB_AUDIO_API
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQueue(!showQueue)}
              className={cn("gap-2 text-xs uppercase tracking-wider", showQueue && "bg-primary text-primary-foreground")}
            >
              <List className="h-3 w-3" />
              QUEUE [{queue.length}]
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPlaylists(!showPlaylists)}
              className={cn("gap-2 text-xs uppercase tracking-wider", showPlaylists && "bg-primary text-primary-foreground")}
            >
              <ListPlus className="h-3 w-3" />
              PLAYLISTS
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2 text-xs uppercase tracking-wider"
            >
              <Upload className="h-3 w-3" />
              ADD_FILES
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => folderInputRef.current?.click()}
              className="gap-2 text-xs uppercase tracking-wider"
            >
              <FolderOpen className="h-3 w-3" />
              ADD_FOLDER
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAILibrary(true)}
              className={cn("gap-2 text-xs uppercase tracking-wider", showAILibrary && "border-primary bg-primary/10 text-primary")}
            >
              <Brain className="h-3 w-3" />
              AI_LIBRARY
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullVisualizer((prev) => !prev)}
              className={cn(
                "gap-2 text-xs uppercase tracking-wider",
                isFullVisualizer && "border-primary bg-primary/10 text-primary"
              )}
            >
              {isFullVisualizer ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              {isFullVisualizer ? "EXIT_FULL" : "FULL_VIS"}
            </Button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex-1 overflow-hidden",
          isFullVisualizer ? "block" : "lg:grid lg:grid-cols-2 lg:gap-0"
        )}
      >
        {/* Now Playing / Visualizer */}
        <div
          className={cn(
            "flex min-h-0 flex-col border-b border-border p-4 lg:border-b-0 lg:p-6",
            !isFullVisualizer && "lg:border-r",
            isFullVisualizer && "h-full"
          )}
        >
          <div className="relative flex-1 overflow-hidden border border-border bg-card min-h-[420px]">
            <div className="absolute inset-0">
              <AudioVisualizer 
                isPlaying={isPlaying} 
                variant={visualizerType}
                audioAnalyser={audioAnalyser}
                config={visualizerConfig}
              />
            </div>
            
            {/* TOP OVERLAY: Track Info + Controls */}
            <div className="absolute inset-x-0 top-0 bg-linear-to-b from-background/90 via-background/70 to-transparent p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs text-primary/70 mb-1">[NOW_PLAYING]</div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground truncate">
                    {activeTrack.title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">{activeTrack.artist}</p>
                  {isBuffering && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      BUFFERING...
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {/* Arrows + Stop + Play */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 border border-border bg-background/50 hover:bg-background/80"
                      onClick={playPrevious}
                      title="Previous"
                    >
                      <SkipBack className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 border border-border bg-background/50 hover:bg-background/80"
                      onClick={stopPlayback}
                      title="Stop"
                    >
                      <Square className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 border border-primary bg-primary/20 hover:bg-primary/40"
                      onClick={togglePlayback}
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 border border-border bg-background/50 hover:bg-background/80"
                      onClick={playNext}
                      title="Next"
                    >
                      <SkipForward className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Config + Volume */}
                  <div className="flex items-center gap-2 rounded border border-border bg-background/60 px-2 py-1">
                    <VisualizerSettings
                      config={visualizerConfig}
                      onChange={setVisualizerConfig}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setIsMuted(!isMuted)}
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-3.5 w-3.5" />
                      ) : (
                        <Volume2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : (typeof volume === 'number' && !isNaN(volume) ? volume : 75)]}
                      onValueChange={(value) => {
                        setVolume(value[0])
                        setIsMuted(false)
                      }}
                      min={0}
                      max={100}
                      step={1}
                      className="w-28"
                    />
                    <span className="w-10 text-right font-mono text-[10px] text-muted-foreground">
                      [{isMuted ? 0 : volume}%]
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Terminal overlay - bottom left */}
            <div className="absolute bottom-3 left-3 text-xs text-primary/70">
              <div>[MODE] {visualizerType.toUpperCase()}</div>
              <div>[STATUS] {isPlaying ? "PLAYING" : "PAUSED"}</div>
              <div>[COLOR] {visualizerConfig.colorScheme.toUpperCase()}</div>
            </div>
            
            {/* Bottom Time Bar */}
            <div className="absolute inset-x-0 bottom-0 border-t border-border/60 bg-background/80 p-3 backdrop-blur-sm">
              <Slider
                value={[typeof progress === 'number' && !isNaN(progress) ? progress : 0]}
                onValueChange={handleSeek}
                min={0}
                max={Math.max(duration, 1)}
                step={0.1}
                className="w-full"
              />
              <div className="mt-1.5 flex justify-between font-mono text-xs text-muted-foreground">
                <span>[{formatTime(progress)}]</span>
                <span>[{formatTime(duration || activeTrack.duration)}]</span>
              </div>
            </div>
          </div>

          {/* Visualizer Type Selector */}
          <div className="mt-4 flex flex-wrap justify-center gap-1">
            {visualizerOptions.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => setVisualizerType(type)}
                className={cn(
                  "border px-2 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors",
                  visualizerType === type
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary text-secondary-foreground hover:border-primary/50"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Secondary controls */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("text-muted-foreground hover:text-foreground", shuffleEnabled && "text-primary")}
              onClick={() => setShuffle(!shuffleEnabled)}
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground" onClick={playPrevious}>
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground" onClick={playNext}>
              <SkipForward className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("text-muted-foreground hover:text-foreground", repeatMode !== "none" && "text-primary")}
              onClick={cycleRepeatMode}
            >
              {repeatMode === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Right Panel: Track List / Queue / Playlists */}
        <div className={cn("flex flex-col overflow-hidden", isFullVisualizer && "hidden")}>
          {/* Queue Panel */}
          {showQueue && (
            <div className="border-b border-border">
              <div className="border-b border-border bg-secondary/50 px-4 py-2">
                <span className="text-xs uppercase tracking-wider text-primary">
                  {">"} PLAY_QUEUE [{queue.length}]
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {queue.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    [QUEUE_EMPTY] Add tracks to queue
                  </div>
                ) : (
                  queue.map((track, index) => (
                    <div
                      key={`queue-${track.id}-${index}`}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 text-xs hover:bg-accent/30",
                        index === queueIndex && "bg-accent/50"
                      )}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 cursor-grab"
                      >
                        <GripVertical className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                      <button 
                        className="flex-1 text-left truncate hover:text-primary"
                        onClick={() => playFromQueue(index)}
                      >
                        {track.title}
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveInQueue(index, Math.max(0, index - 1))}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveInQueue(index, Math.min(queue.length - 1, index + 1))}
                        disabled={index === queue.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => removeFromQueue(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Playlists Panel */}
          {showPlaylists && (
            <div className="border-b border-border">
              <div className="border-b border-border bg-secondary/50 px-4 py-2">
                <span className="text-xs uppercase tracking-wider text-primary">
                  {">"} PLAYLISTS [{playlists.length}]
                </span>
              </div>
              <div className="p-4">
                <div className="mb-4 flex gap-2">
                  <Input
                    placeholder="> new_playlist_name..."
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="flex-1 text-xs"
                    onKeyDown={(e) => e.key === "Enter" && createPlaylist()}
                  />
                  <Button 
                    size="sm" 
                    onClick={createPlaylist}
                    className="text-xs uppercase tracking-wider"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    CREATE
                  </Button>
                </div>
                <div className="max-h-32 space-y-1 overflow-y-auto">
                  {playlists.map((playlist) => (
                    <div 
                      key={playlist.id}
                      className={cn(
                        "flex items-center justify-between p-2 hover:bg-accent/30",
                        activePlaylist?.id === playlist.id && "bg-accent/50"
                      )}
                    >
                      <button
                        className="flex-1 text-left text-xs uppercase tracking-wider hover:text-primary"
                        onClick={() => loadPlaylistToQueue(playlist)}
                      >
                        {playlist.name} [{playlist.tracks.length}]
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => deletePlaylist(playlist.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="border-b border-border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="> search_tracks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-mono text-sm"
              />
            </div>
          </div>
          
          {/* Track List */}
          <div className="flex-1 overflow-y-auto">
            {localTracks.length > 0 && (
              <div className="border-b border-border px-4 py-2">
                <span className="text-xs uppercase tracking-wider text-primary">
                  {">"} LOCAL_LIBRARY [{localTracks.length}]
                </span>
              </div>
            )}
            
            <div className="divide-y divide-border">
              {filteredTracks.map((track, index) => (
                <div
                  key={track.id}
                  className={cn(
                    "group flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-accent/50",
                    activeTrack.id === track.id && "bg-accent"
                  )}
                >
                  <span className="w-8 font-mono text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <button
                    onClick={() => handleTrackSelect(track)}
                    className="relative flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-secondary"
                  >
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="h-full w-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <Music className="h-5 w-5 text-muted-foreground" />
                    )}
                    {activeTrack.id === track.id && isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="h-4 w-0.5 animate-pulse bg-primary"
                              style={{ animationDelay: `${i * 150}ms` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                  <button 
                    onClick={() => handleTrackSelect(track)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-medium uppercase tracking-wide text-foreground">
                      {track.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                  </button>
                  <span className="font-mono text-xs text-muted-foreground">
                    [{formatTime(track.duration)}]
                  </span>
                  
                  {/* Track Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => addToQueue(track)}
                      title="Add to queue"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    
                    {playlists.length > 0 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Add to playlist"
                          >
                            <ListPlus className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
<DialogContent className="font-mono">
  <DialogHeader>
  <DialogTitle className="text-xs uppercase tracking-widest">ADD_TO_PLAYLIST</DialogTitle>
  <DialogDescription className="text-xs text-muted-foreground">
    Select a playlist to add the track
  </DialogDescription>
  </DialogHeader>
  <div className="space-y-2">
  {playlists.map((pl) => (
                              <Button
                                key={pl.id}
                                variant="outline"
                                className="w-full justify-start text-xs uppercase tracking-wider"
                                onClick={() => addToPlaylist(pl.id, track)}
                              >
                                {pl.name}
                              </Button>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => toggleFavorite("tracks", track.id)}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        favorites.tracks.includes(track.id)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground"
                      )}
                    />
                  </Button>
                  {track.id.startsWith("local-") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeLocalTrack(track.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    <MusicLibraryAI
      open={showAILibrary}
      onClose={() => setShowAILibrary(false)}
      tracks={allTracks}
      currentTrack={currentTrack}
      playlists={playlists}
      onPlaylistCreate={(name, tracks) => {
        setPlaylists(prev => [...prev, {
          id: `ai-${Date.now()}`,
          name,
          tracks,
          createdAt: new Date(),
        }])
      }}
      onTrackCoverUpdate={(trackId, coverUrl) => {
        const track = localTracks.find(t => t.id === trackId)
        if (track) {
          removeLocalTrackFromCtx(trackId)
          addLocalTracks([{ ...track, coverUrl }])
        }
      }}
    />
    </>
  )
}
