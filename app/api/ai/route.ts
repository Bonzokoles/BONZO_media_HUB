import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"

export const dynamic = 'error'

// Dostępne modele Workers AI
const MODELS = {
  chat: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  vision: "@cf/llava-hf/llava-1.5-7b-hf",
  embedding: "@cf/baai/bge-base-en-v1.5",
} as const

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { action?: string; prompt?: string; messages?: { role: string; content: string }[]; model?: string; title?: string; style?: string }
    const { action, prompt, messages, model } = body

    let env: CloudflareEnv
    try {
      env = getRequestContext().env as CloudflareEnv
    } catch {
      // Lokalnie (bez CF) — zwróć mock
      return NextResponse.json({
        result: `[LOCAL] AI Workers niedostępne lokalnie. Odpowiedź na: "${prompt || messages?.at(-1)?.content}"`,
      })
    }

    const ai = env.AI

    switch (action) {
      // ── Chat / asystent filmowy / muzyczny ──────────────────────────────
      case "chat": {
        const msgs = messages ?? [{ role: "user", content: prompt ?? "" }]
        const result = await ai.run((model ?? MODELS.chat) as typeof MODELS.chat, {
          messages: [
            {
              role: "system",
              content:
                "Jesteś BONZO AI — asystentem aplikacji multimedialnej BONZO_media_HUB. Specjalizujesz się w filmach, muzyce i rekomendacjach. Odpowiadaj po polsku, zwięźle i z charakterem.",
            },
            ...msgs,
          ],
          max_tokens: 1024,
        })
        return NextResponse.json({ result: (result as { response: string }).response })
      }

      // ── Rekomendacje filmowe ─────────────────────────────────────────────
      case "film_recommend": {
        const result = await ai.run(MODELS.chat, {
          messages: [
            {
              role: "system",
              content:
                "Jesteś ekspertem filmowym. Na podstawie podanego gatunku/nastroju podaj 5 rekomendacji filmów z krótkim uzasadnieniem. Format: JSON array [{title, year, reason}]",
            },
            { role: "user", content: prompt ?? "" },
          ],
          max_tokens: 512,
        })
        let recommendations
        try {
          const text = (result as { response: string }).response
          const jsonMatch = text.match(/\[[\s\S]*\]/)
          recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : text
        } catch {
          recommendations = (result as { response: string }).response
        }
        return NextResponse.json({ result: recommendations })
      }

      // ── Opis / recenzja na żądanie ───────────────────────────────────────
      case "review": {
        const { title, style = "kinoman" } = body
        const styles: Record<string, string> = {
          kinoman: "Napisz wnikliwą recenzję filmową w stylu doświadczonego kinomana.",
          gigachad: "Napisz recenzję w stylu GIGACHAD — bezpośrednio, z humorem i pewnością siebie.",
          academic: "Napisz akademicką analizę filmu z użyciem terminologii filmoznawczej.",
        }
        const result = await ai.run(MODELS.chat, {
          messages: [
            { role: "system", content: styles[style] ?? styles.kinoman },
            { role: "user", content: `Film: ${title ?? prompt}` },
          ],
          max_tokens: 800,
        })
        return NextResponse.json({ result: (result as { response: string }).response })
      }

      // ── Embedding (semantic search) ──────────────────────────────────────
      case "embed": {
        const result = await ai.run(MODELS.embedding, { text: [prompt ?? ""] })
        return NextResponse.json({ result: (result as { data: number[][] }).data[0] })
      }

      default:
        return NextResponse.json({ error: "Nieznana akcja" }, { status: 400 })
    }
  } catch (err) {
    console.error("AI route error:", err)
    return NextResponse.json({ error: "Błąd AI" }, { status: 500 })
  }
}
