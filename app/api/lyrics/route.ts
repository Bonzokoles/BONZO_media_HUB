import { NextRequest, NextResponse } from 'next/server'

// Wyszukiwanie tekstów piosenek — lyrics.ovh (darmowe, bez klucza)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const artist = searchParams.get('artist')?.trim()
  const title = searchParams.get('title')?.trim()

  if (!artist || !title) {
    return NextResponse.json(
      { error: 'Wymagane parametry: artist i title' },
      { status: 400 }
    )
  }

  // Czyść tytuł z feat./ft. itp. jeśli potrzeba fallback
  const cleanTitle = title
    .replace(/\s*[\(\[](feat|ft|featuring|with)[^\)\]]*[\)\]]/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  async function tryFetch(a: string, t: string) {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(a)}/${encodeURIComponent(t)}`
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.lyrics ? (data.lyrics as string) : null
  }

  try {
    // Próba 1: oryginalny tytuł
    let lyrics = await tryFetch(artist, title)

    // Próba 2: oczyszczony tytuł (bez feat.)
    if (!lyrics && cleanTitle !== title) {
      lyrics = await tryFetch(artist, cleanTitle)
    }

    if (!lyrics) {
      return NextResponse.json(
        { error: `Nie znaleziono tekstu dla "${title}" – ${artist}` },
        { status: 404 }
      )
    }

    return NextResponse.json({ lyrics, artist, title, source: 'lyrics.ovh' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Nieznany błąd'
    return NextResponse.json(
      { error: `Błąd połączenia z serwisem tekstów: ${msg}` },
      { status: 500 }
    )
  }
}
