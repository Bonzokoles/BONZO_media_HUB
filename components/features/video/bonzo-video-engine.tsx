/**
 * BONZO_VIDEO_ENGINE - react-player v3 (permanent base engine)
 *
 * Obsluguje natywnie:
 *  - YouTube  -> src="https://www.youtube.com/watch?v=KEY"   <- trailery filmow
 *  - Pliki lokalne (blob: / MP4, WebM, Ogg, MKV)            <- biblioteka wideo
 *  - HLS streams (.m3u8)                                     <- streams panel
 *  - DASH / Vimeo / Twitch / Dailymotion                    <- przyszle zrodla
 *
 * Importuj ReactPlayer bezposrednio w komponentach "use client":
 *   import ReactPlayer from "react-player"
 *
 * v3: ref jest forwardowany jako HTMLVideoElement.
 * Zdarzenia: standardowe HTML (onTimeUpdate, onLoadedMetadata, onWaiting, onPlaying, onEnded)
 */

export { default as ReactPlayer } from "react-player"

/** Konfig dla plikow lokalnych - poster + preload */
export const filePlayerConfig = (poster?: string): object => ({
  html: { attributes: { preload: "metadata", ...(poster ? { poster } : {}) } },
})
