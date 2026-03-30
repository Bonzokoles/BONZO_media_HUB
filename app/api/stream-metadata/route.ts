export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"

interface StreamMetadataResponse {
  title: string
  artist: string
  album: string
  coverUrl: string
  sourceUrl: string
  sourceService?: string
  description?: string
}

interface SoundCloudOEmbedResponse {
  title?: string
  author_name?: string
  thumbnail_url?: string
  provider_name?: string
  description?: string
}

const REQUEST_TIMEOUT_MS = 6000

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawUrl = searchParams.get("url")?.trim() ?? ""
  const requestedService = (searchParams.get("service") ?? "").toLowerCase()

  if (!rawUrl) {
    return NextResponse.json({ error: "Brak parametru url" }, { status: 400 })
  }

  const sourceUrl = normalizeUrl(rawUrl)
  if (!sourceUrl) {
    return NextResponse.json({ error: "Nieprawidłowy URL" }, { status: 400 })
  }

  const inferredService = requestedService || inferService(sourceUrl)

  if (inferredService === "soundcloud") {
    const soundCloudData = await fetchSoundCloudMetadata(sourceUrl)
    if (soundCloudData) {
      return NextResponse.json(soundCloudData)
    }
  }

  const genericData = await fetchGenericMetadata(sourceUrl, inferredService)
  return NextResponse.json(genericData)
}

function normalizeUrl(url: string): string | null {
  try {
    const normalized = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`
    const parsed = new URL(normalized)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null
    return parsed.toString()
  } catch {
    return null
  }
}

function inferService(url: string): string {
  if (url.includes("soundcloud.com")) return "soundcloud"
  if (url.includes("tidal.com")) return "tidal"
  if (url.includes("indieshuffle.com")) return "indieshuffle"
  if (url.includes("musicatlas.ai")) return "musicatlas"
  return ""
}

async function fetchSoundCloudMetadata(url: string): Promise<StreamMetadataResponse | null> {
  try {
    const oEmbedUrl = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`
    const response = await fetch(oEmbedUrl, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BONZO_media_HUB/1.0)",
      },
      cache: "no-store",
    })

    if (!response.ok) return null

    const data = (await response.json()) as SoundCloudOEmbedResponse
    const title = cleanText(data.title ?? "")
    const { artist, trackTitle } = extractArtistAndTitle(title, cleanText(data.author_name ?? ""))

    return {
      title: trackTitle,
      artist,
      album: artist,
      coverUrl: data.thumbnail_url ?? "",
      sourceUrl: url,
      sourceService: "soundcloud",
      description: cleanText(data.description ?? ""),
    }
  } catch {
    return null
  }
}

async function fetchGenericMetadata(url: string, sourceService: string): Promise<StreamMetadataResponse> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BONZO_media_HUB/1.0)",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return emptyMetadata(url, sourceService)
    }

    const html = await response.text()
    const title =
      extractMetaContent(html, "og:title") ||
      extractMetaContent(html, "twitter:title") ||
      extractTagContent(html, "title") ||
      ""

    const description =
      extractMetaContent(html, "og:description") ||
      extractMetaContent(html, "description") ||
      ""

    let coverUrl =
      extractMetaContent(html, "og:image") ||
      extractMetaContent(html, "twitter:image") ||
      ""

    if (coverUrl && !coverUrl.startsWith("http")) {
      const pageUrl = new URL(url)
      coverUrl = coverUrl.startsWith("/")
        ? `${pageUrl.origin}${coverUrl}`
        : `${pageUrl.origin}/${coverUrl}`
    }

    const cleanedTitle = cleanText(title)
    const { artist, trackTitle } = extractArtistAndTitle(cleanedTitle)

    return {
      title: trackTitle,
      artist,
      album: artist,
      coverUrl,
      sourceUrl: url,
      sourceService: sourceService || undefined,
      description: cleanText(description),
    }
  } catch {
    return emptyMetadata(url, sourceService)
  }
}

function extractMetaContent(html: string, property: string): string {
  const propertyMatch = html.match(
    new RegExp(
      `<meta[^>]*(property|name)=["']${property}["'][^>]*content=["']([^"']+)["']`,
      "i"
    )
  )
  if (propertyMatch?.[2]) return propertyMatch[2]

  const reverseMatch = html.match(
    new RegExp(
      `<meta[^>]*content=["']([^"']+)["'][^>]*(property|name)=["']${property}["']`,
      "i"
    )
  )
  return reverseMatch?.[1] ?? ""
}

function extractTagContent(html: string, tag: string): string {
  const match = html.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "i"))
  return match ? match[1].trim() : ""
}

function extractArtistAndTitle(rawTitle: string, fallbackArtist = ""): { artist: string; trackTitle: string } {
  const cleaned = rawTitle.replace(/\s+/g, " ").trim()
  if (!cleaned) {
    return {
      artist: fallbackArtist,
      trackTitle: "",
    }
  }

  const bySplit = cleaned.split(/\s+by\s+/i)
  if (bySplit.length === 2) {
    return {
      artist: fallbackArtist || bySplit[1].trim(),
      trackTitle: bySplit[0].trim(),
    }
  }

  const dashSplit = cleaned.split(" - ")
  if (dashSplit.length >= 2) {
    return {
      artist: fallbackArtist || dashSplit[0].trim(),
      trackTitle: dashSplit.slice(1).join(" - ").trim(),
    }
  }

  return {
    artist: fallbackArtist,
    trackTitle: cleaned,
  }
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function emptyMetadata(url: string, service: string): StreamMetadataResponse {
  return {
    title: "",
    artist: "",
    album: "",
    coverUrl: "",
    sourceUrl: url,
    sourceService: service || undefined,
    description: "",
  }
}
