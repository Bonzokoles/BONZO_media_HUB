// Skrypt: wyciąga recenzje z plików HTML RECENZJE_GIGACHAD
// i generuje lib/gigachad-reviews.ts
// Uruchom: node movies-app/extract_reviews.mjs

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIR = join(__dirname, 'movies/RECENZJE_GIGACHAD')
const OUT = join(__dirname, '../lib/gigachad-reviews.ts')

const STYLES = ['akademicki', 'bukowski', 'thompson', 'gombrowicz', 'mrozek']

function extractReviews(html, filename) {
  const reviews = {}

  // Znajdź wszystkie review-block i wyciągnij h3 + review-content
  const blockRe = /<div class="review-block"[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<div class="review-content">([\s\S]*?)<\/div>\s*<\/div>/gi
  let match

  while ((match = blockRe.exec(html)) !== null) {
    const rawH3 = match[1].replace(/<[^>]+>/g, '').trim().toUpperCase()
    const rawContent = match[2]
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    const style = STYLES.find(s => rawH3.includes(s.toUpperCase()))
    if (style && rawContent.length > 50) {
      reviews[style] = rawContent
    }
  }

  return reviews
}

function titleToId(filename) {
  // filename = "12 Monkeys.html" → normalize
  const title = filename.replace(/\.html$/i, '').trim()
  return title
}

const files = readdirSync(DIR).filter(f => f.endsWith('.html') && f !== 'index.html')
const result = {}

for (const file of files) {
  const html = readFileSync(join(DIR, file), 'utf8')
  const title = titleToId(file)
  const reviews = extractReviews(html, file)
  if (Object.keys(reviews).length > 0) {
    result[title] = reviews
  }
  process.stdout.write(`[OK] ${title}: ${Object.keys(reviews).join(', ')}\n`)
}

// Generuj plik TypeScript
const ts = `// AUTO-GENERATED — nie edytuj ręcznie
// Źródło: movies-app/movies/RECENZJE_GIGACHAD/*.html
// Regeneruj: node movies-app/extract_reviews.mjs

export const gigachadReviews: Record<string, Record<string, string>> = ${JSON.stringify(result, null, 2)}
`

writeFileSync(OUT, ts, 'utf8')
console.log(`\nWygenerowano: lib/gigachad-reviews.ts (${files.length} filmów)`)
