export interface CoverResult {
  url: string
  source: string
  size: string
}

export interface LyricsApiResponse {
  lyrics?: string
  error?: string
}

export interface CoverArtApiResponse {
  results?: CoverResult[]
  error?: string
}

export interface MusicAiApiResponse {
  content?: string
  error?: string
}
