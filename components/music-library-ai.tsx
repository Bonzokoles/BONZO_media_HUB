"use client"

import { useState, useRef, useEffect } from "react"
import type { Track } from "@/lib/media-context"
import {
  askMusicAI, groupByArtist, buildTrackContext,
  fetchLyrics, fetchCoverArt,
  suggestPlaylists, suggestOrganization,
  type ChatMessage, type ArtistGroup,
} from "@/lib/deepseek-music-ai"
import type { CoverResult } from "@/app/api/cover-art/route"
import {
  Brain, MessageSquare, FileText, ImageIcon, Users, ListMusic,
  Send, Search, X, Plus, Loader2, Music, Check, ChevronRight,
  Sparkles, RefreshCw, BookmarkPlus, Copy, ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Playlist { id: string; name: string; tracks: Track[] }

interface Props {
  open: boolean
  onClose: () => void
  tracks: Track[]
  currentTrack: Track | null
  playlists: Playlist[]
  onPlaylistCreate: (name: string, tracks: Track[]) => void
  onTrackCoverUpdate: (trackId: string, coverUrl: string) => void
}

type Tab = "chat" | "artists" | "lyrics" | "covers" | "playlists"

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "chat",     label: "AI CHAT",  icon: Brain },
  { id: "artists",  label: "ARTYŚCI",  icon: Users },
  { id: "lyrics",   label: "TEKSTY",   icon: FileText },
  { id: "covers",   label: "OKŁADKI",  icon: ImageIcon },
  { id: "playlists",label: "PLAYLISTY",icon: ListMusic },
]

// ─── AI Chat Tab ──────────────────────────────────────────────────────────────

