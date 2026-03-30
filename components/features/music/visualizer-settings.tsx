"use client"

import { useState } from "react"
import { Settings, Palette, Zap, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

export interface VisualizerConfig {
  colorScheme: "cyan" | "magenta" | "neon" | "fire" | "ice" | "matrix" | "rainbow"
  sensitivity: number
  barCount: number
  smoothing: number
  glowIntensity: number
  mirrorMode: boolean
  particleCount: number
  speed: number
}

interface VisualizerSettingsProps {
  config: VisualizerConfig
  onChange: (config: VisualizerConfig) => void
}

export const defaultVisualizerConfig: VisualizerConfig = {
  colorScheme: "cyan",
  sensitivity: 1.0,
  barCount: 64,
  smoothing: 0.8,
  glowIntensity: 0.5,
  mirrorMode: true,
  particleCount: 100,
  speed: 1.0,
}

const colorSchemes = [
  { id: "cyan" as const, label: "CYAN", color: "oklch(0.7 0.15 180)" },
  { id: "magenta" as const, label: "MAGENTA", color: "oklch(0.65 0.2 330)" },
  { id: "neon" as const, label: "NEON", color: "oklch(0.8 0.25 130)" },
  { id: "fire" as const, label: "FIRE", color: "oklch(0.7 0.2 30)" },
  { id: "ice" as const, label: "ICE", color: "oklch(0.8 0.1 220)" },
  { id: "matrix" as const, label: "MATRIX", color: "oklch(0.7 0.2 145)" },
  { id: "rainbow" as const, label: "RAINBOW", color: "linear-gradient(90deg, red, yellow, lime, cyan, blue, magenta)" },
]

export function VisualizerSettings({ config, onChange }: VisualizerSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateConfig = (updates: Partial<VisualizerConfig>) => {
    onChange({ ...config, ...updates })
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 text-xs uppercase tracking-wider"
      >
        <Settings className="h-3 w-3" />
        CONFIG
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 border border-border bg-card p-4 shadow-lg">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              {">"} VISUALIZER_CONFIG
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0 text-xs"
            >
              X
            </Button>
          </div>

          {/* Color Scheme */}
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Palette className="h-3 w-3" />
              COLOR_SCHEME
            </div>
            <div className="grid grid-cols-4 gap-1">
              {colorSchemes.map((scheme) => (
                <button
                  key={scheme.id}
                  onClick={() => updateConfig({ colorScheme: scheme.id })}
                  className={cn(
                    "border p-2 text-center text-[10px] uppercase tracking-wider transition-colors",
                    config.colorScheme === scheme.id
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {scheme.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sensitivity */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-2">
                <Zap className="h-3 w-3" />
                SENSITIVITY
              </span>
              <span className="font-mono text-primary">{(config.sensitivity ?? 1).toFixed(1)}x</span>
            </div>
            <Slider
              value={[typeof config.sensitivity === 'number' && !isNaN(config.sensitivity) ? config.sensitivity : 1]}
              onValueChange={([v]) => updateConfig({ sensitivity: v })}
              min={0.1}
              max={3.0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Bar Count */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-2">
                <Sliders className="h-3 w-3" />
                BAR_COUNT
              </span>
              <span className="font-mono text-primary">{config.barCount ?? 64}</span>
            </div>
            <Slider
              value={[typeof config.barCount === 'number' && !isNaN(config.barCount) ? config.barCount : 64]}
              onValueChange={([v]) => updateConfig({ barCount: v })}
              min={16}
              max={256}
              step={8}
              className="w-full"
            />
          </div>

          {/* Smoothing */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
              <span>SMOOTHING</span>
              <span className="font-mono text-primary">{((config.smoothing ?? 0.8) * 100).toFixed(0)}%</span>
            </div>
            <Slider
              value={[typeof config.smoothing === 'number' && !isNaN(config.smoothing) ? config.smoothing : 0.8]}
              onValueChange={([v]) => updateConfig({ smoothing: v })}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>

          {/* Glow Intensity */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
              <span>GLOW_INTENSITY</span>
              <span className="font-mono text-primary">{((config.glowIntensity ?? 0.5) * 100).toFixed(0)}%</span>
            </div>
            <Slider
              value={[typeof config.glowIntensity === 'number' && !isNaN(config.glowIntensity) ? config.glowIntensity : 0.5]}
              onValueChange={([v]) => updateConfig({ glowIntensity: v })}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Speed */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
              <span>ANIMATION_SPEED</span>
              <span className="font-mono text-primary">{(config.speed ?? 1).toFixed(1)}x</span>
            </div>
            <Slider
              value={[typeof config.speed === 'number' && !isNaN(config.speed) ? config.speed : 1]}
              onValueChange={([v]) => updateConfig({ speed: v })}
              min={0.1}
              max={3.0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Particle Count */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
              <span>PARTICLE_COUNT</span>
              <span className="font-mono text-primary">{config.particleCount ?? 100}</span>
            </div>
            <Slider
              value={[typeof config.particleCount === 'number' && !isNaN(config.particleCount) ? config.particleCount : 100]}
              onValueChange={([v]) => updateConfig({ particleCount: v })}
              min={10}
              max={500}
              step={10}
              className="w-full"
            />
          </div>

          {/* Mirror Mode */}
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">MIRROR_MODE</span>
            <button
              onClick={() => updateConfig({ mirrorMode: !config.mirrorMode })}
              className={cn(
                "border px-3 py-1 text-xs uppercase tracking-wider transition-colors",
                config.mirrorMode
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              {config.mirrorMode ? "ON" : "OFF"}
            </button>
          </div>

          {/* Reset Button */}
          <div className="mt-4 border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange(defaultVisualizerConfig)}
              className="w-full text-xs uppercase tracking-wider"
            >
              RESET_TO_DEFAULT
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
