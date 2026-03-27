"use client"

import { useState, useMemo } from "react"
import { useMedia } from "@/lib/media-context"
import { moviesCollection, reviewStyles, allGenres, type Movie } from "@/lib/movies-data"
import { cn } from "@/lib/utils"
import {
  Search,
  Star,
  Play,
  Heart,
  X,
  Calendar,
  User,
  Film as FilmIcon,
  Grid,
  List,
  Clock,
  Users,
  Tag,
  ChevronRight,
  Bookmark,
  Eye,
  MessageSquare,
  Clapperboard,
  TrendingUp,
  Tv,
  Library,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Section = "collection" | "top-movies" | "top-tv"
type ReviewTab = string

export function FilmLibrary() {
  const { favorites, toggleFavorite } = useMedia()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [selectedFilm, setSelectedFilm] = useState<Movie | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeSection, setActiveSection] = useState<Section>("collection")
  const [activeReviewTab, setActiveReviewTab] = useState<ReviewTab>("akademicki")
  const [personalReview, setPersonalReview] = useState("")
  const [isEditingReview, setIsEditingReview] = useState(false)
  const [filter, setFilter] = useState<"all" | "has-reviews" | "has-personal" | "favorites">("all")

  // Filter movies based on search, genre, and filter
  const filteredFilms = useMemo(() => {
    return moviesCollection.filter((film) => {
      const matchesSearch =
        film.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        film.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
        film.cast.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        film.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesGenre = selectedGenre === "All" || film.genres.includes(selectedGenre)
      
      let matchesFilter = true
      if (filter === "has-reviews") {
        matchesFilter = Object.keys(film.reviews).length > 0
      } else if (filter === "has-personal") {
        matchesFilter = !!film.personalReview
      } else if (filter === "favorites") {
        matchesFilter = favorites.films.includes(film.id)
      }
      
      return matchesSearch && matchesGenre && matchesFilter
    })
  }, [searchQuery, selectedGenre, filter, favorites.films])

  // Sort by rating for top lists
  const topMovies = useMemo(() => {
    return [...moviesCollection]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 50)
  }, [])

  const currentList = activeSection === "collection" ? filteredFilms : topMovies

  const openFilmDetail = (film: Movie) => {
    setSelectedFilm(film)
    setPersonalReview(film.personalReview || "")
    setIsEditingReview(false)
    setActiveReviewTab(Object.keys(film.reviews)[0] || "akademicki")
  }

  return (
    <div className="flex h-full flex-col font-mono">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold uppercase tracking-widest text-primary">
              {">"} BONZO_FILM_VAULT
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              [COLLECTION] {moviesCollection.length} titles loaded
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={cn(
                "border",
                viewMode === "grid" ? "border-primary bg-primary/20" : "border-transparent"
              )}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("list")}
              className={cn(
                "border",
                viewMode === "list" ? "border-primary bg-primary/20" : "border-transparent"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border bg-muted/30 px-4 py-2">
        <button
          onClick={() => setActiveSection("collection")}
          className={cn(
            "flex items-center gap-2 border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all",
            activeSection === "collection"
              ? "border-primary bg-primary/20 text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Library className="h-3 w-3" />
          MY_COLLECTION
        </button>
        <button
          onClick={() => setActiveSection("top-movies")}
          className={cn(
            "flex items-center gap-2 border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all",
            activeSection === "top-movies"
              ? "border-primary bg-primary/20 text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <TrendingUp className="h-3 w-3" />
          TOP_RATED
        </button>
        <button
          onClick={() => setActiveSection("top-tv")}
          className={cn(
            "flex items-center gap-2 border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all",
            activeSection === "top-tv"
              ? "border-primary bg-primary/20 text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Tv className="h-3 w-3" />
          TV_SERIES
        </button>
      </div>

      {/* Filters */}
      <div className="border-b border-border p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="> search_by_title_director_cast_genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>
        
        {/* Quick Filters */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "border px-3 py-1 text-xs uppercase tracking-wider transition-all",
              filter === "all"
                ? "border-primary bg-primary/20 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            ALL
          </button>
          <button
            onClick={() => setFilter("has-reviews")}
            className={cn(
              "border px-3 py-1 text-xs uppercase tracking-wider transition-all",
              filter === "has-reviews"
                ? "border-primary bg-primary/20 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            WITH_REVIEWS
          </button>
          <button
            onClick={() => setFilter("favorites")}
            className={cn(
              "border px-3 py-1 text-xs uppercase tracking-wider transition-all",
              filter === "favorites"
                ? "border-accent bg-accent/20 text-accent"
                : "border-border text-muted-foreground hover:border-accent/50"
            )}
          >
            <Heart className="mr-1 inline h-3 w-3" />
            FAVORITES
          </button>
        </div>

        {/* Genre Filters */}
        <div className="mt-3 flex flex-wrap gap-2">
          {allGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={cn(
                "border px-3 py-1 text-xs uppercase tracking-wider transition-all",
                selectedGenre === genre
                  ? "border-chart-2 bg-chart-2/20 text-chart-2"
                  : "border-border text-muted-foreground hover:border-chart-2/50"
              )}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Movie Grid/List */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {currentList.map((film, index) => (
              <div
                key={film.id}
                className="group relative cursor-pointer overflow-hidden border border-border bg-card transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                onClick={() => openFilmDetail(film)}
              >
                {/* Rank badge for top lists */}
                {activeSection !== "collection" && (
                  <div className="absolute left-2 top-2 z-10 border border-chart-3/30 bg-background/90 px-2 py-0.5 text-xs font-bold text-chart-3">
                    #{index + 1}
                  </div>
                )}
                
                {/* Rating badge */}
                <div className="absolute right-2 top-2 z-10 flex items-center gap-1 border border-chart-3/30 bg-background/90 px-2 py-0.5 text-xs font-bold text-chart-3">
                  <Star className="h-3 w-3 fill-chart-3" />
                  {film.rating.toFixed(1)}
                </div>

                {/* Reviews badge */}
                {Object.keys(film.reviews).length > 0 && (
                  <div className="absolute left-2 top-2 z-10 border border-primary/30 bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary">
                    <MessageSquare className="inline h-3 w-3" />
                  </div>
                )}

                <div className="aspect-[2/3] w-full overflow-hidden bg-muted">
                  {film.posterUrl ? (
                    <img
                      src={film.posterUrl}
                      alt={film.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-secondary text-4xl font-bold text-muted-foreground">
                      {film.title.charAt(0)}
                    </div>
                  )}
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="truncate text-sm font-bold uppercase tracking-wide text-foreground">
                      {film.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{film.director}</p>
                    <div className="mt-2 flex gap-1">
                      <Button
                        size="sm"
                        className="h-7 gap-1 border border-primary bg-primary/80 px-2 text-xs uppercase"
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                      >
                        <Play className="h-3 w-3" />
                        PLAY
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 w-7 border border-border p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite("films", film.id)
                        }}
                      >
                        <Heart
                          className={cn(
                            "h-3 w-3",
                            favorites.films.includes(film.id) && "fill-accent text-accent"
                          )}
                        />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Mobile info */}
                <div className="p-2 lg:hidden">
                  <p className="truncate text-xs font-bold uppercase tracking-wide">
                    {film.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{film.year}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {currentList.map((film, index) => (
              <button
                key={film.id}
                onClick={() => openFilmDetail(film)}
                className="flex w-full items-center gap-4 border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:bg-card/80"
              >
                <span className="w-8 text-xs font-bold text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="h-16 w-11 flex-shrink-0 overflow-hidden border border-border">
                  {film.posterUrl ? (
                    <img
                      src={film.posterUrl}
                      alt={film.title}
                      className="h-full w-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-lg font-bold text-muted-foreground">
                      {film.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold uppercase tracking-wide text-foreground">
                    {film.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{film.director}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {film.genres.slice(0, 3).map((g) => (
                      <span key={g} className="border border-chart-2/30 bg-chart-2/10 px-1.5 py-0.5 text-xs uppercase text-chart-2">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-chart-3 text-chart-3" />
                    <span className="font-bold text-foreground">{film.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">{film.year}</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">{film.runtime}m</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite("films", film.id)
                  }}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      favorites.films.includes(film.id) && "fill-accent text-accent"
                    )}
                  />
                </Button>
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          [RESULTS] {currentList.length} entries found | [FILTER] {selectedGenre} | [MODE] {viewMode.toUpperCase()}
        </div>
      </div>

      {/* Film Detail Modal */}
      <Dialog open={!!selectedFilm} onOpenChange={() => setSelectedFilm(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0 font-mono">
          {selectedFilm && (
            <>
              {/* Hero Image */}
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={selectedFilm.backdropUrl || selectedFilm.posterUrl}
                  alt={selectedFilm.title}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                
                {/* Terminal overlay */}
                <div className="absolute left-4 top-4 text-xs text-primary/70">
                  <div>[SYS] FILM_DETAIL_VIEW</div>
                  <div>[ID] {selectedFilm.id}</div>
                  <div>[TMDB] rating: {selectedFilm.rating}</div>
                </div>
                
                {/* Title overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-black uppercase tracking-wider text-foreground drop-shadow-lg">
                    {selectedFilm.title}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {selectedFilm.year || "N/A"}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {selectedFilm.director}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedFilm.runtime} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-chart-3 text-chart-3" />
                      <span className="font-bold text-chart-3">{selectedFilm.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content tabs */}
              <div className="max-h-[50vh] overflow-y-auto">
                {/* Review Tabs */}
                <div className="flex border-b border-border">
                  <button
                    onClick={() => setActiveReviewTab("overview")}
                    className={cn(
                      "flex-1 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all",
                      activeReviewTab === "overview"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    OVERVIEW
                  </button>
                  {reviewStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setActiveReviewTab(style.id)}
                      disabled={!selectedFilm.reviews[style.id]}
                      className={cn(
                        "flex-1 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all",
                        activeReviewTab === style.id
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground",
                        !selectedFilm.reviews[style.id] && "cursor-not-allowed opacity-30"
                      )}
                    >
                      {style.name}
                    </button>
                  ))}
                  <button
                    onClick={() => setActiveReviewTab("personal")}
                    className={cn(
                      "flex-1 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all",
                      activeReviewTab === "personal"
                        ? "border-accent text-accent"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    PERSONAL
                  </button>
                </div>

                <div className="p-6">
                  {/* Overview Tab */}
                  {activeReviewTab === "overview" && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
                          {">"} SYNOPSIS
                        </h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {selectedFilm.overview}
                        </p>
                      </div>

                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
                          {">"} GENRES
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedFilm.genres.map((g) => (
                            <Badge key={g} variant="secondary" className="uppercase">
                              <FilmIcon className="mr-1 h-3 w-3" />
                              {g}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
                          {">"} CAST
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedFilm.cast.map((actor) => (
                            <span key={actor} className="border border-border bg-muted px-2 py-1 text-xs">
                              {actor}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
                          {">"} KEYWORDS
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedFilm.keywords.slice(0, 15).map((kw) => (
                            <span key={kw} className="border border-chart-2/30 bg-chart-2/10 px-1.5 py-0.5 text-xs text-chart-2">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Review Tabs */}
                  {reviewStyles.map((style) => (
                    activeReviewTab === style.id && selectedFilm.reviews[style.id] && (
                      <div key={style.id} className="space-y-4">
                        <div className="border-l-4 border-primary bg-muted/50 p-4">
                          <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
                            {">"} REVIEW_STYLE: {style.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">{style.description}</p>
                        </div>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                          {selectedFilm.reviews[style.id]}
                        </div>
                      </div>
                    )
                  ))}

                  {/* Personal Review Tab */}
                  {activeReviewTab === "personal" && (
                    <div className="space-y-4">
                      <div className="border-l-4 border-accent bg-accent/10 p-4">
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">
                          {">"} PERSONAL_REVIEW
                        </h4>
                        <p className="text-xs text-muted-foreground">Your personal thoughts and notes</p>
                      </div>
                      
                      {isEditingReview ? (
                        <div className="space-y-3">
                          <Textarea
                            value={personalReview}
                            onChange={(e) => setPersonalReview(e.target.value)}
                            placeholder="> Write your personal review here..."
                            className="min-h-[200px] text-sm"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEditingReview(false)}
                              className="uppercase"
                            >
                              CANCEL
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                // Save review logic would go here
                                setIsEditingReview(false)
                              }}
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
                              [NO_DATA] No personal review yet.
                            </p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingReview(true)}
                            className="mt-4 uppercase"
                          >
                            <MessageSquare className="mr-2 h-3 w-3" />
                            {personalReview ? "EDIT_REVIEW" : "ADD_REVIEW"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between border-t border-border p-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFavorite("films", selectedFilm.id)}
                    className="gap-2 uppercase"
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        favorites.films.includes(selectedFilm.id) && "fill-accent text-accent"
                      )}
                    />
                    {favorites.films.includes(selectedFilm.id) ? "SAVED" : "SAVE"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 uppercase"
                  >
                    <Bookmark className="h-4 w-4" />
                    WATCHLIST
                  </Button>
                </div>
                <Button className="gap-2 uppercase">
                  <Play className="h-4 w-4" />
                  PLAY_NOW
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
