"use client"

import { useState, useRef } from "react"
import { useMedia, type Track } from "@/lib/media-context"
import { cn } from "@/lib/utils"
import {
  Music2,
  ExternalLink,
  Plus,
  X,
  Globe,
  Radio,
  Zap,
  Disc3,
  Search,
  Link2,
  AlertCircle,
  Check,
  ChevronRight,
  PlayCircle,
  BookmarkPlus,
  Maximize2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ─── Service definitions ──────────────────────────────────────────────────────

interface StreamService {
  id: string
  name: string
  label: string           // etykieta w menu
  url: string
  description: string
  tags: string[]
  color: string           // tailwind bg klasa
  textColor: string
  borderColor: string
  icon: React.ElementType
  embeddable: boolean     // czy próbować iframe
  embedUrl?: string       // alternatywny URL do embeda
  note?: string           // informacja dla użytkownika
}

const SERVICES: StreamService[] = [
  {
    id: "soundcloud",
    name: "SoundCloud",
    label: "SOUNDCLOUD",
    url: "https://soundcloud.com",
    description:
      "Największa platforma dla niezależnych artystów. Odkryj nową muzykę, wklej URL utworu aby go odtworzyć i zapisać do biblioteki.",
    tags: ["indie", "electronic", "hip-hop", "remixes", "demos"],
    color: "bg-orange-500/10",
    textColor: "text-orange-400",
    borderColor: "border-orange-500/30",
    icon: Radio,
    embeddable: true,
    embedUrl: "https://soundcloud.com/discover",
    note: "Wklej URL utworu SoundCloud poniżej aby go odtworzyć",
  },
  {
    id: "tidal",
    name: "Tidal",
    label: "TIDAL",
    url: "https://tidal.com/browse",
    description:
      "Streaming hi-fi z najwyższą jakością audio. Lossless, Dolby Atmos i MQA. Wymaga konta Tidal do pełnego dostępu.",
    tags: ["hi-fi", "lossless", "MQA", "Dolby Atmos", "exclusive"],
    color: "bg-blue-500/10",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    icon: Disc3,
    embeddable: true,
    embedUrl: "https://tidal.com/browse",
    note: "Wymaga logowania do Tidal",
  },
  {
    id: "indieshuffle",
    name: "IndieShuffle",
    label: "INDIESHUFFLE",
    url: "https://www.indieshuffle.com",
    description:
      "Kuratowana platforma odkrywania muzyki indie. Nowe wydawnictwa i recenzje każdego dnia. Znajdź swój następny ulubiony utwór.",
    tags: ["indie", "alternative", "discovery", "new releases", "curated"],
    color: "bg-green-500/10",
    textColor: "text-green-400",
    borderColor: "border-green-500/30",
    icon: Search,
    embeddable: true,
    embedUrl: "https://www.indieshuffle.com",
  },
  {
    id: "musicatlas",
    name: "MusicAtlas.ai",
    label: "MUSICATLAS_AI",
    url: "https://musicatlas.ai",
    description:
      "AI-powered odkrywanie muzyki. Inteligentne rekomendacje i analiza nastroju, gatunku, BPM. Eksploruj muzykę przez pryzmat AI.",
    tags: ["AI", "discovery", "mood", "genre", "recommendations"],
    color: "bg-purple-500/10",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/30",
    icon: Zap,
    embeddable: true,
    embedUrl: "https://musicatlas.ai",
  },
]

// ─── Add Track Form ───────────────────────────────────────────────────────────

interface AddTrackFormData {
  title: string
  artist: string
  album: string
  audioUrl: string
  coverUrl: string
  sourceUrl: string
  sourceService: string
}

const EMPTY_FORM: AddTrackFormData = {
  title: "",
  artist: "",
  album: "",
  audioUrl: "",
  coverUrl: "",
  sourceUrl: "",
  sourceService: "",
}

function AddTrackDialog({
  open,
  onClose,
  defaultService = "",
  defaultSourceUrl = "",
}: {
  open: boolean
  onClose: () => void
  defaultService?: string
  defaultSourceUrl?: string
}) {
  const { addLocalTrack } = useMedia()
  const [form, setForm] = useState<AddTrackFormData>({
    ...EMPTY_FORM,
    sourceService: defaultService,
    sourceUrl: defaultSourceUrl,
  })
  const [saved, setSaved] = useState(false)

  const set = (k: keyof AddTrackFormData, v: string) =>
    setForm((p) => ({ ...p, [k]: v }))

  const handleSave = () => {
    if (!form.title.trim() || !form.artist.trim()) return
    const track: Track = {
      id: `stream-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: form.title.trim(),
      artist: form.artist.trim(),
      album: form.album.trim() || form.artist.trim(),
      duration: 0,
      coverUrl: form.coverUrl.trim() || "",
      audioUrl: form.audioUrl.trim() || undefined,
      sourceService: form.sourceService || undefined,
      sourceUrl: form.sourceUrl.trim() || undefined,
    }
    addLocalTrack(track)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setForm({ ...EMPTY_FORM, sourceService: defaultService })
      onClose()
    }, 1200)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="font-mono sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xs uppercase tracking-widest text-primary">
            {">"} ADD_TO_LIBRARY
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {/* Source service badge */}
          {defaultService && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              Źródło:{" "}
              <span className="text-primary uppercase">
                {SERVICES.find((s) => s.id === defaultService)?.name ?? defaultService}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Tytuł *
              </Label>
              <Input
                placeholder="Tytuł utworu"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Artysta *
              </Label>
              <Input
                placeholder="Nazwa artysty"
                value={form.artist}
                onChange={(e) => set("artist", e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Album (opcjonalnie)
            </Label>
            <Input
              placeholder="Nazwa albumu"
              value={form.album}
              onChange={(e) => set("album", e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
              URL audio (opcjonalnie — do odtwarzania)
            </Label>
            <Input
              placeholder="https://... (mp3, ogg, m4a)"
              value={form.audioUrl}
              onChange={(e) => set("audioUrl", e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
              URL okładki (opcjonalnie)
            </Label>
            <Input
              placeholder="https://... (jpg, png, webp)"
              value={form.coverUrl}
              onChange={(e) => set("coverUrl", e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
              URL źródłowy (link do utworu na platformie)
            </Label>
            <Input
              placeholder="https://soundcloud.com/..."
              value={form.sourceUrl}
              onChange={(e) => set("sourceUrl", e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          {/* Cover preview */}
          {form.coverUrl && (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.coverUrl}
                alt="cover preview"
                className="h-14 w-14 border border-border object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
              <span className="text-xs text-muted-foreground">Podgląd okładki</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={!form.title.trim() || !form.artist.trim()}
              className={cn(
                "flex-1 gap-2 text-xs uppercase tracking-wider",
                saved && "bg-green-600 hover:bg-green-600"
              )}
            >
              {saved ? (
                <>
                  <Check className="h-3 w-3" /> DODANO DO BIBLIOTEKI
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-3 w-3" /> ZAPISZ DO BIBLIOTEKI
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="text-xs uppercase tracking-wider"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── SoundCloud URL embed ─────────────────────────────────────────────────────

function SoundCloudEmbed({ url }: { url: string }) {
  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%2300d4aa&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&visual=true`
  return (
    <iframe
      src={embedUrl}
      className="h-full w-full border-0"
      allow="autoplay"
      title="SoundCloud player"
      sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
    />
  )
}

// ─── Service iframe panel ─────────────────────────────────────────────────────

function ServiceFrame({ service }: { service: StreamService }) {
  const [iframeError, setIframeError] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [scUrl, setScUrl] = useState("")
  const [scEmbed, setScEmbed] = useState("")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleScSubmit = () => {
    const url = scUrl.trim()
    if (!url.includes("soundcloud.com")) return
    setScEmbed(url)
  }

  const frameUrl = service.embedUrl ?? service.url

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Service header */}
      <div
        className={cn(
          "flex items-center justify-between border p-3",
          service.borderColor,
          service.color
        )}
      >
        <div className="flex items-center gap-3">
          <service.icon className={cn("h-5 w-5", service.textColor)} />
          <div>
            <div className={cn("text-sm font-bold uppercase tracking-wider", service.textColor)}>
              {service.name}
            </div>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {service.tags.map((t) => (
                <span
                  key={t}
                  className="rounded bg-background/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setFullscreen(!fullscreen)}
            title="Fullscreen"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => {
              setIframeError(false)
              if (iframeRef.current) iframeRef.current.src = frameUrl
            }}
            title="Odśwież"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <a href={service.url} target="_blank" rel="noopener noreferrer">
            <Button size="icon" variant="ghost" className="h-7 w-7" title="Otwórz w nowej karcie">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </div>

      {/* SoundCloud URL paste */}
      {service.id === "soundcloud" && (
        <div className="flex gap-2">
          <Input
            placeholder="Wklej URL SoundCloud: https://soundcloud.com/artysta/utwor"
            value={scUrl}
            onChange={(e) => setScUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScSubmit()}
            className="h-8 text-xs font-mono"
          />
          <Button
            size="sm"
            onClick={handleScSubmit}
            disabled={!scUrl.includes("soundcloud.com")}
            className="gap-1 text-xs uppercase tracking-wider whitespace-nowrap"
          >
            <PlayCircle className="h-3 w-3" />
            ODTWÓRZ
          </Button>
        </div>
      )}

      {/* Service description */}
      <p className="text-xs text-muted-foreground">{service.description}</p>
      {service.note && (
        <div className="flex items-center gap-2 text-xs text-primary/70">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {service.note}
        </div>
      )}

      {/* Iframe / embed area */}
      <div
        className={cn(
          "relative flex-1 overflow-hidden border border-border bg-black/20 min-h-[300px]",
          fullscreen && "fixed inset-4 z-50 bg-background"
        )}
      >
        {fullscreen && (
          <Button
            size="sm"
            variant="outline"
            className="absolute right-2 top-2 z-10 gap-1 text-xs"
            onClick={() => setFullscreen(false)}
          >
            <X className="h-3 w-3" /> ZAMKNIJ
          </Button>
        )}

        {/* SoundCloud embed from pasted URL */}
        {service.id === "soundcloud" && scEmbed ? (
          <SoundCloudEmbed url={scEmbed} />
        ) : iframeError ? (
          /* Fallback card when iframe blocked */
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <service.icon className={cn("h-12 w-12", service.textColor)} />
            <div>
              <p className="text-sm font-medium text-foreground">{service.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Ta strona blokuje osadzanie w ramkach (X-Frame-Options).
                Otwórz w nowej karcie.
              </p>
            </div>
            <a href={service.url} target="_blank" rel="noopener noreferrer">
              <Button className="gap-2 text-xs uppercase tracking-wider">
                <ExternalLink className="h-3 w-3" />
                OTWÓRZ {service.name.toUpperCase()}
              </Button>
            </a>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={frameUrl}
            className="h-full w-full border-0"
            title={service.name}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
            onError={() => setIframeError(true)}
            // Niektóre przeglądarki nie triggerują onError dla iframe — używamy timeout
            onLoad={(e) => {
              try {
                // Sprawdź czy iframe załadował — jeśli contentDocument jest null, strona blokowała
                const frame = e.currentTarget
                if (!frame.contentDocument && !frame.contentWindow?.location?.href) {
                  setIframeError(true)
                }
              } catch {
                setIframeError(true)
              }
            }}
          />
        )}
      </div>
    </div>
  )
}

// ─── Main StreamsPanel ────────────────────────────────────────────────────────

export function StreamsPanel() {
  const { localTracks, addLocalTrack, setActiveView } = useMedia()
  const [selectedId, setSelectedId] = useState<string>("soundcloud")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addDialogService, setAddDialogService] = useState("")

  const selected = SERVICES.find((s) => s.id === selectedId) ?? SERVICES[0]

  const openAdd = (serviceId?: string) => {
    setAddDialogService(serviceId ?? selectedId)
    setShowAddDialog(true)
  }

  // Tracki z aktywnej usługi w bibliotece
  const serviceTracksCount = localTracks.filter(
    (t) => t.sourceService === selectedId
  ).length

  return (
    <div className="flex h-full flex-col font-mono">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-widest text-primary">
            {">"} STREAMS_DISCOVERY
            <span className="ml-2 inline-flex items-center rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-primary/80">
              {SERVICES.length} SERVICES
            </span>
          </h2>
          <div className="flex items-center gap-2">
            {serviceTracksCount > 0 && (
              <span className="text-xs text-muted-foreground">
                [{serviceTracksCount} w bibliotece]
              </span>
            )}
            <Button
              size="sm"
              onClick={() => openAdd()}
              className="gap-2 text-xs uppercase tracking-wider"
            >
              <Plus className="h-3 w-3" />
              ADD_TO_LIBRARY
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveView("music")}
              className="gap-2 text-xs uppercase tracking-wider"
            >
              <Music2 className="h-3 w-3" />
              PLAYER
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: service list */}
        <div className="hidden w-52 shrink-0 flex-col gap-1 border-r border-border p-3 lg:flex">
          <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-widest text-primary">
            {">"} SERVICES
          </p>

          {SERVICES.map((svc) => {
            const count = localTracks.filter((t) => t.sourceService === svc.id).length
            return (
              <button
                key={svc.id}
                onClick={() => setSelectedId(svc.id)}
                className={cn(
                  "flex w-full items-center gap-2 border px-3 py-2 text-left text-xs transition-colors",
                  selectedId === svc.id
                    ? `border-primary bg-primary/10 ${svc.textColor}`
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-card"
                )}
              >
                <svc.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 font-medium uppercase tracking-wider truncate">
                  {svc.label}
                </span>
                {selectedId === svc.id && (
                  <ChevronRight className="h-3 w-3 shrink-0" />
                )}
                {count > 0 && (
                  <span className="shrink-0 rounded bg-primary/20 px-1 text-[9px] text-primary">
                    {count}
                  </span>
                )}
              </button>
            )
          })}

          {/* Divider */}
          <div className="my-2 border-t border-border" />

          <p className="mb-1 px-2 text-[10px] font-medium uppercase tracking-widest text-primary">
            {">"} LIBRARY
          </p>
          <button
            onClick={() => setActiveView("music")}
            className="flex w-full items-center gap-2 border border-transparent px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-foreground"
          >
            <Music2 className="h-3.5 w-3.5" />
            <span className="uppercase tracking-wider">AUDIO_PLAYER</span>
            {localTracks.length > 0 && (
              <span className="ml-auto shrink-0 rounded bg-primary/20 px-1 text-[9px] text-primary">
                {localTracks.length}
              </span>
            )}
          </button>

          {/* Add button */}
          <div className="mt-auto pt-3">
            <Button
              size="sm"
              onClick={() => openAdd(selectedId)}
              className="w-full gap-2 text-xs uppercase tracking-wider"
            >
              <BookmarkPlus className="h-3 w-3" />
              ADD_TRACK
            </Button>
          </div>
        </div>

        {/* Mobile: horizontal service tabs */}
        <div className="flex w-full flex-col overflow-hidden">
          <div className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2 lg:hidden">
            {SERVICES.map((svc) => (
              <button
                key={svc.id}
                onClick={() => setSelectedId(svc.id)}
                className={cn(
                  "shrink-0 border px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
                  selectedId === svc.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent text-muted-foreground"
                )}
              >
                {svc.label}
              </button>
            ))}
          </div>

          {/* Main content area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <ServiceFrame service={selected} />
          </div>
        </div>
      </div>

      {/* Add Track Dialog */}
      <AddTrackDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        defaultService={addDialogService}
      />
    </div>
  )
}
