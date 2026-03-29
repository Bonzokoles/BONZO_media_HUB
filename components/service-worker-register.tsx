"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, WifiOff, Download } from "lucide-react"

export function ServiceWorkerRegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

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
        setSwRegistration(reg)
        console.log("[PWA] Service Worker zarejestrowany:", reg.scope)

        // SW już aktywny → cache gotowy
        if (reg.active) console.log("[PWA] Cache gotowy")

        // Nowa wersja SW w trakcie instalacji
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing
          if (!newWorker) return

          setInstalling(true)
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed") {
              setInstalling(false)
              if (navigator.serviceWorker.controller) {
                // Nowa wersja dostępna, stara wciąż aktywna
                setUpdateAvailable(true)
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
      setUpdateAvailable(false)
      console.log("[PWA] Cache gotowy")
    })

    return () => {
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
    }
  }, [])

  const handleUpdate = () => {
    if (!swRegistration?.waiting) return
    // Powiedz nowemu SW żeby przejął kontrolę
    swRegistration.waiting.postMessage({ type: "SKIP_WAITING" })
    setUpdateAvailable(false)
    window.location.reload()
  }

  return (
    <>
      {/* Toast: aktualizacja dostępna */}
      {updateAvailable && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 font-mono lg:bottom-6 lg:left-auto lg:right-6 lg:translate-x-0">
          <div className="flex items-center gap-3 border border-primary bg-card px-4 py-3 shadow-xl">
            <RefreshCw className="h-4 w-4 text-primary" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                AKTUALIZACJA DOSTĘPNA
              </p>
              <p className="text-[10px] text-muted-foreground">Nowa wersja jest gotowa</p>
            </div>
            <Button
              size="sm"
              onClick={handleUpdate}
              className="ml-2 h-7 gap-1 text-[10px] uppercase tracking-wider"
            >
              <Download className="h-3 w-3" />
              AKTUALIZUJ
            </Button>
          </div>
        </div>
      )}

      {/* Toast: instalacja w toku */}
      {installing && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 font-mono lg:bottom-6 lg:left-auto lg:right-6 lg:translate-x-0">
          <div className="flex items-center gap-3 border border-primary/40 bg-card px-4 py-3">
            <Download className="h-4 w-4 animate-pulse text-primary" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                POBIERANIE APLIKACJI
              </p>
              <p className="text-[10px] text-muted-foreground">
                Instalowanie zasobów offline...
              </p>
            </div>
          </div>
        </div>
      )}

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
