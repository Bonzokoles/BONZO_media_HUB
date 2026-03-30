import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"

export const dynamic = 'force-dynamic'

interface AiMessage {
  role: string
  content: string
}

interface AiRequestBody {
  action?: string
  prompt?: string
  messages?: AiMessage[]
  model?: string
  title?: string
  style?: string
}

// Dostępne modele Workers AI
const MODELS = {
  chat: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  vision: "@cf/llava-hf/llava-1.5-7b-hf",
  embedding: "@cf/baai/bge-base-en-v1.5",
} as const

const extractLatestPrompt = (prompt?: string, messages?: AiMessage[]) => {
  return prompt?.trim() || messages?.at(-1)?.content?.trim() || ""
}

const buildChatMessages = (prompt?: string, messages?: AiMessage[]) => {
  const history = messages ?? []
  const latestPrompt = prompt?.trim()

  if (!latestPrompt) {
    return history.length > 0 ? history : [{ role: "user", content: "" }]
  }

  return [...history, { role: "user", content: latestPrompt }]
}

const parseContextValue = (input: string, key: string) => {
  const match = input.match(new RegExp(`${key}=([\\w-]+)`, "i"))
  return match?.[1] ?? ""
}

const parseContextNumber = (input: string, key: string) => {
  const match = input.match(new RegExp(`${key}=(\\d+)`, "i"))
  return match ? Number(match[1]) : 0
}

const pluralize = (count: number, one: string, few: string, many: string) => {
  const tens = count % 100
  const ones = count % 10

  if (count === 1) return one
  if (tens >= 12 && tens <= 14) return many
  if (ones >= 2 && ones <= 4) return few
  return many
}

const extractUserQuestion = (input: string) => {
  const match = input.match(/Użytkownik:\s*([\s\S]*?)(?:\n\nOdpowiedz|$)/i)
  return match?.[1]?.trim() || input.trim()
}

const buildLocalChatFallback = (input: string) => {
  const question = extractUserQuestion(input)
  const normalizedQuestion = question.toLowerCase()
  const activeView = parseContextValue(input, "widok") || "music"
  const localTracks = parseContextNumber(input, "localTracks")
  const playlists = parseContextNumber(input, "playlisty")
  const favoriteTracks = parseContextNumber(input, "ulubione_tracks")
  const favoriteFilms = parseContextNumber(input, "ulubione_filmy")
  const favoriteLinks = parseContextNumber(input, "ulubione_linki")

  if (normalizedQuestion.includes("ile mam playlist")) {
    return `W BONZO_media_HUB masz ${playlists} ${pluralize(playlists, "playlistę", "playlisty", "playlist")}.`
  }

  if (normalizedQuestion.includes("ile mam utwor") || normalizedQuestion.includes("ile mam track")) {
    return `W BONZO_media_HUB masz ${localTracks} ${pluralize(localTracks, "utwór", "utwory", "utworów")} w bibliotece muzycznej.`
  }

  if (normalizedQuestion.includes("ile mam ulubionych") || normalizedQuestion.includes("co mam w ulubionych")) {
    return `Ulubione w BONZO_media_HUB: ${favoriteTracks} ${pluralize(favoriteTracks, "track", "tracki", "tracków")}, ${favoriteFilms} ${pluralize(favoriteFilms, "film", "filmy", "filmów")}, ${favoriteLinks} ${pluralize(favoriteLinks, "link", "linki", "linków")}.`
  }

  if (normalizedQuestion.includes("jaki mam widok") || normalizedQuestion.includes("na jakim widoku")) {
    return `Aktualnie jesteś w widoku ${activeView} w BONZO_media_HUB.`
  }

  return `Tryb lokalny BONZO AI: widok=${activeView}, utwory=${localTracks}, playlisty=${playlists}, ulubione filmy=${favoriteFilms}. Mogę odpowiadać na podstawie bieżącego stanu aplikacji.`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as AiRequestBody
    const { action, prompt, messages, model } = body

    let env: CloudflareEnv
    try {
      env = getRequestContext().env as CloudflareEnv
    } catch {
      const latestPrompt = extractLatestPrompt(prompt, messages)
      return NextResponse.json({
        result: action === "chat"
          ? buildLocalChatFallback(latestPrompt)
          : `[LOCAL] AI Workers niedostępne lokalnie. Odpowiedź na: "${latestPrompt}"`,
      })
    }

    const ai = env.AI

    switch (action) {
      // ── Chat / asystent filmowy / muzyczny ──────────────────────────────
      case "chat": {
        const msgs = buildChatMessages(prompt, messages)
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
