"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"

export function ServiceWorkerRegister() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    const hostname = window.location.hostname.toLowerCase()
    const disableSwOnHost = hostname.endsWith(".pages.dev")

    if (disableSwOnHost) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().catch(() => {})
        })
      })
      if (typeof caches !== "undefined") {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName).catch(() => {})
          })
        })
      }
      return
    }

    // Dev mode: wyłącz SW całkowicie, żeby uniknąć pętli odświeżania i konfliktów cache
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().catch(() => {})
        })
      })
      if (typeof caches !== "undefined") {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName).catch(() => {})
          })
        })
      }
      return
    }

    // Stan sieci
    setIsOnline(navigator.onLine)
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)

    // Rejestracja SW — next-pwa generuje sw.js podczas buildu
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        console.log("[PWA] Service Worker zarejestrowany:", reg.scope)

        // SW już aktywny → cache gotowy
        if (reg.active) console.log("[PWA] Cache gotowy")

        // Nowa wersja SW w trakcie instalacji
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing
          if (!newWorker) return

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                // Nowa wersja dostępna, stara wciąż aktywna
                console.log("[PWA] Aktualizacja dostępna")
              } else {
                // Pierwsze zainstalowanie — cache gotowy
                console.log("[PWA] Cache gotowy")
              }
            }
          })
        })
      })
      .catch((err) => {
        console.warn("[PWA] Rejestracja SW nieudana:", err)
      })

    // SW przełączył się na nowy (po skipWaiting)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      console.log("[PWA] Cache gotowy")
    })

    return () => {
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
    }
  }, [])

  return (
    <>
      {/* Wskaźnik offline */}
      {!isOnline && (
        <div className="fixed left-1/2 top-2 z-50 -translate-x-1/2 font-mono">
          <div className="flex items-center gap-2 border border-red-500/40 bg-card px-3 py-1.5">
            <WifiOff className="h-3 w-3 text-red-400" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-red-400">
              OFFLINE — tryb lokalny
            </span>
          </div>
        </div>
      )}
    </>
  )
}
