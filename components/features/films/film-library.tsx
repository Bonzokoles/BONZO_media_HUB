"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useMedia } from "@/lib/media-context";
import {
  moviesCollection,
  reviewStyles,
  allGenres,
  katalogCategories,
  type Movie,
} from "@/lib/movies-data";
import {
  buildR2AssetUrl,
  buildReviewUrl,
  buildTmdbUrl,
  fetchJsonWithFallback,
} from "@/lib/remote-media";
import ReactPlayer from "react-player";
import { cn } from "@/lib/utils";
import {
  Search,
  Star,
  Heart,
  X,
  Calendar,
  User,
  Film as FilmIcon,
  Grid,
  List,
  Clock,
  ChevronRight,
  MessageSquare,
  TrendingUp,
  Tv,
  Library,
  Folder,
  Loader2,
  Video,
  ChevronLeft,
  SlidersHorizontal,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MovieVault } from "./my-collection";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = "collection" | "katalog" | "top-movies" | "top-tv" | "browse";
type ReviewTab = string;

interface TmdbResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  media_type?: string;
}

interface TrailerVideo {
  key: string;
  name: string;
  site: string;
  type: string;
}

interface ReviewPayload {
  reviews?: Record<string, string>;
}

// ─── Poster component with TMDB fallback ─────────────────────────────────────

function FilmPoster({
  film,
  className,
  imgClassName,
}: {
  film: { id?: string; title: string; posterUrl?: string; tmdbId?: number };
  className?: string;
  imgClassName?: string;
}) {
  const posterCandidates = useMemo(() => {
    const candidates: string[] = [];

    if (film.posterUrl) candidates.push(film.posterUrl);

    if (film.tmdbId) {
      candidates.push(buildR2AssetUrl(`movies/posters/${film.tmdbId}.webp`));
      candidates.push(buildR2AssetUrl(`movies/posters/${film.tmdbId}.jpg`));
      candidates.push(buildR2AssetUrl(`movies/posters/${film.tmdbId}.png`));
    }

    if (film.id) {
      candidates.push(buildR2AssetUrl(`movies/posters/${film.id}.webp`));
      candidates.push(buildR2AssetUrl(`movies/posters/${film.id}.jpg`));
      candidates.push(buildR2AssetUrl(`movies/posters/${film.id}.png`));
    }

    return [...new Set(candidates)];
  }, [film.id, film.posterUrl, film.tmdbId]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [posterCandidates]);

  const src = posterCandidates[activeIndex];

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-muted to-secondary/50",
          className,
        )}
      >
        <div className="text-center">
          <FilmIcon className="mx-auto mb-1 h-6 w-6 text-muted-foreground/50" />
          <p className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground line-clamp-2">
            {film.title}
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={film.title}
      className={imgClassName}
      crossOrigin="anonymous"
      onError={() => setActiveIndex((i) => i + 1)}
    />
  );
}

// ─── Trailer Player ───────────────────────────────────────────────────────────

