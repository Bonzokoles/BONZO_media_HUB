import { NextRequest, NextResponse } from 'next/server'

export interface CoverResult {
  artist: string
  album: string
  coverUrl: string
  coverUrl300: string
  year: number | null
  trackCount?: number
}

// Wyszukiwanie okładek albumów — iTunes Search API (darmowe, bez klucza)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const artist = searchParams.get('artist')?.trim()
  const album = searchParams.get('album')?.trim()
  const title = searchParams.get('title')?.trim()

  if (!artist) {
    return NextResponse.json({ error: 'Wymagany parametr: artist' }, { status: 400 })
  }

  // Buduj query: "artysta album" lub "artysta tytuł"
  const term = [artist, album || title].filter(Boolean).join(' ')

  try {
    const itunesUrl =
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}` +
      `&media=music&entity=album&limit=12&lang=en_us`

    const res = await fetch(itunesUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) throw new Error(`iTunes: ${res.status}`)

    const data = await res.json()

    const results: CoverResult[] = (data.results ?? [])
      .filter((item: Record<string, unknown>) => item.artworkUrl100)
      .map((item: Record<string, unknown>) => {
        const art = item.artworkUrl100 as string
        return {
          artist: item.artistName as string,
          album: item.collectionName as string,
          // Zwiększ rozdzielczość ze 100x100 do 600x600
          coverUrl: art.replace('100x100bb', '600x600bb'),
          coverUrl300: art.replace('100x100bb', '300x300bb'),
          year: item.releaseDate
            ? new Date(item.releaseDate as string).getFullYear()
            : null,
          trackCount: item.trackCount as number | undefined,
        }
      })

    return NextResponse.json({ results, source: 'iTunes', query: term })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Nieznany błąd'
    return NextResponse.json(
      { error: `Błąd wyszukiwania okładek: ${msg}`, results: [] },
      { status: 500 }
    )
  }
}
