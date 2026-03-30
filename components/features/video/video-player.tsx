"use client"

import { useEffect, useRef, useState } from "react"
import ReactPlayer from "react-player"
import { sampleVideos } from "@/lib/sample-data"
import type { Video } from "@/lib/media-context"
import { cn } from "@/lib/utils"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  SkipBack,
  SkipForward,
  Settings,
  Subtitles,
  PictureInPicture,
  Upload,
  FolderOpen,
  Film,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { VideoEngineSettings } from "@/components/features/video/video-engine-settings"

export function VideoPlayer() {
  const [currentVideo, setCurrentVideo] = useState<Video>(sampleVideos[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(sampleVideos[0].duration)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [localVideos, setLocalVideos] = useState<Video[]>([])
  const [isBuffering, setIsBuffering] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const playerRef = useRef<HTMLVideoElement>(null)
  const playerWrapperRef = useRef<HTMLDivElement>(null)

  const allVideos = [...sampleVideos, ...localVideos]

  const formatTime = (seconds: number) => {
    if (!seconds || Number.isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const currentIndex = allVideos.findIndex((video) => video.id === currentVideo.id)

  const selectVideo = (video: Video, shouldAutoplay = false) => {
    setCurrentVideo(video)
    setIsPlaying(shouldAutoplay)
    setProgress(0)
    setDuration(video.duration || 0)
    setShowControls(true)
  }

  const playNext = () => {
    if (allVideos.length === 0) return
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % allVideos.length : 0
    selectVideo(allVideos[nextIndex], true)
  }

  const playPrevious = () => {
    const video = playerRef.current
    if (video && video.currentTime > 3) {
      video.currentTime = 0
      setProgress(0)
      return
    }

    if (allVideos.length === 0) return
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : allVideos.length - 1
    selectVideo(allVideos[prevIndex], true)
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return

    const newVideos = await Promise.all(
      Array.from(files)
        .filter((file) => file.type.startsWith("video/"))
        .map(
          (file, index) =>
            new Promise<Video>((resolve) => {
              const url = URL.createObjectURL(file)
              const probe = document.createElement("video")
              probe.preload = "metadata"
              probe.src = url
              probe.onloadedmetadata = () => {
                const detectedDuration = Number.isFinite(probe.duration) ? Math.round(probe.duration) : 0
                resolve({
                  id: `local-${Date.now()}-${index}`,
                  title: file.name.replace(/\.[^/.]+$/, ""),
                  description: "Local video file",
                  duration: detectedDuration,
                  thumbnailUrl: "",
                  videoUrl: url,
                })
              }
              probe.onerror = () => {
                resolve({
                  id: `local-${Date.now()}-${index}`,
                  title: file.name.replace(/\.[^/.]+$/, ""),
                  description: "Local video file",
                  duration: 0,
                  thumbnailUrl: "",
                  videoUrl: url,
                })
              }
            })
        )
    )
    
    setLocalVideos(prev => [...prev, ...newVideos])

    if (!currentVideo.videoUrl && newVideos[0]) {
      selectVideo(newVideos[0])
    }
  }

  useEffect(() => {
    const onLocalFiles = (event: Event) => {
      const custom = event as CustomEvent<{ kind: "music" | "video"; files: File[] }>
      if (custom.detail?.kind !== "video") return

      const selected = custom.detail.files || []
      if (!selected.length) return

      const dataTransfer = new DataTransfer()
      selected.forEach((file) => dataTransfer.items.add(file))
      handleFileSelect(dataTransfer.files)
    }

    window.addEventListener("bonzo-local-files", onLocalFiles)
    return () => window.removeEventListener("bonzo-local-files", onLocalFiles)
  }, [currentVideo.videoUrl])

  const removeLocalVideo = (videoId: string) => {
    const video = localVideos.find(v => v.id === videoId)
    if (video?.videoUrl) {
      URL.revokeObjectURL(video.videoUrl)
    }
    setLocalVideos(prev => prev.filter(v => v.id !== videoId))
    if (currentVideo?.id === videoId) {
      selectVideo(sampleVideos[0])
    }
  }

  // ─── ReactPlayer obsługuje play/pause, volume, time tracking przez props/callbacks ───

  const handleSeek = (value: number[]) => {
    if (playerRef.current) {
      playerRef.current.currentTime = value[0]
    }
    setProgress(value[0])
  }

  const togglePictureInPicture = async () => {
    const videoEl = playerRef.current
    if (!videoEl || !(document as Document & { pictureInPictureEnabled?: boolean }).pictureInPictureEnabled) return

    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
      return
    }

    await videoEl.requestPictureInPicture?.()
  }

  const toggleFullscreen = async () => {
    const wrapper = playerWrapperRef.current
    if (!wrapper) return

    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }

    await wrapper.requestFullscreen()
  }

  return (
    <div className="flex h-full flex-col font-mono">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      <input
        ref={folderInputRef}
        type="file"
        accept="video/*"
        multiple
        // @ts-ignore
        webkitdirectory=""
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-widest text-primary">
            {">"} VIDEO_PLAYER
          </h2>
          <div className="flex items-center gap-2">
            <VideoEngineSettings />
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
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto lg:grid lg:grid-cols-3 lg:gap-0 lg:overflow-hidden">
        {/* Main Video Player */}
        <div className="lg:col-span-2 lg:border-r lg:border-border">
          <div
            className="group relative aspect-video w-full cursor-pointer border-b border-border bg-background"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {currentVideo.videoUrl ? (
              <div
                ref={playerWrapperRef}
                className="h-full w-full"
                onClick={(e) => { e.stopPropagation(); setIsPlaying(prev => !prev) }}
              >
                <ReactPlayer
                  ref={playerRef}
                  src={currentVideo.videoUrl}
                  playing={isPlaying}
                  volume={isMuted ? 0 : volume / 100}
                  muted={isMuted}
                  width="100%"
                  height="100%"
                  controls={false}
                  playsInline
                  onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => {
                    const d = e.currentTarget.duration
                    setDuration(Number.isFinite(d) ? Math.round(d) : currentVideo.duration)
                  }}
                  onWaiting={() => setIsBuffering(true)}
                  onPlaying={() => setIsBuffering(false)}
                  onEnded={() => playNext()}
                  onError={() => setIsPlaying(false)}
                  style={{ objectFit: "cover" }}
                />
              </div>
            ) : currentVideo.thumbnailUrl ? (
              <img
                src={currentVideo.thumbnailUrl}
                alt={currentVideo.title}
                className="h-full w-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-secondary">
                <Film className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            
            {/* Terminal overlay */}
            <div className="absolute left-3 top-3 text-xs text-primary/70">
              <div>[SYS] BONZO_VIDEO_ENGINE</div>
              <div>[ENGINE] REACT_PLAYER_v2</div>
              <div>[STATUS] {isPlaying ? "PLAYING" : "PAUSED"}</div>
              {isBuffering && <div>[BUFFER] LOADING...</div>}
            </div>
            
            {/* Play Overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                <div className="flex h-16 w-16 items-center justify-center border border-primary bg-primary/90 text-primary-foreground transition-transform hover:scale-110">
                  <Play className="ml-1 h-8 w-8" />
                </div>
              </div>
            )}

            {/* Video Controls */}
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 bg-linear-to-t from-background/90 to-transparent p-4 transition-opacity",
                showControls ? "opacity-100" : "opacity-0"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Progress Bar */}
              <div className="mb-4">
                <Slider
                  value={[Number(progress) || 0]}
                  onValueChange={handleSeek}
                  min={0}
                  max={Math.max(duration, 1)}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-foreground hover:bg-foreground/20"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-foreground hover:bg-foreground/20"
                    onClick={playPrevious}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-foreground hover:bg-foreground/20"
                    onClick={playNext}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-foreground hover:bg-foreground/20"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : Number(volume) || 0]}
                      onValueChange={(value) => {
                        setVolume(value[0])
                        setIsMuted(false)
                      }}
                      min={0}
                      max={100}
                      step={1}
                      className="w-20"
                    />
                  </div>

                  <span className="ml-2 text-xs text-foreground">
                    [{formatTime(progress)}] / [{formatTime(duration || currentVideo.duration)}]
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-foreground hover:bg-foreground/20"
                  >
                    <Subtitles className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-foreground hover:bg-foreground/20"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-foreground hover:bg-foreground/20"
                    onClick={togglePictureInPicture}
                  >
                    <PictureInPicture className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-foreground hover:bg-foreground/20"
                    onClick={toggleFullscreen}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold uppercase tracking-wider text-foreground">
              {currentVideo.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{currentVideo.description}</p>
          </div>
        </div>

        {/* Video List */}
        <div className="border-t border-border lg:border-t-0">
          <div className="border-b border-border p-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary">
              {">"} QUEUE [{allVideos.length}]
            </h4>
          </div>
          <div className="divide-y divide-border">
            {allVideos.map((video, index) => (
              <button
                key={video.id}
                onClick={() => {
                  selectVideo(video)
                }}
                className={cn(
                  "flex w-full gap-3 p-4 text-left transition-colors hover:bg-accent/50",
                  currentVideo.id === video.id && "bg-accent"
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="relative h-16 w-28 shrink-0 overflow-hidden border border-border">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="h-full w-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary">
                      <Film className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 bg-background/90 px-1 py-0.5 text-xs text-foreground">
                    {formatTime(video.duration)}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium uppercase tracking-wide text-foreground">
                    {video.title}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {video.description}
                  </p>
                </div>
                {video.id.startsWith("local-") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeLocalVideo(video.id)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
