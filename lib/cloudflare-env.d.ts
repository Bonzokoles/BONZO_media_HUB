// Rozszerza wygenerowany CloudflareEnv o nasze bindingi z wrangler.toml
interface CloudflareEnv {
  AI: Ai
  DB: D1Database
  MEDIA: R2Bucket
  TMDB_READ_TOKEN?: string
  DEEPSEEK_API_KEY?: string
  OPENAI_API_KEY?: string
}
