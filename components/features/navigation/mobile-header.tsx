"use client"

import { useState } from "react"
import { useMedia } from "@/lib/media-context"
import { cn } from "@/lib/utils"
import {
  Menu,
  X,
  Terminal,
  Music,
  Video,
  Film,
  Link2,
  Heart,
  Library,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeSettings } from "@/components/theme-settings"
import { AIToolsPanel } from "@/components/ai-tools-panel"
import { PWAInstaller } from "@/components/pwa-installer"

export function MobileHeader() {
  const { activeView, setActiveView } = useMedia()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { id: "music" as const, label: "AUDIO", icon: Music },
    { id: "video" as const, label: "VIDEO", icon: Video },
    { id: "films" as const, label: "FILMS", icon: Film },
    { id: "links" as const, label: "LINKS", icon: Link2 },
  ]

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 font-mono lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center border border-primary bg-primary">
            <Terminal className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold uppercase tracking-widest text-foreground">
            BONZO_HUB
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="border border-border"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 font-mono lg:hidden">
          <div
            className="absolute inset-0 bg-background/80"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-64 border-l border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                {">"} MENU
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
                className="border border-border"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-4">
              <div className="mb-4">
                <p className="px-3 text-xs font-medium uppercase tracking-widest text-primary">
                  {">"} BROWSE
                </p>
              </div>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id)
                    setIsMenuOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 border px-3 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors",
                    activeView === item.id
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-transparent text-muted-foreground hover:border-border hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {activeView === item.id && (
                    <span className="ml-auto text-primary">{"<"}</span>
                  )}
                </button>
              ))}

              <div className="my-4 border-t border-border" />

              <div className="mb-4">
                <p className="px-3 text-xs font-medium uppercase tracking-widest text-primary">
                  {">"} LIBRARY
                </p>
              </div>
              <button className="flex w-full items-center gap-3 border border-transparent px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:border-border hover:bg-accent/50 hover:text-foreground">
                <Heart className="h-4 w-4" />
                FAVORITES
              </button>
              <button className="flex w-full items-center gap-3 border border-transparent px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:border-border hover:bg-accent/50 hover:text-foreground">
                <Library className="h-4 w-4" />
                COLLECTIONS
              </button>

              <div className="my-4 border-t border-border" />
              
              <div className="mb-2">
                <p className="px-3 text-xs font-medium uppercase tracking-widest text-primary">
                  {">"} INSTALL
                </p>
              </div>
              <div className="px-3">
                <PWAInstaller />
              </div>
            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  <div>[SYS] online</div>
                </div>
                <div className="flex items-center gap-1">
                  <ThemeSettings />
                  <AIToolsPanel />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
