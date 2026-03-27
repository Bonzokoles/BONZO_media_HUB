"use client"

import { useState, useEffect } from "react"
import { Film, Check, ExternalLink, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type VideoEngine = {
  id: string
  name: string
  description: string
  features: string[]
  status: "available" | "requires-setup" | "browser-native"
  setupUrl?: string
}

const videoEngines: VideoEngine[] = [
  {
    id: "native",
    name: "HTML5_NATIVE",
    description: "Browser built-in video player",
    features: ["MP4", "WebM", "Ogg", "Basic controls"],
    status: "browser-native",
  },
  {
    id: "videojs",
    name: "VIDEO.JS",
    description: "Open source HTML5 player framework",
    features: ["HLS/DASH", "Plugins", "Customizable skin", "Accessibility"],
    status: "available",
    setupUrl: "https://videojs.com/",
  },
  {
    id: "plyr",
    name: "PLYR.IO",
    description: "Simple, lightweight, accessible player",
    features: ["YouTube/Vimeo", "Captions", "Speed control", "Picture-in-Picture"],
    status: "available",
    setupUrl: "https://plyr.io/",
  },
  {
    id: "shaka",
    name: "SHAKA_PLAYER",
    description: "Google's adaptive streaming player",
    features: ["DASH", "HLS", "DRM support", "Offline playback"],
    status: "requires-setup",
    setupUrl: "https://github.com/shaka-project/shaka-player",
  },
  {
    id: "hls",
    name: "HLS.JS",
    description: "HLS streaming for browsers",
    features: ["HLS streams", "Adaptive bitrate", "Live streaming", "DVR"],
    status: "available",
    setupUrl: "https://github.com/video-dev/hls.js",
  },
  {
    id: "dash",
    name: "DASH.JS",
    description: "MPEG-DASH reference player",
    features: ["DASH streams", "MSE", "EME/DRM", "Low latency"],
    status: "requires-setup",
    setupUrl: "https://github.com/Dash-Industry-Forum/dash.js",
  },
]

export function VideoEngineSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentEngine, setCurrentEngine] = useState("native")

  useEffect(() => {
    const saved = localStorage.getItem("bonzo-video-engine")
    if (saved) setCurrentEngine(saved)
  }, [])

  const handleSelectEngine = (engineId: string) => {
    setCurrentEngine(engineId)
    localStorage.setItem("bonzo-video-engine", engineId)
  }

  const getStatusBadge = (status: VideoEngine["status"]) => {
    switch (status) {
      case "browser-native":
        return (
          <span className="flex items-center gap-1 text-xs text-green-500">
            <Check className="h-3 w-3" />
            READY
          </span>
        )
      case "available":
        return (
          <span className="flex items-center gap-1 text-xs text-primary">
            <Info className="h-3 w-3" />
            AVAILABLE
          </span>
        )
      case "requires-setup":
        return (
          <span className="flex items-center gap-1 text-xs text-yellow-500">
            <AlertTriangle className="h-3 w-3" />
            SETUP_REQUIRED
          </span>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-xs uppercase tracking-wider">
          <Film className="h-3 w-3" />
          ENGINE
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl font-mono">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 uppercase tracking-widest">
            <Film className="h-4 w-4 text-primary" />
            VIDEO_ENGINE_CONFIG
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Select video playback engine and codec support
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="border border-border bg-secondary/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                [ACTIVE_ENGINE]
              </span>
              <span className="text-xs font-medium text-primary uppercase">
                {videoEngines.find((e) => e.id === currentEngine)?.name}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {videoEngines.map((engine) => (
              <button
                key={engine.id}
                onClick={() => handleSelectEngine(engine.id)}
                className={cn(
                  "flex w-full items-start gap-4 border p-4 text-left transition-all hover:border-primary/50",
                  currentEngine === engine.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center border",
                  currentEngine === engine.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary"
                )}>
                  {currentEngine === engine.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Film className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium uppercase tracking-wider">
                      {engine.name}
                    </h4>
                    {getStatusBadge(engine.status)}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {engine.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {engine.features.map((feature) => (
                      <span
                        key={feature}
                        className="border border-border bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  {engine.setupUrl && (
                    <a
                      href={engine.setupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Documentation
                    </a>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            <p className="mb-2 font-medium uppercase text-foreground">
              [SETUP_INSTRUCTIONS]
            </p>
            <p className="mb-2">
              For advanced video engines (Video.js, HLS.js, etc.), install via npm in your VS Code terminal:
            </p>
            <code className="block bg-background p-2 text-primary">
              pnpm add video.js hls.js plyr
            </code>
            <p className="mt-2">
              After installation, restart the dev server and the engine will be automatically detected.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
