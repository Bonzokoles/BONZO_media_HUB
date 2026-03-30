"use client"

import { Cpu, CheckCircle2 } from "lucide-react"

/**
 * Status badge zainstalowanego silnika wideo.
 * Engine jest teraz na stałe: react-player v2 (YouTube + pliki lokalne + HLS/DASH).
 */
export function VideoEngineSettings() {
  return (
    <div className="flex items-center gap-1.5 border border-primary/40 bg-primary/5 px-2 py-1 font-mono text-xs text-primary">
      <Cpu className="h-3 w-3" />
      <span className="uppercase tracking-wider">REACT_PLAYER</span>
      <CheckCircle2 className="h-3 w-3 text-green-500" />
      <span className="text-primary/60 uppercase tracking-wider">YT+LOCAL+HLS</span>
    </div>
  )
}
