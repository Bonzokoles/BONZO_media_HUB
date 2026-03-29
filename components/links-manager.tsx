"use client"

import { useState, useRef, useEffect } from "react"
import { useMedia, type WebLink } from "@/lib/media-context"
import { sampleLinks, linkCategories } from "@/lib/sample-data"
import { cn } from "@/lib/utils"
import {
  Search,
  Plus,
  ExternalLink,
  Heart,
  Trash2,
  Globe,
  List,
  Link as LinkIcon,
  Folder,
  Network,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function ConnectionLines({ containerRef, linkCount }: { containerRef: React.RefObject<HTMLDivElement | null>; linkCount: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    const drawLines = () => {
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      
      resizeCanvas()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cards = container.querySelectorAll("[data-link-card]")
      if (cards.length < 2) return

      ctx.strokeStyle = "oklch(0.3 0.05 180)"
      ctx.lineWidth = 1

      const cardCenters: { x: number; y: number }[] = []
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        cardCenters.push({
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
        })
      })

      for (let i = 0; i < cardCenters.length; i++) {
        for (let j = 1; j <= 2; j++) {
          const nextIndex = (i + j) % cardCenters.length
          if (nextIndex > i) {
            ctx.beginPath()
            ctx.moveTo(cardCenters[i].x, cardCenters[i].y)
            ctx.lineTo(cardCenters[nextIndex].x, cardCenters[nextIndex].y)
            ctx.stroke()
          }
        }
      }
    }

    const observer = new ResizeObserver(drawLines)
    observer.observe(container)
    
    drawLines()
    window.addEventListener("resize", drawLines)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", drawLines)
    }
  }, [containerRef, linkCount])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 0 }}
    />
  )
}

