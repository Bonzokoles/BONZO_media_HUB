const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

const TMDB_BASE_URL = "https://api.themoviedb.org/3"

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
    },
  })
}

function normalizeTitleToFileStem(title) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

async function proxyTmdb(url, env) {
  const action = url.searchParams.get("action")
  const query = url.searchParams.get("query")
  const id = url.searchParams.get("id")
  const page = url.searchParams.get("page") || "1"
  const mediaType = url.searchParams.get("mediaType") || "movie"

  const readToken = env.TMDB_READ_TOKEN
  const apiKey = env.TMDB_API_KEY
  if (!readToken && !apiKey) return json({ error: "TMDB credentials missing" }, 500)

  let tmdbUrl = ""
  switch (action) {
    case "search":
      if (!query) return json({ error: "Query required" }, 400)
      tmdbUrl = `${TMDB_BASE_URL}/search/${mediaType}?query=${encodeURIComponent(query)}&page=${page}&language=pl-PL`
      break
    case "details":
      if (!id) return json({ error: "ID required" }, 400)
      tmdbUrl = `${TMDB_BASE_URL}/${mediaType}/${id}?language=pl-PL&append_to_response=credits,videos,recommendations,reviews,keywords`
      break
    case "videos":
      if (!id) return json({ error: "ID required" }, 400)
      tmdbUrl = `${TMDB_BASE_URL}/${mediaType}/${id}/videos?language=pl-PL`
      break
    case "trending":
      tmdbUrl = `${TMDB_BASE_URL}/trending/${mediaType}/week?language=pl-PL&page=${page}`
      break
    case "top_rated":
      tmdbUrl = `${TMDB_BASE_URL}/${mediaType}/top_rated?language=pl-PL&page=${page}`
      break
    case "popular":
      tmdbUrl = `${TMDB_BASE_URL}/${mediaType}/popular?language=pl-PL&page=${page}`
      break
    default:
      return json({ error: "Invalid action" }, 400)
  }

  const resolvedTmdbUrl = readToken
    ? tmdbUrl
    : `${tmdbUrl}${tmdbUrl.includes("?") ? "&" : "?"}api_key=${encodeURIComponent(apiKey)}`

  const headers = readToken
    ? {
        accept: "application/json",
        Authorization: `Bearer ${readToken}`,
      }
    : {
        accept: "application/json",
      }

  const res = await fetch(resolvedTmdbUrl, { headers })

  const bodyText = await res.text()
  return new Response(bodyText, {
    status: res.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
    },
  })
}

async function readR2WithFallback(env, candidates) {
  for (const key of candidates) {
    const obj = await env.MEDIA.get(key)
    if (obj) return { key, obj }
  }
  return null
}

async function proxyR2(url, env) {
  const path = url.searchParams.get("path")
  if (!path) return json({ error: "Missing path" }, 400)

  const normalized = path.replace(/^\/+/, "")
  const obj = await env.MEDIA.get(normalized)
  if (!obj) return json({ error: "Not found" }, 404)

  const headers = new Headers(CORS_HEADERS)
  obj.writeHttpMetadata(headers)
  headers.set("etag", obj.httpEtag)
  headers.set("cache-control", "public, max-age=86400")

  return new Response(obj.body, { headers })
}

async function getReviews(url, env) {
  const title = url.searchParams.get("title")
  const year = url.searchParams.get("year")
  if (!title) return json({ error: "Missing title" }, 400)

  const stem = normalizeTitleToFileStem(title)
  const yearSuffix = year ? `_${year}` : ""
  const fileName = `${stem}${yearSuffix}_styles.json`

  const candidates = [
    `movies/reviews_json/${fileName}`,
    `movies-app/data/reviews_json/${fileName}`,
    `reviews_json/${fileName}`,
  ]

  const found = await readR2WithFallback(env, candidates)
  if (!found) {
    return json({ error: "Review file not found", file: fileName }, 404)
  }

  const text = await found.obj.text()
  return new Response(text, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=86400",
      ...CORS_HEADERS,
    },
  })
}

async function getLyrics(url) {
  const artist = url.searchParams.get("artist") ?? ""
  const title = url.searchParams.get("title") ?? ""
  if (!artist || !title) return json({ error: "Wymagane parametry: artist, title" }, 400)

  // lyrics.ovh
  try {
    const res = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
    )
    if (res.ok) {
      const data = await res.json()
      if (data.lyrics) return json({ lyrics: data.lyrics.trim() })
    }
  } catch {}

  // lrclib.net fallback
  try {
    const res = await fetch(
      `https://lrclib.net/api/search?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`,
    )
    if (res.ok) {
      const data = await res.json()
      const hit = data?.[0]
      if (hit?.plainLyrics) return json({ lyrics: hit.plainLyrics.trim() })
    }
  } catch {}

  return json({ error: "Nie znaleziono tekstu piosenki" }, 404)
}

async function getCoverArt(url) {
  const artist = url.searchParams.get("artist") ?? ""
  const album = url.searchParams.get("album") ?? ""
  const title = url.searchParams.get("title") ?? ""
  if (!artist) return json({ error: "Brak parametru artist" }, 400)

  const results = []

  // iTunes Search API
  try {
    const query = encodeURIComponent(`${artist} ${album || title}`.trim())
    const res = await fetch(
      `https://itunes.apple.com/search?term=${query}&media=music&limit=6&entity=album`,
    )
    if (res.ok) {
      const data = await res.json()
      for (const item of data.results ?? []) {
        if (item.artworkUrl100) {
          results.push({
            url: item.artworkUrl100.replace("100x100", "600x600"),
            source: "iTunes",
            size: "600x600",
          })
        }
      }
    }
  } catch {}

  // MusicBrainz + Cover Art Archive fallback
  if (results.length === 0) {
    try {
      const mbQuery = encodeURIComponent(`artist:"${artist}" AND release:"${album || title}"`)
      const mbRes = await fetch(
        `https://musicbrainz.org/ws/2/release/?query=${mbQuery}&limit=3&fmt=json`,
        { headers: { "User-Agent": "BONZO_media_HUB/1.0 (contact@example.com)" } },
      )
      if (mbRes.ok) {
        const mbData = await mbRes.json()
        for (const release of mbData.releases ?? []) {
          results.push({
            url: `https://coverartarchive.org/release/${release.id}/front-500`,
            source: "MusicBrainz",
            size: "500x500",
          })
        }
      }
    } catch {}
  }

  return json({ results })
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    const url = new URL(request.url)

    if (url.pathname === "/api/health") {
      return json({ ok: true, service: "bonzo-media-hub-proxy" })
    }

    if (url.pathname === "/api/tmdb") {
      return proxyTmdb(url, env)
    }

    if (url.pathname === "/api/r2") {
      return proxyR2(url, env)
    }

    if (url.pathname === "/api/reviews") {
      return getReviews(url, env)
    }

    if (url.pathname === "/api/lyrics") {
      return getLyrics(url)
    }

    if (url.pathname === "/api/cover-art") {
      return getCoverArt(url)
    }

    return json({ error: "Not found" }, 404)
  },
}
