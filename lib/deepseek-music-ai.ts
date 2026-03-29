// DeepSeek AI — asystent muzyczny dla BONZO_media_HUB
// Wszystkie wywołania idą przez /api/ai-music (klucz na serwerze)

import type { Track } from './media-context'
import type {
  CoverArtApiResponse,
  CoverResult,
  LyricsApiResponse,
  MusicAiApiResponse,
} from './music-types'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ArtistGroup {
  artist: string
  tracks: Track[]
  trackCount: number
}

export interface PlaylistSuggestion {
  name: string
  description: string
  trackTitles: string[] // tytuły/wykonawcy jako tekst z AI
}

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Jesteś pomocnym asystentem muzycznym dla aplikacji BONZO_media_HUB.
Pomagasz użytkownikom:
- organizować bibliotekę muzyczną
- tworzyć tematyczne playlisty
- grupować artystów i albumy
- szukać informacji o muzyce
- doradzać przy porządkowaniu kolekcji

Odpowiadaj po polsku, chyba że użytkownik napisze po angielsku.
Bądź konkretny i pomocny. Przy sugestii playlist podaj dokładną nazwę playlisty,
krótki opis i listę: "Tytuł — Wykonawca".`

// ─── Core API call ─────────────────────────────────────────────────────────────
export async function askMusicAI(messages: ChatMessage[]): Promise<string> {
  const res = await fetch('/api/ai-music', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    }),
  })

  const data = (await res.json()) as MusicAiApiResponse

  if (!res.ok || data.error) {
    throw new Error(data.error ?? `HTTP ${res.status}`)
  }

  return data.content as string
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

/** Grupuj tracki według artysty, sortuj malejąco po liczbie utworów */
export function groupByArtist(tracks: Track[]): ArtistGroup[] {
  const map = new Map<string, Track[]>()
  for (const track of tracks) {
    const key = track.artist?.trim() || 'Nieznany artysta'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(track)
  }
  return Array.from(map.entries())
    .map(([artist, tracks]) => ({ artist, tracks, trackCount: tracks.length }))
    .sort((a, b) => b.trackCount - a.trackCount)
}

/** Buduj krótkie podsumowanie biblioteki dla AI */
export function buildTrackContext(tracks: Track[]): string {
  if (tracks.length === 0) return 'Biblioteka jest pusta.'
  const lines = tracks
    .slice(0, 60)
    .map(t => `- "${t.title}" – ${t.artist}${t.album ? ` (${t.album})` : ''}`)
  const more = tracks.length > 60 ? `\n...i ${tracks.length - 60} więcej` : ''
  return `Biblioteka muzyczna (${tracks.length} utworów):\n${lines.join('\n')}${more}`
}

// ─── High-level helpers ────────────────────────────────────────────────────────

/** Zapytaj AI o sugestie playlist na podstawie aktualnej biblioteki */
export async function suggestPlaylists(
  tracks: Track[],
  history: ChatMessage[] = []
): Promise<string> {
  const ctx = buildTrackContext(tracks)
  const prompt = `${ctx}\n\nZaproponuj 3–5 tematycznych playlist z tych utworów.
Dla każdej podaj:
## Nazwa playlisty
*Krótki opis (1 zdanie)*
- Tytuł — Wykonawca
...`

  return askMusicAI([...history, { role: 'user', content: prompt }])
}

/** Zapytaj AI o ogólną organizację biblioteki */
export async function suggestOrganization(
  tracks: Track[],
  history: ChatMessage[] = []
): Promise<string> {
  const groups = groupByArtist(tracks)
  const artistSummary = groups
    .slice(0, 20)
    .map(g => `${g.artist} (${g.trackCount} ut.)`)
    .join(', ')
  const prompt = `Moja biblioteka ma ${tracks.length} utworów. Artyści: ${artistSummary}${groups.length > 20 ? ` i ${groups.length - 20} więcej` : ''}.

Zaproponuj jak to zorganizować — strukturę folderów, kategorie gatunkowe,
jak grupować podobnych artystów. Bądź konkretny i praktyczny.`

  return askMusicAI([...history, { role: 'user', content: prompt }])
}

/** Grupuj artystów z taką samą nazwą (case-insensitive dedup) */
export function mergeArtistDuplicates(tracks: Track[]): ArtistGroup[] {
  const map = new Map<string, { canonical: string; tracks: Track[] }>()
  for (const track of tracks) {
    const raw = track.artist?.trim() || 'Nieznany artysta'
    const key = raw.toLowerCase()
    if (!map.has(key)) map.set(key, { canonical: raw, tracks: [] })
    map.get(key)!.tracks.push(track)
  }
  return Array.from(map.values())
    .map(({ canonical, tracks }) => ({
      artist: canonical,
      tracks,
      trackCount: tracks.length,
    }))
    .sort((a, b) => b.trackCount - a.trackCount)
}

/** Szukaj tekstów przez wewnętrzne API */
export async function fetchLyrics(
  artist: string,
  title: string
): Promise<string> {
  const params = new URLSearchParams({ artist, title })
  const res = await fetch(`/api/lyrics?${params}`)
  const data = (await res.json()) as LyricsApiResponse
  if (!res.ok || data.error) throw new Error(data.error ?? 'Nie znaleziono tekstu')
  return data.lyrics as string
}

/** Szukaj okładek przez wewnętrzne API */
export async function fetchCoverArt(
  artist: string,
  album?: string,
  title?: string
): Promise<CoverResult[]> {
  const params = new URLSearchParams({ artist })
  if (album) params.set('album', album)
  if (title) params.set('title', title)
  const res = await fetch(`/api/cover-art?${params}`)
  const data = (await res.json()) as CoverArtApiResponse
  if (!res.ok) throw new Error(data.error ?? 'Błąd wyszukiwania okładek')
  return data.results ?? []
}
