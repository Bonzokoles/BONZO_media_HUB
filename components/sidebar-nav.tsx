"use client"

import { cn } from "@/lib/utils"
import { useMedia } from "@/lib/media-context"
import { Music, Film, Link2, Video, Heart, Library, Terminal } from "lucide-react"
import { ThemeSettings } from "@/components/theme-settings"
import { AIToolsPanel } from "@/components/ai-tools-panel"
import { PWAInstaller } from "@/components/pwa-installer"

export function SidebarNav() {
  const { activeView, setActiveView } = useMedia()

  const navItems = [
    { id: "music" as const, label: "AUDIO", icon: Music },
    { id: "video" as const, label: "VIDEO", icon: Video },
    { id: "films" as const, label: "FILMS", icon: Film },
    { id: "links" as const, label: "LINKS", icon: Link2 },
  ]

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-sidebar font-mono lg:block">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center border border-primary bg-primary">
            <Terminal className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-widest text-sidebar-foreground">
              BONZO_media_HUB
            </h1>
            <p className="text-xs text-muted-foreground">v3.0.0_terminal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <div className="mb-4">
            <p className="px-3 text-xs font-medium uppercase tracking-widest text-primary">
              {">"} BROWSE
            </p>
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "flex w-full items-center gap-3 border px-3 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors",
                activeView === item.id
                  ? "border-primary bg-sidebar-accent text-sidebar-accent-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {activeView === item.id && (
                <span className="ml-auto text-primary">{"<"}</span>
              )}
            </button>
          ))}

          <div className="my-4 border-t border-sidebar-border" />

          <div className="mb-4">
            <p className="px-3 text-xs font-medium uppercase tracking-widest text-primary">
              {">"} LIBRARY
            </p>
          </div>
          <button className="flex w-full items-center gap-3 border border-transparent px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:border-border hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
            <Heart className="h-4 w-4" />
            FAVORITES
          </button>
          <button className="flex w-full items-center gap-3 border border-transparent px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:border-border hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
            <Library className="h-4 w-4" />
            COLLECTIONS
          </button>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="border border-border bg-sidebar-accent/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground">
              [INSTALL_APP]
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Install for offline use and background playback
            </p>
            <div className="mt-3">
              <PWAInstaller />
            </div>
          </div>
        </div>

        <div className="border-t border-sidebar-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              <div>[SYS] status: online</div>
            </div>
            <div className="flex items-center gap-1">
              <ThemeSettings />
              <AIToolsPanel />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
