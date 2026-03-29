import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'error'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const artist = searchParams.get('artist') ?? ''
  const title = searchParams.get('title') ?? ''

  if (!artist || !title) {
    return NextResponse.json({ error: 'Wymagane parametry: artist, title' }, { status: 400 })
  }

  // lyrics.ovh — darmowe, bez klucza API
  try {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      if (data.lyrics) {
        return NextResponse.json({ lyrics: data.lyrics.trim() })
      }
    }
  } catch {}

  // Fallback: lrclib.net
  try {
    const url = `https://lrclib.net/api/search?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      const hit = data?.[0]
      if (hit?.plainLyrics) {
        return NextResponse.json({ lyrics: hit.plainLyrics.trim() })
      }
    }
  } catch {}

  return NextResponse.json({ error: 'Nie znaleziono tekstu piosenki' }, { status: 404 })
}
