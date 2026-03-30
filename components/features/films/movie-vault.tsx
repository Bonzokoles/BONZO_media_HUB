"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  Search, Grid, List, Star, BookOpen, User,
  Film, X, Clock, ChevronRight, Loader2,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface MovieMetadata {
  director?: string
  year?: number
  genres?: string[]
  tags?: string[]
  category?: string
  overview?: string
  runtime?: number
  tmdb_poster?: string | null
  tmdb_backdrop?: string | null
  tmdb_id?: number
  tmdb_rating?: number
  vote_average?: number
  cast?: string[]
  collected_at?: string
}

interface MovieReviews {
  personal?: string | null
  styles?: Record<string, string>
}

interface VaultMovie {
  id: string
  title: string
  source?: string
  metadata: MovieMetadata
  reviews: MovieReviews
}

interface VaultDB {
  movies: VaultMovie[]
  totalMovies?: number
}

type FilterMode = "all" | "has-reviews" | "has-personal"
type ViewMode = "grid" | "list"

// ─── Poster ───────────────────────────────────────────────────────────────────

function MoviePoster({
  movie,
  className,
}: {
  movie: VaultMovie
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const poster = movie.metadata?.tmdb_poster

  if (!poster || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-slate-600 font-black text-4xl select-none",
          className
        )}
      >
        {movie.title.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={`https://image.tmdb.org/t/p/w342${poster}`}
      alt={movie.title}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function MovieCard({
  movie,
  view,
  onClick,
}: {
  movie: VaultMovie
  view: ViewMode
  onClick: () => void
}) {
  const reviewCount = Object.keys(movie.reviews?.styles || {}).length
  const rating = movie.metadata?.vote_average ?? movie.metadata?.tmdb_rating

  if (view === "list") {
    return (
      <button
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/5 p-3 text-left backdrop-blur-sm transition-all hover:border-white/18 hover:bg-white/8 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
      >
        <div className="relative h-[72px] w-[48px] shrink-0 overflow-hidden rounded-lg">
          <MoviePoster movie={movie} className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-white">{movie.title}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            {movie.metadata?.director && <span>{movie.metadata.director}</span>}
            {movie.metadata?.year && <span className="ml-2">{movie.metadata.year}</span>}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {movie.metadata?.genres?.slice(0, 2).map((g) => (
              <span key={g} className="rounded-full bg-violet-500/12 px-2 py-0.5 text-[10px] text-violet-300 border border-violet-500/20">
                {g}
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {rating && (
            <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
              <Star className="h-3 w-3 fill-amber-400" />
              {Number(rating).toFixed(1)}
            </span>
          )}
          {reviewCount > 0 && (
            <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
              {reviewCount} rec.
            </span>
          )}
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/5 text-left backdrop-blur-sm transition-all hover:border-white/18 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/40 hover:shadow-[0_0_20px_rgba(0,255,200,0.08)]"
    >
      {rating && (
        <span className="absolute top-2.5 right-2.5 z-10 rounded-lg bg-black/70 px-2 py-1 text-xs font-bold text-amber-400 backdrop-blur-md border border-amber-400/20">
          ★ {Number(rating).toFixed(1)}
        </span>
      )}
      {reviewCount > 0 && (
        <span className="absolute top-2.5 left-2.5 z-10 rounded-lg bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-400 backdrop-blur-md border border-emerald-500/25">
          {reviewCount} rec.
        </span>
      )}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <MoviePoster movie={movie} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="font-bold leading-snug text-white">{movie.title}</p>
        <p className="mt-0.5 text-xs text-slate-400">
          {movie.metadata?.year}{movie.metadata?.director && ` · ${movie.metadata.director}`}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {movie.metadata?.genres?.slice(0, 2).map((g) => (
            <span key={g} className="rounded-full bg-violet-500/12 px-2 py-0.5 text-[10px] text-violet-300 border border-violet-500/20">
              {g}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function MovieModal({
  movie,
  open,
  onClose,
}: {
  movie: VaultMovie | null
  open: boolean
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<string>("overview")

  useEffect(() => {
    if (movie) setActiveTab("overview")
  }, [movie])

  if (!movie) return null

  const reviewTabs = Object.keys(movie.reviews?.styles || {})
  const tabs = [
    "overview",
    ...reviewTabs,
    ...(movie.reviews?.personal ? ["personal"] : []),
  ]

  const backdrop = movie.metadata?.tmdb_backdrop
    ? `https://image.tmdb.org/t/p/w1280${movie.metadata.tmdb_backdrop}`
    : null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl overflow-hidden rounded-2xl border-white/10 bg-[#0a0e1a] p-0 text-white">
        {/* Hero */}
        <div className="relative h-56 overflow-hidden rounded-t-2xl">
          {backdrop ? (
            <img src={backdrop} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-slate-900 to-slate-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/40 to-transparent" />
          <div className="absolute bottom-5 left-6 right-16">
            <h2 className="text-2xl font-black text-white drop-shadow-lg">{movie.title}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {movie.metadata?.year && <span>{movie.metadata.year}</span>}
              {movie.metadata?.director && <span className="ml-2">· {movie.metadata.director}</span>}
              {movie.metadata?.runtime && <span className="ml-2 flex-inline items-center gap-1"><Clock className="inline h-3 w-3" /> {movie.metadata.runtime} min</span>}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/8 hover:bg-red-500/20 hover:text-red-400 border border-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/8 px-6 pt-4">
          <div className="flex flex-wrap gap-1.5 pb-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-lg border px-3 py-1 text-xs font-medium capitalize transition-all",
                  activeTab === tab
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                    : "border-white/8 bg-transparent text-slate-500 hover:border-white/18 hover:text-slate-300"
                )}
              >
                {tab === "personal" ? (
                  <span className="flex items-center gap-1.5"><User className="h-3 w-3" />Moja recenzja</span>
                ) : tab === "overview" ? (
                  <span className="flex items-center gap-1.5"><Film className="h-3 w-3" />O filmie</span>
                ) : (
                  <span className="flex items-center gap-1.5"><BookOpen className="h-3 w-3" />{tab}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto px-6 py-5">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {movie.metadata?.overview && (
                <p className="leading-relaxed text-slate-300">{movie.metadata.overview}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {movie.metadata?.genres && movie.metadata.genres.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-500">Gatunki</p>
                    <div className="flex flex-wrap gap-1">
                      {movie.metadata.genres.map((g) => (
                        <Badge key={g} variant="secondary" className="bg-violet-500/12 text-violet-300 border-violet-500/20 text-xs">
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {movie.metadata?.tags && movie.metadata.tags.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-500">Tagi</p>
                    <div className="flex flex-wrap gap-1">
                      {movie.metadata.tags.slice(0, 5).map((t) => (
                        <Badge key={t} variant="outline" className="border-white/10 text-slate-400 text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {movie.metadata?.cast && movie.metadata.cast.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-500">Obsada</p>
                  <p className="text-sm text-slate-400">{movie.metadata.cast.slice(0, 5).join(", ")}</p>
                </div>
              )}
              {(movie.metadata?.vote_average || movie.metadata?.tmdb_rating) && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-amber-400">
                    {Number(movie.metadata.vote_average ?? movie.metadata.tmdb_rating).toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">TMDB</span>
                </div>
              )}
            </div>
          )}

          {activeTab === "personal" && movie.reviews?.personal && (
            <div className="prose-sm prose-invert max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed text-slate-300">{movie.reviews.personal}</p>
            </div>
          )}

          {reviewTabs.includes(activeTab) && movie.reviews?.styles?.[activeTab] && (
            <div className="prose-sm prose-invert max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed text-slate-300">{movie.reviews.styles[activeTab]}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MovieVault() {
  const [db, setDb] = useState<VaultDB>({ movies: [] })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterMode>("all")
  const [view, setView] = useState<ViewMode>("grid")
  const [selected, setSelected] = useState<VaultMovie | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/movies/list")
        if (!res.ok) throw new Error("API unavailable")
        const data = await res.json()
        setDb({ movies: Array.isArray(data?.movies) ? data.movies : [], totalMovies: data?.total })
      } catch {
        try {
          const res = await fetch("/data/movies-vault/movies_db.json")
          const data: VaultDB = await res.json()
          setDb(data)
        } catch {
          setDb({ movies: [] })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let movies = db.movies
    if (search) {
      const q = search.toLowerCase()
      movies = movies.filter((m) =>
        m.title.toLowerCase().includes(q) ||
        (m.metadata?.director ?? "").toLowerCase().includes(q) ||
        (m.metadata?.genres ?? []).join(" ").toLowerCase().includes(q) ||
        (m.metadata?.tags ?? []).join(" ").toLowerCase().includes(q)
      )
    }
    if (filter === "has-reviews") {
      movies = movies.filter((m) => Object.keys(m.reviews?.styles || {}).length > 0)
    } else if (filter === "has-personal") {
      movies = movies.filter((m) => !!m.reviews?.personal)
    }
    return movies
  }, [db.movies, search, filter])

  const withReviews = useMemo(
    () => db.movies.filter((m) => Object.keys(m.reviews?.styles || {}).length > 0).length,
    [db.movies]
  )

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setSelected(null)
  }, [])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#03040b]">
      {/* Header */}
      <div className="shrink-0 border-b border-white/6 bg-[#03040b]/90 px-4 py-3 backdrop-blur-xl lg:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-emerald-400" />
            <h2 className="font-black tracking-tight text-white">JIMBO Film Vault</h2>
          </div>

          <div className="relative flex-1" style={{ minWidth: "180px", maxWidth: "400px" }}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj filmów..."
              className="h-9 border-white/8 bg-white/5 pl-9 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
          </div>

          <span className="text-xs text-slate-500">
            {db.movies.length} filmów · {withReviews} z recenzjami · {filtered.length} widocznych
          </span>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView("grid")}
              className={cn("h-8 w-8", view === "grid" ? "bg-emerald-500/15 text-emerald-400" : "text-slate-500 hover:text-slate-300")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView("list")}
              className={cn("h-8 w-8", view === "list" ? "bg-emerald-500/15 text-emerald-400" : "text-slate-500 hover:text-slate-300")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {(["all", "has-reviews", "has-personal"] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-all",
                filter === f
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                  : "border-white/8 text-slate-500 hover:border-white/18 hover:text-slate-300"
              )}
            >
              {f === "all" ? "Wszystkie" : f === "has-reviews" ? "Z recenzjami" : "Moje recenzje"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-600">
            <Film className="h-12 w-12 opacity-30" />
            <p className="text-sm">Nie znaleziono filmów</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
            {filtered.map((movie) => (
              <MovieCard key={movie.id} movie={movie} view="grid" onClick={() => setSelected(movie)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((movie) => (
              <MovieCard key={movie.id} movie={movie} view="list" onClick={() => setSelected(movie)} />
            ))}
          </div>
        )}
      </div>

      <MovieModal movie={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  )
}
