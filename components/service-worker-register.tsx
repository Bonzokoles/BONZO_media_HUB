"use client"

import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered:", registration.scope)

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New content available
                  console.log("[PWA] New content available, refresh to update")
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error("[PWA] Service Worker registration failed:", error)
        })

      // Handle controller change (new SW activated)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("[PWA] Service Worker controller changed")
      })
    }
  }, [])

  return null
}
