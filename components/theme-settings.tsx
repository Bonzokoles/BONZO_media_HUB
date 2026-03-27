"use client"

import { useState, useEffect } from "react"
import { Palette, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export type ThemePreset = {
  name: string
  primary: string
  accent: string
  background: string
  card: string
  border: string
}

export const themePresets: ThemePreset[] = [
  {
    name: "CYBER_TEAL",
    primary: "oklch(0.7 0.15 180)",
    accent: "oklch(0.65 0.2 330)",
    background: "oklch(0.1 0.01 260)",
    card: "oklch(0.14 0.01 260)",
    border: "oklch(0.25 0.01 260)",
  },
  {
    name: "MATRIX_GREEN",
    primary: "oklch(0.7 0.2 140)",
    accent: "oklch(0.8 0.25 130)",
    background: "oklch(0.08 0.02 140)",
    card: "oklch(0.12 0.02 140)",
    border: "oklch(0.2 0.03 140)",
  },
  {
    name: "NEON_PINK",
    primary: "oklch(0.7 0.25 330)",
    accent: "oklch(0.65 0.2 290)",
    background: "oklch(0.1 0.02 300)",
    card: "oklch(0.14 0.02 300)",
    border: "oklch(0.25 0.03 300)",
  },
  {
    name: "FIRE_ORANGE",
    primary: "oklch(0.7 0.2 50)",
    accent: "oklch(0.65 0.25 30)",
    background: "oklch(0.1 0.02 30)",
    card: "oklch(0.14 0.02 30)",
    border: "oklch(0.25 0.03 30)",
  },
  {
    name: "ICE_BLUE",
    primary: "oklch(0.7 0.15 230)",
    accent: "oklch(0.6 0.12 260)",
    background: "oklch(0.1 0.01 230)",
    card: "oklch(0.14 0.01 230)",
    border: "oklch(0.25 0.02 230)",
  },
  {
    name: "ROYAL_PURPLE",
    primary: "oklch(0.65 0.2 290)",
    accent: "oklch(0.7 0.18 320)",
    background: "oklch(0.1 0.02 280)",
    card: "oklch(0.14 0.02 280)",
    border: "oklch(0.25 0.03 280)",
  },
  {
    name: "GOLDEN_AMBER",
    primary: "oklch(0.75 0.18 80)",
    accent: "oklch(0.7 0.15 60)",
    background: "oklch(0.1 0.02 50)",
    card: "oklch(0.14 0.02 50)",
    border: "oklch(0.25 0.03 50)",
  },
  {
    name: "TERMINAL_WHITE",
    primary: "oklch(0.95 0 0)",
    accent: "oklch(0.7 0 0)",
    background: "oklch(0.05 0 0)",
    card: "oklch(0.1 0 0)",
    border: "oklch(0.2 0 0)",
  },
]

export function ThemeSettings() {
  const [currentTheme, setCurrentTheme] = useState<string>("CYBER_TEAL")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("bonzo-theme")
    if (saved) {
      setCurrentTheme(saved)
      applyTheme(saved)
    }
  }, [])

  const applyTheme = (themeName: string) => {
    const theme = themePresets.find((t) => t.name === themeName)
    if (!theme) return

    const root = document.documentElement
    root.style.setProperty("--primary", theme.primary)
    root.style.setProperty("--accent", theme.accent)
    root.style.setProperty("--background", theme.background)
    root.style.setProperty("--card", theme.card)
    root.style.setProperty("--border", theme.border)
    root.style.setProperty("--ring", theme.primary)
    root.style.setProperty("--sidebar", theme.background)
    root.style.setProperty("--sidebar-primary", theme.primary)
    root.style.setProperty("--sidebar-border", theme.border)
  }

  const handleThemeChange = (themeName: string) => {
    setCurrentTheme(themeName)
    applyTheme(themeName)
    localStorage.setItem("bonzo-theme", themeName)
  }

  const getPreviewColor = (theme: ThemePreset) => {
    return theme.primary
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Palette className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md font-mono">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 uppercase tracking-widest">
            <Palette className="h-4 w-4 text-primary" />
            THEME_CONFIG
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Customize the application color scheme
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <p className="text-xs text-muted-foreground">
            {">"} SELECT_COLOR_SCHEME:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {themePresets.map((theme) => (
              <button
                key={theme.name}
                onClick={() => handleThemeChange(theme.name)}
                className={cn(
                  "flex items-center gap-3 border p-3 text-left transition-all hover:border-primary",
                  currentTheme === theme.name
                    ? "border-primary bg-accent/20"
                    : "border-border"
                )}
              >
                <div
                  className="h-8 w-8 border border-border"
                  style={{ background: getPreviewColor(theme) }}
                />
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider">
                    {theme.name}
                  </p>
                </div>
                {currentTheme === theme.name && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              [SYS] CURRENT_THEME: {currentTheme}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
