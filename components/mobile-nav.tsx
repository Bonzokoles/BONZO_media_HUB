"use client"

import { cn } from "@/lib/utils"
import { useMedia } from "@/lib/media-context"
import { Music, Film, Link2, Video, Radio } from "lucide-react"

export function MobileNav() {
  const { activeView, setActiveView } = useMedia()

  const navItems = [
    { id: "music" as const, label: "Music", icon: Music },
    { id: "video" as const, label: "Videos", icon: Video },
    { id: "films" as const, label: "Films", icon: Film },
    { id: "links" as const, label: "Links", icon: Link2 },
    { id: "streams" as const, label: "Streams", icon: Radio },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-colors",
              activeView === item.id
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