function ChatTab({ tracks }: { tracks: Track[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput("")
    setError("")
    const userMsg: ChatMessage = { role: "user", content: msg }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    try {
      const ctx = buildTrackContext(tracks)
      const history = [...messages, userMsg]
      const reply = await askMusicAI([
        ...history,
        { role: "user", content: `${ctx}\n\n${msg}` },
      ])
      setMessages(prev => [...prev, { role: "assistant", content: reply }])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Błąd AI")
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { label: "Zaproponuj playlisty", prompt: "Zaproponuj 3 tematyczne playlisty z mojej biblioteki." },
    { label: "Zorganizuj bibliotekę", prompt: "Jak zorganizować moją bibliotekę muzyczną?" },
    { label: "Pogrupuj artystów", prompt: "Pogrupuj moich artystów według gatunków i nastrojów." },
    { label: "Top artyści", prompt: "Który artysta ma najwięcej utworów w mojej bibliotece?" },
  ]

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Quick actions */}
      <div className="flex flex-wrap gap-1.5">
        {quickActions.map(a => (
          <button
            key={a.label}
            onClick={() => send(a.prompt)}
            disabled={loading}
            className="rounded border border-primary/30 bg-primary/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-primary/80 transition-colors hover:border-primary hover:bg-primary/15 disabled:opacity-40"
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 rounded border border-border">
        <div className="space-y-3 p-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <Brain className="h-8 w-8 opacity-20" />
              <p className="text-xs">Zapytaj AI o swoją bibliotekę muzyczną</p>
              <p className="text-[10px] opacity-60">Wymaga klucza DEEPSEEK_API_KEY w .env</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-2", m.role === "user" && "flex-row-reverse")}>
              <div className={cn(
                "max-w-[85%] rounded px-3 py-2 text-xs leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground",
              )}>
                <pre className="whitespace-pre-wrap font-mono text-[11px]">{m.content}</pre>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="flex items-center gap-2 rounded border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Myślę...
              </div>
            </div>
          )}
          {error && (
            <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] text-red-400">
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Zapytaj o muzykę, playlisty, artystów..."
          className="h-8 text-xs font-mono"
          disabled={loading}
        />
        <Button size="sm" onClick={() => send()} disabled={!input.trim() || loading} className="h-8 gap-1 px-3">
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

// ─── Artists Tab ──────────────────────────────────────────────────────────────

function ArtistsTab({ tracks, onPlaylistCreate }: { tracks: Track[]; onPlaylistCreate: (n: string, t: Track[]) => void }) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [created, setCreated] = useState<string | null>(null)

  const groups = groupByArtist(tracks)
  const filtered = search
    ? groups.filter(g => g.artist.toLowerCase().includes(search.toLowerCase()))
    : groups
  const selectedGroup = groups.find(g => g.artist === selected)

  const createArtistPlaylist = (group: ArtistGroup) => {
    onPlaylistCreate(`${group.artist} – All`, group.tracks)
    setCreated(group.artist)
    setTimeout(() => setCreated(null), 2000)
  }

  return (
    <div className="flex h-full gap-3">
      {/* Artist list */}
      <div className="flex w-48 shrink-0 flex-col gap-2">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Szukaj artysty..."
          className="h-7 text-[11px] font-mono"
        />
        <ScrollArea className="flex-1 rounded border border-border">
          <div className="divide-y divide-border">
            {filtered.length === 0 && (
              <p className="p-3 text-[10px] text-muted-foreground">Brak artystów</p>
            )}
            {filtered.map(g => (
              <button
                key={g.artist}
                onClick={() => setSelected(g.artist === selected ? null : g.artist)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-[11px] transition-colors hover:bg-accent",
                  selected === g.artist && "bg-primary/10 text-primary",
                )}
              >
                <span className="truncate font-medium">{g.artist}</span>
                <span className="ml-1 shrink-0 text-[9px] text-muted-foreground">{g.trackCount}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
        <div className="text-[10px] text-muted-foreground">
          {groups.length} artystów · {tracks.length} utworów
        </div>
      </div>

      {/* Artist detail */}
      <div className="flex flex-1 flex-col gap-2">
        {!selectedGroup ? (
          <div className="flex h-full items-center justify-center text-center text-muted-foreground">
            <div>
              <Users className="mx-auto mb-2 h-8 w-8 opacity-20" />
              <p className="text-xs">Wybierz artystę</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-foreground">{selectedGroup.artist}</p>
                <p className="text-[10px] text-muted-foreground">{selectedGroup.trackCount} utworów</p>
              </div>
              <Button
                size="sm"
                onClick={() => createArtistPlaylist(selectedGroup)}
                className={cn("gap-1.5 text-[10px]", created === selectedGroup.artist && "bg-green-600 hover:bg-green-600")}
              >
                {created === selectedGroup.artist
                  ? <><Check className="h-3 w-3" /> DODANO</>
                  : <><Plus className="h-3 w-3" /> PLAYLIST</>}
              </Button>
            </div>
            <ScrollArea className="flex-1 rounded border border-border">
              <div className="divide-y divide-border">
                {selectedGroup.tracks.map(t => (
                  <div key={t.id} className="flex items-center gap-3 px-3 py-2">
                    {t.coverUrl
                      ? <img src={t.coverUrl} alt="" className="h-7 w-7 shrink-0 object-cover" />
                      : <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-card"><Music className="h-3 w-3 text-muted-foreground" /></div>}
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-medium">{t.title}</p>
                      <p className="text-[10px] text-muted-foreground">{t.album}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Lyrics Tab ───────────────────────────────────────────────────────────────

function LyricsTab({ currentTrack }: { currentTrack: Track | null }) {
  const [artist, setArtist] = useState(currentTrack?.artist ?? "")
  const [title, setTitle] = useState(currentTrack?.title ?? "")
  const [lyrics, setLyrics] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (currentTrack) {
      setArtist(currentTrack.artist)
      setTitle(currentTrack.title)
      setLyrics(null)
      setError("")
    }
  }, [currentTrack?.id])

  const search = async () => {
    if (!artist.trim() || !title.trim()) return
    setLoading(true)
    setError("")
    setLyrics(null)
    try {
      const text = await fetchLyrics(artist.trim(), title.trim())
      setLyrics(text)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Nie znaleziono tekstu")
    } finally {
      setLoading(false)
    }
  }

  const copy = () => lyrics && navigator.clipboard.writeText(lyrics)

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex gap-2">
        <Input value={artist} onChange={e => setArtist(e.target.value)} placeholder="Artysta" className="h-8 text-xs font-mono" />
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tytuł" className="h-8 text-xs font-mono"
          onKeyDown={e => e.key === "Enter" && search()} />
        <Button size="sm" onClick={search} disabled={loading || !artist.trim() || !title.trim()} className="h-8 gap-1 px-3 shrink-0">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
        </Button>
      </div>

      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] text-red-400">{error}</div>
      )}

      {lyrics && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Źródło: lyrics.ovh</span>
          <Button size="sm" variant="ghost" onClick={copy} className="h-6 gap-1 text-[10px]">
            <Copy className="h-3 w-3" /> Kopiuj
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1 rounded border border-border">
        {!lyrics && !loading && !error && (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
            <FileText className="h-8 w-8 opacity-20" />
            <p className="text-xs">Wyszukaj tekst piosenki</p>
            <p className="text-[10px] opacity-60">Darmowe · lyrics.ovh · bez klucza API</p>
          </div>
        )}
        {lyrics && (
          <pre className="whitespace-pre-wrap p-4 font-mono text-[11px] leading-relaxed text-foreground">
            {lyrics}
          </pre>
        )}
      </ScrollArea>
    </div>
  )
}

// ─── Cover Art Tab ────────────────────────────────────────────────────────────

function CoversTab({ tracks, currentTrack, onTrackCoverUpdate }: {
  tracks: Track[]
  currentTrack: Track | null
  onTrackCoverUpdate: (id: string, url: string) => void
}) {
  const [artist, setArtist] = useState(currentTrack?.artist ?? "")
  const [album, setAlbum] = useState(currentTrack?.album ?? "")
  const [results, setResults] = useState<CoverResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [appliedTo, setAppliedTo] = useState<string | null>(null)
  const [selectedTrackId, setSelectedTrackId] = useState(currentTrack?.id ?? "")

  useEffect(() => {
    if (currentTrack) {
      setArtist(currentTrack.artist)
      setAlbum(currentTrack.album)
      setSelectedTrackId(currentTrack.id)
    }
  }, [currentTrack?.id])

  const search = async () => {
    if (!artist.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetchCoverArt(artist.trim(), album.trim() || undefined)
      setResults(res)
      if (res.length === 0) setError("Nie znaleziono okładek")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Błąd wyszukiwania")
    } finally {
      setLoading(false)
    }
  }

  const apply = (coverUrl: string) => {
    if (!selectedTrackId) return
    onTrackCoverUpdate(selectedTrackId, coverUrl)
    setAppliedTo(coverUrl)
    setTimeout(() => setAppliedTo(null), 2000)
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Search */}
      <div className="flex gap-2">
        <Input value={artist} onChange={e => setArtist(e.target.value)} placeholder="Artysta" className="h-8 text-xs font-mono" />
        <Input value={album} onChange={e => setAlbum(e.target.value)} placeholder="Album (opcjonalnie)" className="h-8 text-xs font-mono"
          onKeyDown={e => e.key === "Enter" && search()} />
        <Button size="sm" onClick={search} disabled={loading || !artist.trim()} className="h-8 gap-1 px-3 shrink-0">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
        </Button>
      </div>

      {/* Track selector */}
      {tracks.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[10px] text-muted-foreground">Przypisz do:</span>
          <select
            value={selectedTrackId}
            onChange={e => setSelectedTrackId(e.target.value)}
            className="flex-1 rounded border border-border bg-background px-2 py-1 text-[10px] font-mono text-foreground"
          >
            <option value="">— wybierz utwór —</option>
            {tracks.map(t => (
              <option key={t.id} value={t.id}>{t.title} – {t.artist}</option>
            ))}
          </select>
        </div>
      )}

      {error && <div className="text-[10px] text-red-400">{error}</div>}

      {/* Results grid */}
      <ScrollArea className="flex-1 rounded border border-border">
        {results.length === 0 && !loading && (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
            <ImageIcon className="h-8 w-8 opacity-20" />
            <p className="text-xs">Wyszukaj okładki albumów</p>
            <p className="text-[10px] opacity-60">Darmowe · iTunes API · bez klucza</p>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-4">
          {results.map((r, i) => (
            <div key={i} className="group relative overflow-hidden rounded border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.coverUrl300} alt={r.album} className="aspect-square w-full object-cover" loading="lazy"
                onError={e => { (e.target as HTMLImageElement).src = r.coverUrl }} />
              <div className="absolute inset-0 flex flex-col justify-end bg-black/70 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-[9px] font-medium text-white">{r.album}</p>
                <p className="truncate text-[9px] text-white/60">{r.year ?? ""}</p>
                <button
                  onClick={() => apply(r.coverUrl)}
                  className={cn(
                    "mt-1 w-full rounded py-0.5 text-[9px] font-bold uppercase transition-colors",
                    appliedTo === r.coverUrl
                      ? "bg-green-500 text-white"
                      : "bg-primary text-primary-foreground hover:bg-primary/80",
                  )}
                >
                  {appliedTo === r.coverUrl ? "✓ OK" : "UŻYJ"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

// ─── Playlists Tab ────────────────────────────────────────────────────────────

function PlaylistsTab({ tracks, playlists, onPlaylistCreate }: {
  tracks: Track[]
  playlists: Playlist[]
  onPlaylistCreate: (name: string, tracks: Track[]) => void
}) {
  const [suggestion, setSuggestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)

  const generateSuggestions = async () => {
    if (tracks.length === 0) return
    setLoading(true)
    setError("")
    try {
      const text = await suggestPlaylists(tracks)
      setSuggestion(text)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Błąd AI")
    } finally {
      setLoading(false)
    }
  }

  const createEmpty = () => {
    if (!newName.trim()) return
    onPlaylistCreate(newName.trim(), [])
    setNewName("")
    setCreating(false)
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Existing playlists */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">Playlisty ({playlists.length})</span>
        <Button size="sm" variant="outline" onClick={() => setCreating(!creating)} className="h-6 gap-1 text-[10px]">
          <Plus className="h-3 w-3" /> NOWA
        </Button>
      </div>

      {creating && (
        <div className="flex gap-2">
          <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nazwa playlisty"
            onKeyDown={e => e.key === "Enter" && createEmpty()}
            className="h-7 text-xs font-mono" autoFocus />
          <Button size="sm" onClick={createEmpty} disabled={!newName.trim()} className="h-7 px-2">
            <Check className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setCreating(false)} className="h-7 px-2">
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {playlists.length > 0 && (
        <div className="flex flex-col gap-1 rounded border border-border p-2">
          {playlists.map(p => (
            <div key={p.id} className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-2">
                <ListMusic className="h-3 w-3 text-primary" />
                <span className="text-[11px]">{p.name}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{p.tracks.length} ut.</span>
            </div>
          ))}
        </div>
      )}

      {/* AI suggestions */}
      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">AI Sugestie</span>
        <Button size="sm" onClick={generateSuggestions} disabled={loading || tracks.length === 0}
          className="h-6 gap-1 text-[10px]">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          GENERUJ
        </Button>
      </div>

      {error && <div className="text-[10px] text-red-400">{error}</div>}

      {tracks.length === 0 && (
        <p className="text-[10px] text-muted-foreground">Dodaj utwory do biblioteki żeby AI mogło zaproponować playlisty.</p>
      )}

      <ScrollArea className="flex-1 rounded border border-border">
        {suggestion ? (
          <pre className="whitespace-pre-wrap p-3 font-mono text-[11px] leading-relaxed text-foreground">
            {suggestion}
          </pre>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
            <Sparkles className="h-8 w-8 opacity-20" />
            <p className="text-xs">Kliknij GENERUJ</p>
            <p className="text-[10px] opacity-60">AI przeanalizuje bibliotekę i zaproponuje playlisty</p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MusicLibraryAI({
  open, onClose, tracks, currentTrack, playlists,
  onPlaylistCreate, onTrackCoverUpdate,
}: Props) {
  const [tab, setTab] = useState<Tab>("chat")

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="flex h-[85vh] max-w-3xl flex-col gap-0 p-0 font-mono">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-3">
          <DialogTitle className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
            <Brain className="h-4 w-4" />
            {">"} AI_LIBRARY_MANAGER
            <span className="ml-auto text-[10px] text-muted-foreground font-normal normal-case tracking-normal">
              {tracks.length} utworów
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex shrink-0 gap-0 border-b border-border overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider transition-colors whitespace-nowrap",
                tab === t.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="h-3 w-3" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-4">
          {tab === "chat"     && <ChatTab tracks={tracks} />}
          {tab === "artists"  && <ArtistsTab tracks={tracks} onPlaylistCreate={onPlaylistCreate} />}
          {tab === "lyrics"   && <LyricsTab currentTrack={currentTrack} />}
          {tab === "covers"   && <CoversTab tracks={tracks} currentTrack={currentTrack} onTrackCoverUpdate={onTrackCoverUpdate} />}
          {tab === "playlists"&& <PlaylistsTab tracks={tracks} playlists={playlists} onPlaylistCreate={onPlaylistCreate} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}
