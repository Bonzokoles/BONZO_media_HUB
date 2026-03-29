"use client"

import { useEffect, useMemo, useState } from "react"
import { ExternalLink } from "lucide-react"

const EMBED_HOSTS = ["browserzenon.org", "zenbrowsers.org"]

export function OpenStandaloneButton() {
  const [visible, setVisible] = useState(false)

  const standaloneOrigin = useMemo(
    () => process.env.NEXT_PUBLIC_BONZO_STANDALONE_ORIGIN || "https://bonzokoles.github.io",
    []
  )

  const standaloneBasePath = useMemo(
    () => process.env.NEXT_PUBLIC_BONZO_STANDALONE_BASE_PATH || "/BONZO_media_HUB",
    []
  )

  useEffect(() => {
    if (typeof window === "undefined") return

    const hostname = window.location.hostname.toLowerCase()
    const isEmbedHost = EMBED_HOSTS.some((host) => hostname.includes(host))
    const isInsideFrame = window.self !== window.top

    setVisible(isEmbedHost || isInsideFrame)
  }, [])

  const openStandalone = () => {
    if (typeof window === "undefined") return

    const { pathname, search, hash } = window.location

    let suffix = pathname
    if (suffix.startsWith(standaloneBasePath)) {
      suffix = suffix.slice(standaloneBasePath.length)
    }

    if (!suffix.startsWith("/")) {
      suffix = `/${suffix}`
    }

    if (suffix === "/") {
      suffix = ""
    }

    const targetUrl = `${standaloneOrigin}${standaloneBasePath}${suffix}${search}${hash}`
    const popup = window.open(
      targetUrl,
      "_blank",
      "noopener,noreferrer,width=1600,height=1000"
    )

    if (!popup) {
      window.location.href = targetUrl
    }
  }

  if (!visible) return null

  return (
    <button
      onClick={openStandalone}
      className="fixed bottom-20 right-4 z-60 flex items-center gap-2 border border-primary bg-background/95 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-primary shadow-lg backdrop-blur md:right-6 md:bottom-6"
      title="Otwórz BONZO_media_HUB poza browserzenon.org"
      type="button"
    >
      <ExternalLink className="h-3.5 w-3.5" />
      Otwórz poza browserzenon.org
    </button>
  )
}
