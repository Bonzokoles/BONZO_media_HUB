const DEFAULT_WORKER_BASE = "https://bonzo-media-hub.stolarnia-ams.workers.dev"

function trimSlash(value: string): string {
  return value.replace(/\/+$/, "")
}

export function getWorkerBase(): string {
  const configured = process.env.NEXT_PUBLIC_BONZO_WORKER_URL
  if (!configured || !configured.trim()) return DEFAULT_WORKER_BASE
  return trimSlash(configured.trim())
}

export function buildTmdbUrl(params: Record<string, string | number | undefined | null>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue
    q.set(k, String(v))
  }
  return `${getWorkerBase()}/api/tmdb?${q.toString()}`
}

export function buildReviewUrl(title: string, year?: number | null): string {
  const q = new URLSearchParams({ title })
  if (year) q.set("year", String(year))
  return `${getWorkerBase()}/api/reviews?${q.toString()}`
}

export function buildLyricsUrl(artist: string, title: string): string {
  return `${getWorkerBase()}/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`
}

export function buildCoverArtUrl(artist: string, options?: { album?: string; title?: string }): string {
  const q = new URLSearchParams({ artist })
  if (options?.album) q.set("album", options.album)
  if (options?.title) q.set("title", options.title)
  return `${getWorkerBase()}/api/cover-art?${q.toString()}`
}

export function buildR2AssetUrl(path: string): string {
  const normalized = path.replace(/^\/+/, "")
  return `${getWorkerBase()}/api/r2?path=${encodeURIComponent(normalized)}`
}

export async function fetchJsonWithFallback<T = unknown>(
  workerUrl: string,
  localApiUrl: string,
): Promise<T> {
  try {
    const workerRes = await fetch(workerUrl)
    if (workerRes.ok) return (await workerRes.json()) as T
  } catch {
    // fallback do lokalnego /api
  }

  const localRes = await fetch(localApiUrl)
  if (!localRes.ok) throw new Error(`Request failed: ${localRes.status}`)
  return (await localRes.json()) as T
}
