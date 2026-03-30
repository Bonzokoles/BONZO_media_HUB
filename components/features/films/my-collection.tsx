"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import ReactPlayer from "react-player";
import { cn } from "@/lib/utils";
import { buildTmdbUrl, fetchJsonWithFallback } from "@/lib/remote-media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { moviesCollectionComplete, movieStats } from "@/lib/movies-data-synced";
import {
  Search,
  Grid,
  List,
  Star,
  BookOpen,
  User,
  Film,
  X,
  Clock,
  Loader2,
  Video,
  Calendar,
} from "lucide-react";

interface MovieMetadata {
  director?: string;
  year?: number | null;
  genres?: string[];
  tags?: string[];
  category?: string | null;
  overview?: string | null;
  runtime?: number;
  tmdb_poster?: string | null;
  tmdb_backdrop?: string | null;
  tmdb_id?: number;
  tmdb_rating?: number;
  vote_average?: number;
  cast?: string[];
}

interface MovieReviews {
  personal?: string | null;
  styles?: Record<string, string>;
}

interface VaultMovie {
  id: string;
  title: string;
  metadata: MovieMetadata;
  reviews: MovieReviews;
}

interface VaultDB {
  movies: VaultMovie[];
}

interface TrailerVideo {
  key: string;
  site: string;
  type: string;
}

interface TmdbFullDetails {
  id?: number;
  tagline?: string;
  budget?: number;
  revenue?: number;
  runtime?: number;
  director?: string;
  overview?: string;
  production_countries?: { name: string }[];
  cast: { name: string; character: string; profile_path: string | null }[];
  keywords: string[];
}

type FilterMode = "all" | "has-reviews" | "has-personal";
type ViewMode = "grid" | "list";

function resolveImageUrl(
  path: string | null | undefined,
  size: "w342" | "w500" | "w1280" = "w500",
): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `https://image.tmdb.org/t/p/${size}${path}`;
  return `https://image.tmdb.org/t/p/${size}/${path}`;
}

function TrailerPlayer({
  tmdbId,
  onClose,
  theaterMode = false,
}: {
  tmdbId: number;
  onClose: () => void;
  theaterMode?: boolean;
}) {
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    fetchJsonWithFallback<{ results?: TrailerVideo[] }>(
      buildTmdbUrl({ action: "videos", id: tmdbId, mediaType: "movie" }),
      `/api/tmdb?action=videos&id=${tmdbId}&mediaType=movie`,
    )
      .then((data) => {
        const videos = data.results ?? [];
        const trailer =
          videos.find((v) => v.type === "Trailer" && v.site === "YouTube") ??
          videos.find((v) => v.site === "YouTube");

        if (!trailer) {
          setError("Brak dostępnego trailera dla tego tytułu.");
          return;
        }

        setTrailerKey(trailer.key);
      })
      .catch(() => setError("Błąd pobierania trailera."))
      .finally(() => setLoading(false));
  }, [tmdbId]);

  return (
    <div
      className={cn("relative w-full bg-black", theaterMode ? "h-full" : "")}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className={cn(
          "absolute right-2 top-2 z-20 h-8 w-8 border border-border bg-background/80 text-foreground",
          theaterMode &&
            "right-4 top-4 border-white/30 bg-black/60 text-white hover:bg-black/80",
        )}
      >
        <X className="h-4 w-4" />
      </Button>

      {loading && (
        <div
          className={cn(
            "flex items-center justify-center",
            theaterMode ? "h-full" : "h-48",
          )}
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground uppercase tracking-wider">
            LOADING_TRAILER...
          </span>
        </div>
      )}

      {!loading && error && (
        <div
          className={cn(
            "flex items-center justify-center text-sm text-muted-foreground",
            theaterMode ? "h-full" : "h-48",
          )}
        >
          <Video className="mr-2 h-5 w-5" />
          {error}
        </div>
      )}

      {!loading && trailerKey && (
        <div
          className={cn(
            "w-full bg-black",
            theaterMode ? "h-full" : "aspect-video",
          )}
        >
          <ReactPlayer
            src={`https://www.youtube.com/watch?v=${trailerKey}`}
            playing
            controls
            width="100%"
            height="100%"
          />
        </div>
      )}
    </div>
  );
}