function TrailerPlayer({
  tmdbId,
  mediaType = "movie",
  onClose,
  theaterMode = false,
}: {
  tmdbId: number;
  mediaType?: string;
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
      buildTmdbUrl({ action: "videos", id: tmdbId, mediaType }),
      `/api/tmdb?action=videos&id=${tmdbId}&mediaType=${mediaType}`,
    )
      .then((data) => {
        const videos: TrailerVideo[] = data.results ?? [];
        const trailer =
          videos.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
          videos.find((v) => v.site === "YouTube");
        if (trailer) {
          setTrailerKey(trailer.key);
        } else {
          setError("Brak dostępnego trailera dla tego tytułu.");
        }
      })
      .catch(() => setError("Błąd pobierania trailera."))
      .finally(() => setLoading(false));
  }, [tmdbId, mediaType]);

  return (
    <div
      className={cn("relative w-full bg-black", theaterMode ? "h-full" : "")}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute right-2 top-2 z-20 h-8 w-8 border border-border bg-background/80 text-foreground",
          theaterMode &&
            "right-4 top-4 border-white/30 bg-black/60 text-white hover:bg-black/80",
        )}
        onClick={onClose}
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
      {error && !loading && (
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
      {trailerKey && !loading && (
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

          {theaterMode && (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-[18%] bg-gradient-to-r from-black/90 via-black/65 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-[18%] bg-gradient-to-l from-black/90 via-black/65 to-transparent" />
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Film Detail Modal ────────────────────────────────────────────────────────

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
  recommendations: {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    vote_average: number;
  }[];
}

function FilmModal({
  film,
  onClose,
  personalReviews,
  onSaveReview,
  favorites,
  onToggleFavorite,
}: {
  film: Movie | null;
  onClose: () => void;
  personalReviews: Record<string, string>;
  onSaveReview: (filmId: string, review: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<ReviewTab>("overview");
  const [personalReview, setPersonalReview] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [tmdb, setTmdb] = useState<TmdbFullDetails | null>(null);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [remoteReviews, setRemoteReviews] = useState<Record<string, string>>(
    {},
  );

  const enriched = film;
  const mergedReviews = useMemo(
    () => ({ ...(remoteReviews || {}), ...(enriched?.reviews || {}) }),
    [remoteReviews, enriched?.reviews],
  );

  useEffect(() => {
    if (!enriched) return;
    setRemoteReviews({});

    fetch(buildReviewUrl(enriched.title, enriched.year))
      .then(
        async (r): Promise<ReviewPayload | null> =>
          r.ok ? ((await r.json()) as ReviewPayload) : null,
      )
      .then((payload) => {
        if (payload?.reviews) {
          setRemoteReviews(payload.reviews);
        }
      })
      .catch(() => {
        // fallback: zostają lokalne recenzje
      });
  }, [enriched?.id, enriched?.title, enriched?.year]);

  useEffect(() => {
    if (!enriched) return;
    setPersonalReview(
      personalReviews[enriched.id] || enriched.personalReview || "",
    );
    setActiveTab("overview");
    setIsEditing(false);
    setShowTrailer(false);
    setTmdb(null);

    // Zawsze szukaj po TMDB — albo przez tmdbId, albo przez wyszukiwanie tytułu
    const fetchDetails = async (tmdbId: number, mediaType = "movie") => {
      setTmdbLoading(true);
      try {
        const d = await fetchJsonWithFallback<Record<string, unknown>>(
          buildTmdbUrl({ action: "details", id: tmdbId, mediaType }),
          `/api/tmdb?action=details&id=${tmdbId}&mediaType=${mediaType}`,
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
            )?.name || enriched.director,
          overview: (d.overview as string) || enriched.overview,
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
            (
              d as {
                keywords?: {
                  keywords?: { name: string }[];
                  results?: { name: string }[];
                };
              }
            ).keywords?.keywords ||
            (d as { keywords?: { results?: { name: string }[] } }).keywords
              ?.results ||
            []
          ).map((k: { name: string }) => k.name),
          recommendations: (
            (
              d as {
                recommendations?: {
                  results?: {
                    id: number;
                    title?: string;
                    name?: string;
                    poster_path: string | null;
                    vote_average: number;
                  }[];
                };
              }
            ).recommendations?.results || []
          ).slice(0, 6),
        });
      } catch {}
      setTmdbLoading(false);
    };

    if (enriched.tmdbId) {
      // Wiemy ID — pobieramy od razu
      const mt = enriched.id.startsWith("tv_") ? "tv" : "movie";
      fetchDetails(enriched.tmdbId, mt);
    } else {
      // Szukamy po tytule
      const q = encodeURIComponent(
        `${enriched.title} ${enriched.year || ""}`.trim(),
      );
      fetchJsonWithFallback<{ results?: { id: number }[] }>(
        buildTmdbUrl({
          action: "search",
          query: `${enriched.title} ${enriched.year || ""}`.trim(),
          mediaType: "movie",
        }),
        `/api/tmdb?action=search&query=${q}&mediaType=movie`,
      )
        .then((d) => {
          const hit = Array.isArray(d.results) ? d.results[0] : undefined;
          if (hit) fetchDetails(hit.id);
        })
        .catch(() => {});
    }
  }, [enriched?.id]);

  const handleSave = () => {
    if (!enriched) return;
    onSaveReview(enriched.id, personalReview);
    setIsEditing(false);
  };

  if (!enriched) return null;

  const displayCast = tmdb?.cast?.length
    ? tmdb.cast
    : enriched.cast.map((name) => ({
        name,
        character: "",
        profile_path: null,
      }));
  const displayKeywords = tmdb?.keywords?.length
    ? tmdb.keywords
    : enriched.keywords;
  const displayOverview = tmdb?.overview || enriched.overview;
  const displayRuntime = tmdb?.runtime || enriched.runtime;
  const displayDirector = tmdb?.director || enriched.director;
  const resolvedTmdbId = enriched.tmdbId ?? tmdb?.id;

  const tabs = [
    { id: "overview", label: "OVERVIEW" },
    { id: "obsada", label: "OBSADA" },
    { id: "ciekawostki", label: "CIEKAWOSTKI" },
    ...reviewStyles
      .filter((s) => mergedReviews[s.id])
      .map((s) => ({ id: s.id, label: s.name })),
    { id: "personal", label: "PERSONAL" },
  ];

  return (
    <Dialog open={!!enriched} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[94vh] w-[96vw]! max-w-[96vw]! sm:max-w-[96vw]! xl:max-w-[2400px]! overflow-hidden p-0 font-mono"
        style={{ width: "min(96vw, 2400px)", maxWidth: "min(96vw, 2400px)" }}
      >
        {showTrailer && resolvedTmdbId ? (
          <div className="relative h-[90vh] w-full overflow-hidden bg-black">
            <TrailerPlayer
              tmdbId={resolvedTmdbId}
              onClose={() => setShowTrailer(false)}
              theaterMode
            />
          </div>
        ) : (
          <>
            {/* Hero / Trailer */}
            <div className="relative h-52 w-full overflow-hidden sm:h-60">
              {(enriched.backdropUrl || enriched.posterUrl) && (
                <img
                  src={enriched.backdropUrl || enriched.posterUrl}
                  alt={enriched.title}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />

              {/* Terminal tag */}
              <div className="absolute left-4 top-3 space-y-0.5 text-xs text-primary/50">
                <div>[FILM_LIBRARY] {enriched.id}</div>
                {enriched.tmdbId && <div>[TMDB_ID] {enriched.tmdbId}</div>}
                {tmdbLoading && (
                  <div className="flex items-center gap-1">
                    <Loader2 className="h-2.5 w-2.5 animate-spin" /> fetching...
                  </div>
                )}
              </div>

              {/* Trailer button */}
              <Button
                size="sm"
                disabled={!resolvedTmdbId}
                className="absolute right-4 top-3 gap-2 border border-red-500/50 bg-red-950/80 text-red-400 hover:bg-red-900/80 uppercase tracking-wider"
                onClick={() => setShowTrailer(true)}
              >
                <Video className="h-4 w-4" />
                {resolvedTmdbId ? "TRAILER" : "TRAILER N/A"}
              </Button>

              {/* Title */}
              <div className="absolute bottom-3 left-4 right-4">
                <h2 className="text-xl font-black uppercase tracking-wider text-foreground drop-shadow-lg sm:text-2xl">
                  {enriched.title}
                </h2>
                {tmdb?.tagline && (
                  <p className="mt-0.5 text-xs italic text-muted-foreground">
                    "{tmdb.tagline}"
                  </p>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {enriched.year || "N/A"}
                  </span>
                  {displayDirector && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {displayDirector}
                    </span>
                  )}
                  {displayRuntime > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {displayRuntime} min
                    </span>
                  )}
                  {enriched.rating > 0 && (
                    <span className="flex items-center gap-1 font-bold text-yellow-400">
                      <Star className="h-3 w-3 fill-yellow-400" />
                      {enriched.rating.toFixed(1)}
                    </span>
                  )}
                  {tmdb?.production_countries?.[0] && (
                    <span className="text-muted-foreground">
                      {tmdb.production_countries.map((c) => c.name).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
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

            {/* Content */}
            <div className="max-h-[52vh] overflow-y-auto p-5">
              {/* OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-5">
                  <div>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                      {">"} SYNOPSIS
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {displayOverview}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {enriched.genres.map((g) => (
                      <span
                        key={g}
                        className="border border-chart-2/40 bg-chart-2/10 px-2 py-0.5 text-xs uppercase text-chart-2"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  {(tmdb?.budget || tmdb?.revenue) && (
                    <div className="flex gap-6 text-xs text-muted-foreground">
                      {tmdb.budget ? (
                        <span>
                          Budżet:{" "}
                          <strong className="text-foreground">
                            ${(tmdb.budget / 1e6).toFixed(0)}M
                          </strong>
                        </span>
                      ) : null}
                      {tmdb.revenue ? (
                        <span>
                          Przychód:{" "}
                          <strong className="text-foreground">
                            ${(tmdb.revenue / 1e6).toFixed(0)}M
                          </strong>
                        </span>
                      ) : null}
                    </div>
                  )}
                  {/* Top 5 cast preview */}
                  {displayCast.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                        {">"} GŁÓWNA OBSADA
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {displayCast.slice(0, 6).map((a) => (
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
                        {displayCast.length > 6 && (
                          <button
                            onClick={() => setActiveTab("obsada")}
                            className="border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary hover:bg-primary/20"
                          >
                            +{displayCast.length - 6} więcej →
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* OBSADA */}
              {activeTab === "obsada" && (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">
                    {">"} PEŁNA OBSADA
                  </p>
                  {tmdbLoading && !tmdb && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Ładowanie z
                      TMDB...
                    </div>
                  )}
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
                            className="h-10 w-10 shrink-0 rounded-none object-cover"
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
                          {actor.character && (
                            <p className="truncate text-xs text-muted-foreground">
                              {actor.character}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CIEKAWOSTKI */}
              {activeTab === "ciekawostki" && (
                <div className="space-y-5">
                  {tmdbLoading && !tmdb && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Ładowanie z
                      TMDB...
                    </div>
                  )}
                  {/* Keywords */}
                  {displayKeywords.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
                        {">"} SŁOWA KLUCZOWE / TEMATYKA
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {displayKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="border border-chart-2/30 bg-chart-2/10 px-2 py-0.5 text-xs text-chart-2"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Production facts */}
                  {tmdb && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary">
                        {">"} DANE PRODUKCYJNE
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                        {tmdb.budget ? (
                          <div className="border border-border bg-muted/30 p-2">
                            <p className="text-muted-foreground uppercase tracking-wider">
                              Budżet
                            </p>
                            <p className="font-bold text-foreground">
                              ${(tmdb.budget / 1e6).toFixed(1)}M
                            </p>
                          </div>
                        ) : null}
                        {tmdb.revenue ? (
                          <div className="border border-border bg-muted/30 p-2">
                            <p className="text-muted-foreground uppercase tracking-wider">
                              Box office
                            </p>
                            <p className="font-bold text-foreground">
                              ${(tmdb.revenue / 1e6).toFixed(1)}M
                            </p>
                          </div>
                        ) : null}
                        {tmdb.production_countries?.map((c) => (
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
                        {enriched.runtime > 0 && (
                          <div className="border border-border bg-muted/30 p-2">
                            <p className="text-muted-foreground uppercase tracking-wider">
                              Czas
                            </p>
                            <p className="font-bold text-foreground">
                              {enriched.runtime} min
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Recommendations */}
                  {tmdb?.recommendations && tmdb.recommendations.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
                        {">"} PODOBNE FILMY
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {tmdb.recommendations.map((r) => (
                          <div key={r.id} className="shrink-0 w-20">
                            {r.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w154${r.poster_path}`}
                                alt={r.title || r.name || ""}
                                className="h-28 w-20 object-cover border border-border"
                                crossOrigin="anonymous"
                              />
                            ) : (
                              <div className="flex h-28 w-20 items-center justify-center border border-border bg-muted">
                                <FilmIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {r.title || r.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Review tabs — GIGACHAD */}
              {reviewStyles.map((style) =>
                activeTab === style.id && mergedReviews[style.id] ? (
                  <div key={style.id} className="space-y-4">
                    <div className="border-l-4 border-primary bg-muted/40 p-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary">
                        {">"} GIGACHAD REVIEW: {style.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {style.description}
                      </p>
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                      {mergedReviews[style.id]}
                    </div>
                  </div>
                ) : null,
              )}

              {/* Personal review */}
              {activeTab === "personal" && (
                <div className="space-y-4">
                  <div className="border-l-4 border-accent bg-accent/10 p-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-accent">
                      {">"} PERSONAL_REVIEW
                    </p>
                  </div>
                  {isEditing ? (
                    <div className="space-y-3">
                      <Textarea
                        value={personalReview}
                        onChange={(e) => setPersonalReview(e.target.value)}
                        placeholder="> Twoje notatki i przemyślenia..."
                        className="min-h-40 text-sm"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(false)}
                          className="uppercase"
                        >
                          CANCEL
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          className="uppercase"
                        >
                          SAVE_REVIEW
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {personalReview ? (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                          {personalReview}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          [NO_DATA] Brak osobistej recenzji.
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="mt-4 gap-2 uppercase"
                      >
                        <MessageSquare className="h-3 w-3" />
                        {personalReview ? "EDIT_REVIEW" : "ADD_REVIEW"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleFavorite(enriched.id)}
                className={cn(
                  "gap-2 uppercase",
                  favorites.includes(enriched.id) &&
                    "border-accent text-accent",
                )}
              >
                <Heart
                  className={cn(
                    "h-4 w-4",
                    favorites.includes(enriched.id) && "fill-accent",
                  )}
                />
                {favorites.includes(enriched.id) ? "ZAPISANO" : "ZAPISZ"}
              </Button>
              {!showTrailer && (
                <Button
                  size="sm"
                  disabled={!resolvedTmdbId}
                  className="gap-2 border border-red-500/50 bg-red-950/60 text-red-400 hover:bg-red-900 uppercase"
                  onClick={() => setShowTrailer(true)}
                >
                  <Video className="h-4 w-4" />
                  {resolvedTmdbId ? "PLAY_TRAILER" : "TRAILER N/A"}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── TMDB Browse ──────────────────────────────────────────────────────────────

function TmdbBrowse({ onFilmSelect }: { onFilmSelect: (film: Movie) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState<TmdbResult[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchJsonWithFallback<{ results?: TmdbResult[] }>(
      buildTmdbUrl({ action: "trending", mediaType: "movie" }),
      "/api/tmdb?action=trending&mediaType=movie",
    )
      .then((d) => setTrending((d.results ?? []).slice(0, 12)))
      .catch(() => {});
  }, []);

  const search = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetchJsonWithFallback<{ results?: TmdbResult[] }>(
      buildTmdbUrl({ action: "search", query: q, mediaType: "movie" }),
      `/api/tmdb?action=search&query=${encodeURIComponent(q)}&mediaType=movie`,
    )
      .then((d) => setResults((d.results ?? []).slice(0, 12)))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 400);
  };

  const toMovie = (r: TmdbResult): Movie => ({
    id: `tmdb_${r.id}`,
    tmdbId: r.id,
    title: r.title || r.name || "Unknown",
    year: r.release_date ? parseInt(r.release_date) : null,
    director: "",
    rating: Math.round(r.vote_average * 10) / 10,
    runtime: 0,
    genres: [],
    cast: [],
    keywords: [],
    overview: r.overview,
    posterUrl: r.poster_path
      ? `https://image.tmdb.org/t/p/w500${r.poster_path}`
      : "",
    backdropUrl: r.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${r.backdrop_path}`
      : "",
    reviews: {},
    personalReview: null,
  });

  const display = results.length > 0 ? results : trending;
  const label =
    results.length > 0 ? "WYNIKI WYSZUKIWANIA" : "TRENDING_THIS_WEEK";

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="> szukaj filmów w TMDB..."
            className="pl-10 text-sm"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
          {">"} {label}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {display.map((r) => (
            <div
              key={r.id}
              onClick={() => onFilmSelect(toMovie(r))}
              className="group cursor-pointer overflow-hidden border border-border bg-card transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
                {r.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w342${r.poster_path}`}
                    alt={r.title || r.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <FilmIcon className="h-8 w-8" />
                  </div>
                )}
                <div className="absolute right-1 top-1 flex items-center gap-0.5 border border-yellow-500/30 bg-background/90 px-1.5 py-0.5 text-xs font-bold text-yellow-400">
                  <Star className="h-2.5 w-2.5 fill-yellow-400" />
                  {r.vote_average.toFixed(1)}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="absolute bottom-2 left-2 right-2">
                    <Button
                      size="sm"
                      className="h-6 w-full gap-1 text-xs uppercase"
                    >
                      <Eye className="h-3 w-3" /> VIEW
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-bold uppercase tracking-wide">
                  {r.title || r.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.release_date?.slice(0, 4)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Katalog View ─────────────────────────────────────────────────────────────

function KatalogView({
  onFilmSelect,
}: {
  onFilmSelect: (title: string) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const cat = katalogCategories.find((c) => c.id === activeCategory);

  return (
    <div className="flex h-full flex-col">
      {activeCategory === null ? (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">
            {">"} KATALOG_TEMATYCZNY — 7 kategorii · 105 filmów
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {katalogCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="group flex flex-col gap-3 border border-border bg-card p-4 text-left transition-all hover:border-primary hover:bg-card/80"
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{cat.icon}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-foreground">
                    {cat.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {cat.films.length} filmów
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {cat.films.slice(0, 3).map((f, idx) => (
                    <span
                      key={`${f.title}-${idx}`}
                      className="border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground truncate max-w-[120px]"
                    >
                      {f.title}
                    </span>
                  ))}
                  {cat.films.length > 3 && (
                    <span className="border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                      +{cat.films.length - 3}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveCategory(null)}
              className="gap-2 uppercase"
            >
              <ChevronLeft className="h-4 w-4" /> POWRÓT
            </Button>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              {cat?.icon} {cat?.name}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {cat?.films.map((film, i) => {
                const localFilm = moviesCollection.find((m) =>
                  m.title.toLowerCase().startsWith(film.title.toLowerCase()),
                );
                const titleWithYear = film.year
                  ? `${film.title} (${film.year})`
                  : film.title;
                return (
                  <button
                    key={`${film.title}-${i}`}
                    onClick={() => onFilmSelect(titleWithYear)}
                    className="flex w-full items-center gap-4 border border-border bg-card p-3 text-left transition-all hover:border-primary hover:bg-card/80"
                  >
                    <span className="w-7 shrink-0 text-xs font-bold text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {film.poster ? (
                      <div className="h-14 w-10 shrink-0 overflow-hidden border border-border">
                        <img
                          src={film.poster}
                          alt={film.title}
                          className="h-full w-full object-cover"
                          crossOrigin="anonymous"
                        />
                      </div>
                    ) : localFilm?.posterUrl ? (
                      <div className="h-14 w-10 shrink-0 overflow-hidden border border-border">
                        <img
                          src={localFilm.posterUrl}
                          alt={localFilm.title}
                          className="h-full w-full object-cover"
                          crossOrigin="anonymous"
                        />
                      </div>
                    ) : (
                      <div className="flex h-14 w-10 shrink-0 items-center justify-center border border-border bg-muted">
                        <FilmIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold uppercase tracking-wide text-foreground">
                        {film.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {film.director || ""}{" "}
                        {film.year ? `· ${film.year}` : ""}
                      </p>
                    </div>
                    {localFilm ? (
                      <Badge
                        variant="secondary"
                        className="shrink-0 border border-primary/30 bg-primary/10 text-xs text-primary"
                      >
                        W KOLEKCJI
                      </Badge>
                    ) : (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        TMDB →
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TMDB Top Lists ───────────────────────────────────────────────────────────

function TmdbTopList({
  type,
  mediaType,
  onFilmSelect,
}: {
  type: "top_rated" | "popular";
  mediaType: "movie" | "tv";
  onFilmSelect: (film: Movie) => void;
}) {
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetchJsonWithFallback<{ results?: TmdbResult[] }>(
      buildTmdbUrl({ action: type, mediaType, page }),
      `/api/tmdb?action=${type}&mediaType=${mediaType}&page=${page}`,
    )
      .then((d) => setResults(d.results ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type, mediaType, page]);

  const toMovie = (r: TmdbResult): Movie => ({
    id: `tmdb_${r.id}`,
    tmdbId: r.id,
    title: r.title || r.name || "Unknown",
    year:
      r.release_date || r.first_air_date
        ? parseInt(r.release_date || r.first_air_date || "0")
        : null,
    director: "",
    rating: Math.round(r.vote_average * 10) / 10,
    runtime: 0,
    genres: [],
    cast: [],
    keywords: [],
    overview: r.overview,
    posterUrl: r.poster_path
      ? `https://image.tmdb.org/t/p/w500${r.poster_path}`
      : "",
    backdropUrl: r.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${r.backdrop_path}`
      : "",
    reviews: {},
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm uppercase tracking-wider text-muted-foreground">
          LOADING_DATA...
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {results.map((r, i) => (
            <div
              key={r.id}
              onClick={() => onFilmSelect(toMovie(r))}
              className="group relative cursor-pointer overflow-hidden border border-border bg-card transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="absolute left-2 top-2 z-10 border border-yellow-500/30 bg-background/90 px-1.5 py-0.5 text-xs font-bold text-yellow-400">
                #{(page - 1) * 20 + i + 1}
              </div>
              <div className="absolute right-2 top-2 z-10 flex items-center gap-0.5 border border-yellow-500/30 bg-background/90 px-1.5 py-0.5 text-xs font-bold text-yellow-400">
                <Star className="h-2.5 w-2.5 fill-yellow-400" />
                {r.vote_average.toFixed(1)}
              </div>
              <div className="aspect-[2/3] w-full overflow-hidden bg-muted">
                {r.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w342${r.poster_path}`}
                    alt={r.title || r.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted">
                    <FilmIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="truncate text-xs font-bold uppercase tracking-wide">
                    {r.title || r.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(r.release_date || r.first_air_date)?.slice(0, 4)}
                  </p>
                </div>
              </div>
              <div className="p-2 lg:hidden">
                <p className="truncate text-xs font-bold uppercase tracking-wide">
                  {r.title || r.name}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="uppercase"
          >
            <ChevronLeft className="h-4 w-4" /> PREV
          </Button>
          <span className="text-xs text-muted-foreground">STRONA {page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            className="uppercase"
          >
            NEXT <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main FilmLibrary ─────────────────────────────────────────────────────────

export function FilmLibrary() {
  const { favorites, toggleFavorite } = useMedia();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedFilm, setSelectedFilm] = useState<Movie | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeSection, setActiveSection] = useState<Section>("collection");
  const [filter, setFilter] = useState<"all" | "has-reviews" | "favorites">(
    "all",
  );
  const [showFilters, setShowFilters] = useState(false);
  const [tmdbKeyStatus, setTmdbKeyStatus] = useState<
    "checking" | "ok" | "missing" | "error"
  >("checking");

  const [personalReviews, setPersonalReviews] = useState<
    Record<string, string>
  >(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("bonzo-film-reviews");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/tmdb?action=trending&mediaType=movie&page=1", {
      cache: "no-store",
    })
      .then(async (res) => {
        if (cancelled) return;
        if (res.ok) {
          setTmdbKeyStatus("ok");
          return;
        }

        const payload = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        if (
          (payload.error || "").toLowerCase().includes("keys not configured")
        ) {
          setTmdbKeyStatus("missing");
          return;
        }

        setTmdbKeyStatus("error");
      })
      .catch(() => {
        if (!cancelled) setTmdbKeyStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const saveReview = (filmId: string, review: string) => {
    const updated = { ...personalReviews, [filmId]: review };
    setPersonalReviews(updated);
    try {
      localStorage.setItem("bonzo-film-reviews", JSON.stringify(updated));
    } catch {}
  };

  const filteredFilms = useMemo(() => {
    return moviesCollection.filter((film) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        film.title.toLowerCase().includes(q) ||
        film.director.toLowerCase().includes(q) ||
        film.cast.some((c) => c.toLowerCase().includes(q)) ||
        film.genres.some((g) => g.toLowerCase().includes(q)) ||
        film.keywords.some((k) => k.toLowerCase().includes(q));
      const matchesGenre =
        selectedGenre === "All" || film.genres.includes(selectedGenre);

      // RECENZJE_GIGACHAD w vault zawierają recenzje dla całej kolekcji,
      // więc traktujemy każdy film jako posiadający recenzję.
      const vaultReviewsAvailable = true;
      const hasEmbeddedReviews = Object.keys(film.reviews).length > 0;
      const hasPersonalReview = Boolean(
        (personalReviews[film.id] || film.personalReview || "").trim(),
      );
      const hasAnyReview =
        hasEmbeddedReviews || hasPersonalReview || vaultReviewsAvailable;
      const hasTrailer = Boolean(film.tmdbId);

      let matchesFilter = true;
      if (filter === "has-reviews") matchesFilter = hasAnyReview;
      else if (filter === "favorites")
        matchesFilter = favorites.films.includes(film.id);
      return matchesSearch && matchesGenre && matchesFilter;
    });
  }, [searchQuery, selectedGenre, filter, favorites.films, personalReviews]);

  // Handle catalog film click — look up in collection, catalog, or search TMDB
  const handleCatalogFilmClick = async (titleWithYear: string) => {
    const titleOnly = titleWithYear.split("(")[0].trim();
    const yearMatch = titleWithYear.match(/\((\d{4})\)/);
    const year = yearMatch ? parseInt(yearMatch[1]) : null;

    // Check if film is in local collection
    const local = moviesCollection.find((m) =>
      m.title.toLowerCase().startsWith(titleOnly.toLowerCase()),
    );
    if (local) {
      setSelectedFilm(local);
      return;
    }

    // Check if film is in catalog with full data
    let catalogFilm = null;
    for (const category of katalogCategories) {
      catalogFilm = category.films.find(
        (f: any) => f.title.toLowerCase() === titleOnly.toLowerCase(),
      );
      if (catalogFilm) break;
    }

    if (catalogFilm && catalogFilm.tmdb_id) {
      // Use catalog data directly
      setSelectedFilm({
        id: `catalog_${catalogFilm.tmdb_id}`,
        tmdbId: catalogFilm.tmdb_id,
        title: catalogFilm.title,
        year: catalogFilm.year || year,
        director: catalogFilm.director || "",
        rating: catalogFilm.rating || 0,
        runtime: catalogFilm.runtime || 0,
        genres: catalogFilm.genres || [],
        cast: [],
        keywords: [],
        overview: catalogFilm.overview || "",
        posterUrl: catalogFilm.poster || "",
        backdropUrl: catalogFilm.backdrop || "",
        reviews: {},
      });
      return;
    }

    // Fallback: Search TMDB
    try {
      const q = year ? `${titleOnly} ${year}` : titleOnly;
      const data = await fetchJsonWithFallback<{ results?: TmdbResult[] }>(
        buildTmdbUrl({ action: "search", query: q, mediaType: "movie" }),
        `/api/tmdb?action=search&query=${encodeURIComponent(q)}&mediaType=movie`,
      );
      const hit = Array.isArray(data.results) ? data.results[0] : undefined;
      if (hit) {
        // Fetch full details
        const det = await fetchJsonWithFallback<Record<string, unknown>>(
          buildTmdbUrl({ action: "details", id: hit.id, mediaType: "movie" }),
          `/api/tmdb?action=details&id=${hit.id}&mediaType=movie`,
        );
        setSelectedFilm({
          id: `tmdb_${hit.id}`,
          tmdbId: hit.id,
          title: (det.title as string) || titleOnly,
          year: (det.release_date as string)
            ? parseInt(det.release_date as string)
            : year,
          director:
            (
              det as { credits?: { crew?: { job: string; name: string }[] } }
            ).credits?.crew?.find(
              (c: { job: string; name: string }) => c.job === "Director",
            )?.name || "",
          rating: Math.round(((det.vote_average as number) || 0) * 10) / 10,
          runtime: (det.runtime as number) || 0,
          genres:
            (det.genres as { name: string }[] | undefined)?.map(
              (g: { name: string }) => g.name,
            ) || [],
          cast:
            (
              (det as { credits?: { cast?: { name: string }[] } }).credits
                ?.cast || []
            )
              .slice(0, 8)
              .map((c: { name: string }) => c.name) || [],
          keywords:
            (
              (det as { keywords?: { keywords?: { name: string }[] } }).keywords
                ?.keywords || []
            )
              .slice(0, 10)
              .map((k: { name: string }) => k.name) || [],
          overview: (det.overview as string) || "",
          posterUrl: (det.poster_path as string)
            ? `https://image.tmdb.org/t/p/w500${det.poster_path as string}`
            : "",
          backdropUrl: (det.backdrop_path as string)
            ? `https://image.tmdb.org/t/p/w1280${det.backdrop_path as string}`
            : "",
          reviews: {},
        });
      }
    } catch {}
  };

  const SECTIONS = [
    { id: "collection" as Section, icon: Library, label: "MY_COLLECTIONS" },
    { id: "katalog" as Section, icon: Folder, label: "KATALOG" },
    { id: "top-movies" as Section, icon: TrendingUp, label: "TOP_MOVIES" },
    { id: "top-tv" as Section, icon: Tv, label: "TV_SERIES" },
    { id: "browse" as Section, icon: Search, label: "TMDB_BROWSE" },
  ];

  return (
    <div className="flex h-full flex-col font-mono">
      {/* Header */}
      <div className="border-b border-border px-5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black uppercase tracking-widest text-primary">
              {">"} BONZO_FILMS
            </h2>
            <p className="text-xs text-muted-foreground">
              [{moviesCollection.length} local] [TMDB:{" "}
              {tmdbKeyStatus === "ok"
                ? "KEY_OK"
                : tmdbKeyStatus === "missing"
                  ? "KEY_MISSING"
                  : tmdbKeyStatus === "checking"
                    ? "CHECKING"
                    : "ERROR"}
              ] [katalog: {katalogCategories.length} kategorie]
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeSection === "collection" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters((v) => !v)}
                  className={cn(
                    "h-8 w-8 border",
                    showFilters
                      ? "border-primary bg-primary/10"
                      : "border-transparent",
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "h-8 w-8 border",
                    viewMode === "grid"
                      ? "border-primary bg-primary/20"
                      : "border-transparent",
                  )}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "h-8 w-8 border",
                    viewMode === "list"
                      ? "border-primary bg-primary/20"
                      : "border-transparent",
                  )}
                >
                  <List className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Section Nav */}
      <div className="flex overflow-x-auto border-b border-border bg-muted/20 scrollbar-none">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all",
              activeSection === s.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <s.icon className="h-3.5 w-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Collection filters */}
      {activeSection === "collection" && showFilters && (
        <div className="border-b border-border bg-muted/10 p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="> szukaj tytułu, reżysera, aktora, gatunku..."
              className="pl-10 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "has-reviews", "favorites"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "border px-3 py-1 text-xs uppercase tracking-wider transition-all",
                  filter === f
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50",
                )}
              >
                {f === "all" ? (
                  "ALL"
                ) : f === "has-reviews" ? (
                  "Z RECENZJAMI"
                ) : (
                  <>
                    <Heart className="inline mr-1 h-3 w-3" />
                    ULUBIONE
                  </>
                )}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {allGenres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={cn(
                  "border px-2.5 py-0.5 text-xs uppercase tracking-wider transition-all",
                  selectedGenre === g
                    ? "border-chart-2 bg-chart-2/20 text-chart-2"
                    : "border-border text-muted-foreground hover:border-chart-2/50",
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Collection search bar (always visible, compact) */}
      {activeSection === "collection" && !showFilters && (
        <div className="border-b border-border px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="> szukaj..."
              className="h-8 pl-9 text-xs"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* MY COLLECTION */}
        {activeSection === "collection" && (
          <div className="h-full overflow-y-auto p-4 lg:p-5">
            <MovieVault />
          </div>
        )}

        {/* KATALOG removed - old grid/list view below (no longer used for collection) */}
        {activeSection === "katalog" && viewMode === "grid" && (
          <div className="h-full overflow-y-auto p-4 lg:p-5">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {filteredFilms.map((film) => (
                  <div
                    key={film.id}
                    onClick={() => setSelectedFilm(film)}
                    className="group relative cursor-pointer overflow-hidden border border-border bg-card transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                  >
                    {Object.keys(film.reviews).length > 0 && (
                      <div className="absolute left-1.5 top-1.5 z-10 border border-primary/40 bg-primary/20 p-0.5">
                        <MessageSquare className="h-2.5 w-2.5 text-primary" />
                      </div>
                    )}
                    <div className="absolute right-1.5 top-1.5 z-10 flex items-center gap-0.5 border border-yellow-500/30 bg-background/90 px-1 py-0.5 text-xs font-bold text-yellow-400">
                      <Star className="h-2.5 w-2.5 fill-yellow-400" />
                      {film.rating.toFixed(1)}
                    </div>
                    <div className="aspect-[2/3] w-full overflow-hidden bg-muted">
                      <FilmPoster
                        film={film}
                        className="h-full w-full"
                        imgClassName="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="truncate text-xs font-bold uppercase tracking-wide">
                          {film.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {film.director}
                        </p>
                        <div className="mt-1.5 flex gap-1">
                          {film.tmdbId && (
                            <Button
                              size="sm"
                              className="h-6 gap-1 border border-red-500/40 bg-red-950/70 px-1.5 text-xs text-red-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFilm(film);
                              }}
                            >
                              <Video className="h-2.5 w-2.5" />
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            className={cn(
                              "h-6 w-6 p-0 border",
                              favorites.films.includes(film.id) &&
                                "border-accent/60 bg-accent/20",
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite("films", film.id);
                            }}
                          >
                            <Heart
                              className={cn(
                                "h-3 w-3",
                                favorites.films.includes(film.id) &&
                                  "fill-accent text-accent",
                              )}
                            />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-1.5 lg:hidden">
                      <p className="truncate text-xs font-bold uppercase tracking-wide">
                        {film.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredFilms.map((film, i) => (
                  <button
                    key={film.id}
                    onClick={() => setSelectedFilm(film)}
                    className="flex w-full items-center gap-3 border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:bg-card/80"
                  >
                    <span className="w-7 shrink-0 text-xs font-bold text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="h-16 w-10 shrink-0 overflow-hidden border border-border">
                      <FilmPoster
                        film={film}
                        className="h-full w-full"
                        imgClassName="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold uppercase tracking-wide text-foreground">
                        {film.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {film.director} · {film.year}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {film.genres.slice(0, 3).map((g) => (
                          <span
                            key={g}
                            className="border border-chart-2/30 bg-chart-2/10 px-1.5 py-0.5 text-xs uppercase text-chart-2"
                          >
                            {g}
                          </span>
                        ))}
                        {Object.keys(film.reviews).length > 0 && (
                          <span className="border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                            <MessageSquare className="inline h-2.5 w-2.5 mr-0.5" />
                            REC
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 font-bold text-yellow-400">
                        <Star className="h-3.5 w-3.5 fill-yellow-400" />
                        {film.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {film.runtime}m
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite("films", film.id);
                      }}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          favorites.films.includes(film.id) &&
                            "fill-accent text-accent",
                        )}
                      />
                    </Button>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "katalog" && viewMode === "list" && (
          <div className="h-full overflow-y-auto p-4 lg:p-5">
            <div className="space-y-1.5">
              {filteredFilms.map((film, i) => (
                <button
                  key={film.id}
                  onClick={() => setSelectedFilm(film)}
                  className="flex w-full items-center gap-3 border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:bg-card/80"
                >
                  <span className="w-7 shrink-0 text-xs font-bold text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="h-16 w-10 shrink-0 overflow-hidden border border-border">
                    <FilmPoster
                      film={film}
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold uppercase tracking-wide text-foreground">
                      {film.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {film.director} · {film.year}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {film.genres.slice(0, 3).map((g) => (
                        <span
                          key={g}
                          className="border border-chart-2/30 bg-chart-2/10 px-1.5 py-0.5 text-xs uppercase text-chart-2"
                        >
                          {g}
                        </span>
                      ))}
                      {Object.keys(film.reviews).length > 0 && (
                        <span className="border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                          <MessageSquare className="inline h-2.5 w-2.5 mr-0.5" />
                          REC
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 font-bold text-yellow-400">
                      <Star className="h-3.5 w-3.5 fill-yellow-400" />
                      {film.rating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {film.runtime}m
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite("films", film.id);
                    }}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        favorites.films.includes(film.id) &&
                          "fill-accent text-accent",
                      )}
                    />
                  </Button>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* KATALOG */}
        {activeSection === "katalog" && (
          <KatalogView onFilmSelect={handleCatalogFilmClick} />
        )}

        {/* TOP MOVIES */}
        {activeSection === "top-movies" && (
          <TmdbTopList
            type="top_rated"
            mediaType="movie"
            onFilmSelect={setSelectedFilm}
          />
        )}

        {/* TV SERIES */}
        {activeSection === "top-tv" && (
          <TmdbTopList
            type="top_rated"
            mediaType="tv"
            onFilmSelect={setSelectedFilm}
          />
        )}

        {/* TMDB BROWSE */}
        {activeSection === "browse" && (
          <TmdbBrowse onFilmSelect={setSelectedFilm} />
        )}
      </div>

      {/* Film Detail Modal */}
      <FilmModal
        film={selectedFilm}
        onClose={() => setSelectedFilm(null)}
        personalReviews={personalReviews}
        onSaveReview={saveReview}
        favorites={favorites.films}
        onToggleFavorite={(id) => toggleFavorite("films", id)}
      />
    </div>
  );
}
