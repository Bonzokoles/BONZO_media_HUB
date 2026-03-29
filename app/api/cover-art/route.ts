import { NextRequest, NextResponse } from 'next/server'
import type { CoverResult } from '@/lib/music-types'

export const dynamic = 'error'

interface ITunesResponse {
  results?: Array<{ artworkUrl100?: string }>
}

interface MusicBrainzResponse {
  releases?: Array<{ id: string }>
}

export async function GET(req: NextRequest) {
  const safeUrl = req.url || 'http://localhost/api/cover-art'
  const { searchParams } = new URL(safeUrl)
  const artist = searchParams.get('artist') ?? ''
  const album = searchParams.get('album') ?? ''
  const title = searchParams.get('title') ?? ''

  if (!artist) {
    return NextResponse.json({ error: 'Brak parametru artist' }, { status: 400 })
  }

  const results: CoverResult[] = []

  // iTunes Search API — darmowe, bez klucza
  try {
    const query = encodeURIComponent(`${artist} ${album || title}`.trim())
    const res = await fetch(
      `https://itunes.apple.com/search?term=${query}&media=music&limit=6&entity=album`,
      { next: { revalidate: 3600 } }
    )
    if (res.ok) {
      const data = (await res.json()) as ITunesResponse
      for (const item of data.results ?? []) {
        if (item.artworkUrl100) {
          results.push({
            url: item.artworkUrl100.replace('100x100', '600x600'),
            source: 'iTunes',
            size: '600x600',
          })
        }
      }
    }
  } catch {}

  // MusicBrainz + Cover Art Archive — fallback
  if (results.length === 0) {
    try {
      const mbQuery = encodeURIComponent(`artist:"${artist}" AND release:"${album || title}"`)
      const mbRes = await fetch(
        `https://musicbrainz.org/ws/2/release/?query=${mbQuery}&limit=3&fmt=json`,
        { headers: { 'User-Agent': 'BONZO_media_HUB/1.0 (contact@example.com)' }, next: { revalidate: 3600 } }
      )
      if (mbRes.ok) {
        const mbData = (await mbRes.json()) as MusicBrainzResponse
        for (const release of mbData.releases ?? []) {
          results.push({
            url: `https://coverartarchive.org/release/${release.id}/front-500`,
            source: 'MusicBrainz',
            size: '500x500',
          })
        }
      }
    } catch {}
  }

  return NextResponse.json({ results })
}