function MoviePoster({
  movie,
  className,
}: {
  movie: VaultMovie;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const poster = resolveImageUrl(movie.metadata?.tmdb_poster, "w342");

  if (!poster || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-muted to-secondary/50",
          className,
        )}
      >
        <Film className="h-6 w-6 text-muted-foreground/60" />
      </div>
    );
  }

  return (
    <img
      src={poster}
      alt={movie.title}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
      crossOrigin="anonymous"
    />
  );
}

function MovieCard({
  movie,
  view,
  onClick,
}: {
  movie: VaultMovie;
  view: ViewMode;
  onClick: () => void;
}) {
  const reviewCount = Object.keys(movie.reviews?.styles || {}).length;
  const rating = movie.metadata?.vote_average ?? movie.metadata?.tmdb_rating;

  if (view === "list") {
    return (
      <button
        onClick={onClick}
        className="flex w-full items-center gap-3 border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:bg-card/80"
      >
        <div className="h-16 w-10 shrink-0 overflow-hidden border border-border">
          <MoviePoster movie={movie} className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold uppercase tracking-wide text-foreground">
            {movie.title}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {movie.metadata?.director || "N/A"} ·{" "}
            {movie.metadata?.year || "N/A"}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {rating ? (
            <span className="flex items-center gap-1 font-bold text-yellow-400">
              <Star className="h-3.5 w-3.5 fill-yellow-400" />
              {Number(rating).toFixed(1)}
            </span>
          ) : null}
          {reviewCount > 0 ? (
            <span className="border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
              {reviewCount} REC
            </span>
          ) : null}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden border border-border bg-card text-left transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
    >
      {rating ? (
        <div className="absolute right-1.5 top-1.5 z-10 flex items-center gap-0.5 border border-yellow-500/30 bg-background/90 px-1 py-0.5 text-xs font-bold text-yellow-400">
          <Star className="h-2.5 w-2.5 fill-yellow-400" />
          {Number(rating).toFixed(1)}
        </div>
      ) : null}

      {reviewCount > 0 ? (
        <div className="absolute left-1.5 top-1.5 z-10 border border-primary/40 bg-primary/20 px-1 py-0.5 text-[10px] font-bold text-primary">
          {reviewCount} REC
        </div>
      ) : null}

      <div className="aspect-[2/3] w-full overflow-hidden bg-muted">
        <MoviePoster
          movie={movie}
          className="h-full w-full transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="truncate text-xs font-bold uppercase tracking-wide">
            {movie.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {movie.metadata?.director || "N/A"}
          </p>
        </div>
      </div>

      <div className="p-1.5 lg:hidden">
        <p className="truncate text-xs font-bold uppercase tracking-wide">
          {movie.title}
        </p>
      </div>
    </button>
  );
}

function MovieModal({
  movie,
  open,
  onClose,
}: {
  movie: VaultMovie | null;
  open: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showTrailer, setShowTrailer] = useState(false);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdb, setTmdb] = useState<TmdbFullDetails | null>(null);

  useEffect(() => {
    if (!movie) return;

    setActiveTab("overview");
    setShowTrailer(false);
    setTmdb(null);

    const fetchDetails = async (tmdbId: number) => {
      setTmdbLoading(true);
      try {
        const d = await fetchJsonWithFallback<Record<string, unknown>>(
          buildTmdbUrl({ action: "details", id: tmdbId, mediaType: "movie" }),
          `/api/tmdb?action=details&id=${tmdbId}&mediaType=movie`,
        );

        setTmdb({
          id: tmdbId,
          tagline: (d.tagline as string) || "",
          budget: d.budget as number,
          revenue: d.revenue as number,
          runtime: d.runtime as number,
          director:
            (
              d as { credits?: { crew?: { job: string; name: string }[] } }
            ).credits?.crew?.find(
              (c: { job: string; name: string }) => c.job === "Director",
            )?.name || movie.metadata?.director,
          overview: (d.overview as string) || movie.metadata?.overview || "",
          production_countries: d.production_countries as
            | { name: string }[]
            | undefined,
          cast: (
            (
              d as {
                credits?: {
                  cast?: {
                    name: string;
                    character: string;
                    profile_path: string | null;
                  }[];
                };
              }
            ).credits?.cast || []
          )
            .slice(0, 15)
            .map(
              (c: {
                name: string;
                character: string;
                profile_path: string | null;
              }) => ({
                name: c.name,
                character: c.character,
                profile_path: c.profile_path,
              }),
            ),
          keywords: (
            ((
              d as {
                keywords?: {
                  keywords?: { name: string }[];
                  results?: { name: string }[];
                };
              }
            ).keywords?.keywords ||
              (d as { keywords?: { results?: { name: string }[] } }).keywords
                ?.results ||
              []) as {
              name: string;
            }[]
          ).map((k) => k.name),
        });
      } catch {
        // brak TMDB fallback
      } finally {
        setTmdbLoading(false);
      }
    };

    if (movie.metadata?.tmdb_id) {
      fetchDetails(movie.metadata.tmdb_id);
      return;
    }

    const query = `${movie.title} ${movie.metadata?.year || ""}`.trim();
    fetchJsonWithFallback<{ results?: { id: number }[] }>(
      buildTmdbUrl({ action: "search", query, mediaType: "movie" }),
      `/api/tmdb?action=search&query=${encodeURIComponent(query)}&mediaType=movie`,
    )
      .then((data) => {
        const hit = Array.isArray(data.results) ? data.results[0] : undefined;
        if (hit?.id) fetchDetails(hit.id);
      })
      .catch(() => {
        // fallback bez TMDB
      });
  }, [movie]);

  if (!movie) return null;

  const reviewTabs = Object.keys(movie.reviews?.styles || {});
  const tabs = [
    { id: "overview", label: "OVERVIEW" },
    { id: "obsada", label: "OBSADA" },
    { id: "ciekawostki", label: "CIEKAWOSTKI" },
    ...reviewTabs.map((id) => ({ id, label: id.toUpperCase() })),
    ...(movie.reviews?.personal ? [{ id: "personal", label: "PERSONAL" }] : []),
  ];

  const resolvedTmdbId = movie.metadata?.tmdb_id ?? tmdb?.id;
  const displayDirector = tmdb?.director || movie.metadata?.director || "N/A";
  const displayRuntime = tmdb?.runtime || movie.metadata?.runtime || 0;
  const displayOverview = tmdb?.overview || movie.metadata?.overview || "";
  const displayCast = tmdb?.cast?.length
    ? tmdb.cast
    : (movie.metadata?.cast || []).map((name) => ({
        name,
        character: "",
        profile_path: null,
      }));

  const backdrop = tmdb?.id
    ? resolveImageUrl(
        (tmdb as unknown as { backdrop_path?: string }).backdrop_path,
        "w1280",
      )
    : movie.metadata?.tmdb_backdrop || null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-h-[94vh] w-[96vw]! max-w-[96vw]! sm:max-w-[96vw]! xl:max-w-[1400px]! overflow-hidden p-0 font-mono"
        style={{ width: "min(96vw, 1400px)", maxWidth: "min(96vw, 1400px)" }}
      >
        <DialogTitle className="sr-only">
          {showTrailer
            ? `Trailer filmu ${movie.title}`
            : `Szczegóły filmu ${movie.title}`}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {showTrailer
            ? `Modal odtwarzacza trailera dla filmu ${movie.title}.`
            : `Modal biblioteki filmowej ze szczegółami i recenzjami filmu ${movie.title}.`}
        </DialogDescription>
        {showTrailer && resolvedTmdbId ? (
          <div className="relative h-[86vh] w-full overflow-hidden bg-black">
            <TrailerPlayer
              tmdbId={resolvedTmdbId}
              onClose={() => setShowTrailer(false)}
              theaterMode
            />
          </div>
        ) : (
          <>
            <div className="relative h-52 w-full overflow-hidden sm:h-60">
              {backdrop && (
                <img
                  src={backdrop}
                  alt={movie.title}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                  loading="eager"
                  onError={(e) => {
                    console.warn("Backdrop failed to load:", backdrop);
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />

              <div className="absolute left-4 top-3 space-y-0.5 text-xs text-primary/50">
                <div>[FILM_VAULT] {movie.title}</div>
                {resolvedTmdbId ? <div>[TMDB_ID] {resolvedTmdbId}</div> : null}
                {tmdbLoading ? (
                  <div className="flex items-center gap-1">
                    <Loader2 className="h-2.5 w-2.5 animate-spin" /> fetching...
                  </div>
                ) : null}
              </div>

              <Button
                size="sm"
                disabled={!resolvedTmdbId}
                className="absolute right-4 top-3 gap-2 border border-red-500/50 bg-red-950/80 text-red-400 hover:bg-red-900/80 uppercase tracking-wider"
                onClick={() => setShowTrailer(true)}
              >
                <Video className="h-4 w-4" />
                {resolvedTmdbId ? "TRAILER" : "TRAILER N/A"}
              </Button>

              <div className="absolute bottom-3 left-4 right-4">
                <h2 className="text-xl font-black uppercase tracking-wider text-foreground drop-shadow-lg sm:text-2xl">
                  {movie.title}
                </h2>
                {tmdb?.tagline ? (
                  <p className="mt-0.5 text-xs italic text-muted-foreground">
                    "{tmdb.tagline}"
                  </p>
                ) : null}
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {movie.metadata?.year || "N/A"}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {displayDirector}
                  </span>
                  {displayRuntime > 0 ? (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {displayRuntime} min
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex overflow-x-auto border-b border-border scrollbar-none">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "shrink-0 border-b-2 px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors",
                    activeTab === tab.id
                      ? tab.id === "personal"
                        ? "border-accent text-accent"
                        : "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-5">
              {activeTab === "overview" ? (
                <div className="space-y-5">
                  <div>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                      {">"} SYNOPSIS
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {displayOverview || "Brak opisu."}
                    </p>
                  </div>

                  {movie.metadata?.genres?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {movie.metadata.genres.map((g) => (
                        <span
                          key={g}
                          className="border border-chart-2/40 bg-chart-2/10 px-2 py-0.5 text-xs uppercase text-chart-2"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {displayCast.length > 0 ? (
                    <div>
                      <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                        {">"} GŁÓWNA OBSADA
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {displayCast.slice(0, 8).map((a) => (
                          <span
                            key={a.name}
                            className="border border-border bg-muted px-2 py-0.5 text-xs"
                          >
                            {a.name}
                            {a.character ? (
                              <span className="text-muted-foreground">
                                {" "}
                                — {a.character}
                              </span>
                            ) : null}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {activeTab === "obsada" ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">
                    {">"} PEŁNA OBSADA
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {displayCast.map((actor) => (
                      <div
                        key={actor.name}
                        className="flex items-center gap-2 border border-border bg-card p-2"
                      >
                        {actor.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${actor.profile_path}`}
                            alt={actor.name}
                            className="h-10 w-10 shrink-0 object-cover"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-muted text-sm font-bold text-muted-foreground">
                            {actor.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold">
                            {actor.name}
                          </p>
                          {actor.character ? (
                            <p className="truncate text-xs text-muted-foreground">
                              {actor.character}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeTab === "ciekawostki" ? (
                <div className="space-y-5">
                  {tmdb?.keywords?.length ? (
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
                        {">"} SŁOWA KLUCZOWE
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {tmdb.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="border border-chart-2/30 bg-chart-2/10 px-2 py-0.5 text-xs text-chart-2"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {tmdb?.budget ||
                  tmdb?.revenue ||
                  tmdb?.production_countries?.length ? (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary">
                        {">"} DANE PRODUKCYJNE
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                        {tmdb?.budget ? (
                          <div className="border border-border bg-muted/30 p-2">
                            <p className="text-muted-foreground uppercase tracking-wider">
                              Budżet
                            </p>
                            <p className="font-bold text-foreground">
                              ${(tmdb.budget / 1e6).toFixed(1)}M
                            </p>
                          </div>
                        ) : null}
                        {tmdb?.revenue ? (
                          <div className="border border-border bg-muted/30 p-2">
                            <p className="text-muted-foreground uppercase tracking-wider">
                              Box office
                            </p>
                            <p className="font-bold text-foreground">
                              ${(tmdb.revenue / 1e6).toFixed(1)}M
                            </p>
                          </div>
                        ) : null}
                        {tmdb?.production_countries?.map((c) => (
                          <div
                            key={c.name}
                            className="border border-border bg-muted/30 p-2"
                          >
                            <p className="text-muted-foreground uppercase tracking-wider">
                              Kraj
                            </p>
                            <p className="font-bold text-foreground">
                              {c.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {activeTab === "personal" && movie.reviews?.personal ? (
                <div className="space-y-4">
                  <div className="border-l-4 border-accent bg-accent/10 p-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-accent">
                      {">"} PERSONAL_REVIEW
                    </p>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {movie.reviews.personal}
                  </p>
                </div>
              ) : null}

              {reviewTabs.includes(activeTab) &&
              movie.reviews?.styles?.[activeTab] ? (
                <div className="space-y-4">
                  <div className="border-l-4 border-primary bg-muted/40 p-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">
                      {">"} GIGACHAD REVIEW: {activeTab}
                    </p>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {movie.reviews.styles[activeTab]}
                  </p>
                </div>
              ) : null}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function MovieVault() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [view, setView] = useState<ViewMode>("grid");
  const [selected, setSelected] = useState<VaultMovie | null>(null);

  const db = useMemo(
    () => ({ movies: moviesCollectionComplete }) as VaultDB,
    [],
  );

  const filtered = useMemo(() => {
    let movies = db.movies;

    if (search) {
      const q = search.toLowerCase();
      movies = movies.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.metadata?.director ?? "").toLowerCase().includes(q) ||
          (m.metadata?.genres ?? []).join(" ").toLowerCase().includes(q) ||
          (m.metadata?.tags ?? []).join(" ").toLowerCase().includes(q),
      );
    }

    if (filter === "has-reviews") {
      movies = movies.filter(
        (m) => Object.keys(m.reviews?.styles || {}).length > 0,
      );
    } else if (filter === "has-personal") {
      movies = movies.filter((m) => !!m.reviews?.personal);
    }

    return movies;
  }, [db.movies, search, filter]);

  const withReviews = useMemo(
    () =>
      db.movies.filter((m) => Object.keys(m.reviews?.styles || {}).length > 0)
        .length,
    [db.movies],
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setSelected(null);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex h-full flex-col font-mono">
      <div className="border-b border-border px-4 py-3 lg:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-widest text-primary">
              ARCHIWUM_FILMÓW
            </h2>
          </div>

          <div
            className="relative flex-1"
            style={{ minWidth: "180px", maxWidth: "420px" }}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="> szukaj tytułu, reżysera, tagów..."
              className="h-9 pl-9 text-sm"
            />
          </div>

          <span className="text-xs text-muted-foreground">
            {db.movies.length} filmów · {withReviews} z recenzjami ·{" "}
            {filtered.length} widocznych
          </span>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView("grid")}
              className={cn(
                "h-8 w-8 border",
                view === "grid"
                  ? "border-primary bg-primary/20"
                  : "border-transparent",
              )}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView("list")}
              className={cn(
                "h-8 w-8 border",
                view === "list"
                  ? "border-primary bg-primary/20"
                  : "border-transparent",
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {(["all", "has-reviews", "has-personal"] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "border px-2.5 py-0.5 text-xs uppercase tracking-wider transition-all",
                filter === f
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50",
              )}
            >
              {f === "all"
                ? "ALL"
                : f === "has-reviews"
                  ? "Z RECENZJAMI"
                  : "MOJE RECENZJE"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-5">
        {filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <Film className="h-12 w-12 opacity-30" />
            <p className="text-sm">Nie znaleziono filmów</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filtered.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                view="grid"
                onClick={() => setSelected(movie)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                view="list"
                onClick={() => setSelected(movie)}
              />
            ))}
          </div>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          [RESULTS] {filtered.length}/{db.movies.length} · [MODE]{" "}
          {view.toUpperCase()}
        </p>
      </div>

      <MovieModal
        movie={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