export function LinksManager() {
  const { favorites, toggleFavorite } = useMedia()
  const [links, setLinks] = useState<WebLink[]>(() => {
    if (typeof window === "undefined") return sampleLinks
    try {
      const saved = localStorage.getItem("bonzo-links")
      if (!saved) return sampleLinks
      const parsed = JSON.parse(saved) as Array<Omit<WebLink, "createdAt"> & { createdAt: string }>
      return parsed.map(l => ({ ...l, createdAt: new Date(l.createdAt) }))
    } catch { return sampleLinks }
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    category: "Development",
    description: "",
    favicon: "",
  })
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false)
  const gridContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try { localStorage.setItem("bonzo-links", JSON.stringify(links)) } catch {}
  }, [links])

  const filteredLinks = links.filter((link) => {
    const matchesSearch =
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "All" || link.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const fetchUrlMetadata = async (url: string) => {
    if (!url) return
    
    const formattedUrl = url.startsWith("http") ? url : `https://${url}`
    
    setIsFetchingMetadata(true)
    try {
      const response = await fetch("/api/fetch-url-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formattedUrl }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setNewLink((prev) => ({
          ...prev,
          title: prev.title || data.title || "",
          description: prev.description || data.description || "",
          favicon: data.favicon || "",
        }))
      }
    } catch (error) {
      console.error("Failed to fetch metadata:", error)
    } finally {
      setIsFetchingMetadata(false)
    }
  }

  const handleUrlBlur = () => {
    if (newLink.url && !newLink.title) {
      fetchUrlMetadata(newLink.url)
    }
  }

  const handleAddLink = () => {
    if (!newLink.title || !newLink.url) return

    const link: WebLink = {
      id: Date.now().toString(),
      title: newLink.title,
      url: newLink.url.startsWith("http") ? newLink.url : `https://${newLink.url}`,
      category: newLink.category,
      description: newLink.description,
      favicon: newLink.favicon,
      createdAt: new Date(),
    }

    setLinks([link, ...links])
    setNewLink({ title: "", url: "", category: "Development", description: "", favicon: "" })
    setIsAddDialogOpen(false)
  }

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id))
  }

  const refreshLinkMetadata = async (linkId: string) => {
    const link = links.find((l) => l.id === linkId)
    if (!link) return

    try {
      const response = await fetch("/api/fetch-url-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link.url }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setLinks((prev) =>
          prev.map((l) =>
            l.id === linkId
              ? {
                  ...l,
                  title: data.title || l.title,
                  description: data.description || l.description,
                  favicon: data.favicon || l.favicon,
                }
              : l
          )
        )
      }
    } catch (error) {
      console.error("Failed to refresh metadata:", error)
    }
  }

  const categoryCounts = linkCategories.reduce((acc, category) => {
    acc[category] = category === "All" 
      ? links.length 
      : links.filter((link) => link.category === category).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex h-full flex-col font-mono">
      <div className="border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold uppercase tracking-widest text-primary">
            {">"} LINK_NETWORK
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={cn(
                "border",
                viewMode === "grid" ? "border-primary bg-accent" : "border-transparent"
              )}
            >
              <Network className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("list")}
              className={cn(
                "border",
                viewMode === "list" ? "border-primary bg-accent" : "border-transparent"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 text-xs uppercase tracking-wider">
                  <Plus className="h-4 w-4" />
                  ADD_LINK
                </Button>
              </DialogTrigger>
              <DialogContent className="font-mono">
                <DialogHeader>
                  <DialogTitle className="uppercase tracking-widest">
                    {">"} NEW_LINK_ENTRY
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-xs uppercase tracking-wider">
                      URL
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="url"
                        placeholder="> https://..."
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        onBlur={handleUrlBlur}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fetchUrlMetadata(newLink.url)}
                        disabled={!newLink.url || isFetchingMetadata}
                        className="flex-shrink-0"
                      >
                        {isFetchingMetadata ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      [AUTO] Metadata will be fetched automatically
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-xs uppercase tracking-wider">
                      TITLE
                    </Label>
                    <Input
                      id="title"
                      placeholder="> enter_name..."
                      value={newLink.title}
                      onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-xs uppercase tracking-wider">
                      CATEGORY
                    </Label>
                    <Select
                      value={newLink.category}
                      onValueChange={(value) => setNewLink({ ...newLink, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {linkCategories.filter((c) => c !== "All").map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs uppercase tracking-wider">
                      DESCRIPTION
                    </Label>
                    <Input
                      id="description"
                      placeholder="> optional..."
                      value={newLink.description}
                      onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                    />
                  </div>
                  
                  {newLink.favicon && (
                    <div className="flex items-center gap-3 border border-border bg-secondary/50 p-3">
                      <img
                        src={newLink.favicon}
                        alt="Favicon"
                        className="h-6 w-6"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                      <span className="text-xs text-muted-foreground">
                        [FAVICON_DETECTED]
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="uppercase tracking-wider">
                      CANCEL
                    </Button>
                    <Button onClick={handleAddLink} disabled={!newLink.title || !newLink.url} className="uppercase tracking-wider">
                      ADD_LINK
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Categories Sidebar */}
        <div className="hidden w-56 flex-shrink-0 border-r border-border lg:block">
          <div className="p-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary">
              <Folder className="h-3 w-3" />
              CATEGORIES
            </h3>
            <div className="space-y-1">
              {linkCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "flex w-full items-center justify-between border px-3 py-2 text-xs uppercase tracking-wider transition-colors",
                    selectedCategory === category
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-transparent text-muted-foreground hover:border-border hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <span>{category}</span>
                  <span className="bg-secondary px-2 py-0.5">
                    {categoryCounts[category]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-border p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="> search_links..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2 lg:hidden">
                {linkCategories.slice(0, 4).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "border px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors",
                      selectedCategory === category
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary text-secondary-foreground"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative flex-1 overflow-y-auto p-4 lg:p-6">
            <p className="mb-4 text-xs text-muted-foreground">
              [RESULTS] {filteredLinks.length} entries found
            </p>
            
            {viewMode === "grid" ? (
              <div ref={gridContainerRef} className="relative">
                <ConnectionLines containerRef={gridContainerRef} linkCount={filteredLinks.length} />
                <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredLinks.map((link) => (
                    <div
                      key={link.id}
                      data-link-card
                      className="group relative overflow-hidden border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center border border-border bg-secondary">
                          {link.favicon ? (
                            <img
                              src={link.favicon}
                              alt=""
                              className="h-6 w-6"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                                const sibling = e.currentTarget.nextElementSibling
                                if (sibling) sibling.classList.remove("hidden")
                              }}
                            />
                          ) : null}
                          <Globe className={cn("h-5 w-5 text-muted-foreground", link.favicon && "hidden")} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-medium uppercase tracking-wide text-foreground">
                            {link.title}
                          </h4>
                          <p className="truncate text-xs text-muted-foreground">{link.url}</p>
                        </div>
                      </div>
                      {link.description && (
                        <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                          {link.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="border border-border bg-secondary px-2 py-0.5 text-xs uppercase text-secondary-foreground">
                          {link.category}
                        </span>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => refreshLinkMetadata(link.id)}
                            title="Refresh metadata"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleFavorite("links", link.id)}
                          >
                            <Heart
                              className={cn(
                                "h-3.5 w-3.5",
                                favorites.links.includes(link.id) && "fill-accent text-accent"
                              )}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            asChild
                          >
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteLink(link.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 border border-primary bg-primary" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLinks.map((link, index) => (
                  <div
                    key={link.id}
                    className="group relative flex items-center gap-4 border border-border bg-card p-4 transition-all hover:border-primary"
                  >
                    {index < filteredLinks.length - 1 && (
                      <div className="absolute -bottom-2 left-8 h-2 w-px bg-primary/30" />
                    )}
                    
                    <span className="w-6 text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center border border-border bg-secondary">
                      {link.favicon ? (
                        <img
                          src={link.favicon}
                          alt=""
                          className="h-6 w-6"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                            const sibling = e.currentTarget.nextElementSibling
                            if (sibling) sibling.classList.remove("hidden")
                          }}
                        />
                      ) : null}
                      <Globe className={cn("h-5 w-5 text-muted-foreground", link.favicon && "hidden")} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium uppercase tracking-wide text-foreground">
                          {link.title}
                        </h4>
                        <span className="border border-border bg-secondary px-2 py-0.5 text-xs uppercase text-secondary-foreground">
                          {link.category}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{link.url}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => refreshLinkMetadata(link.id)}
                        title="Refresh metadata"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleFavorite("links", link.id)}
                      >
                        <Heart
                          className={cn(
                            "h-4 w-4",
                            favorites.links.includes(link.id) && "fill-accent text-accent"
                          )}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteLink(link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredLinks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <LinkIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground uppercase tracking-wider">
                  [NO_LINKS_FOUND]
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try adjusting your search or add a new link
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
