import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"

export const dynamic = "force-dynamic"

const CHAT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"

type TrailerAssistantRequest = {
  movieTitle?: string
  overview?: string
  trailerName?: string
  trailerLanguage?: string
}

type TrailerAssistantResponse = {
  translatedTitle: string
  polishSummary: string
  subtitleStatus: string
  languageNote: string
}

const parseJsonObject = (input: string) => {
  const match = input.match(/\{[\s\S]*\}/)
  if (!match) return null

  try {
    return JSON.parse(match[0]) as TrailerAssistantResponse
  } catch {
    return null
  }
}

const buildLocalFallback = ({
  movieTitle,
  overview,
  trailerName,
  trailerLanguage,
}: TrailerAssistantRequest): TrailerAssistantResponse => {
  const normalizedLanguage = (trailerLanguage || "").toLowerCase()
  const isPolishTrailer = normalizedLanguage === "pl"

  return {
    translatedTitle: trailerName?.trim() || `Trailer — ${movieTitle || "BONZO Film"}`,
    polishSummary:
      overview?.trim() ||
      `Trailer dla tytułu ${movieTitle || "BONZO Film"}. Brak szerszego opisu z TMDB, więc pokazuję osadzony player i preferuję polski interfejs oraz napisy YouTube, jeśli są dostępne.`,
    subtitleStatus: "Napisy YouTube są ustawione na preferencję PL i włączą się automatycznie, jeśli materiał je udostępnia.",
    languageNote: isPolishTrailer
      ? "TMDB oznacza ten trailer jako polskojęzyczny lub bliski polskiej lokalizacji."
      : "Trailer nie jest oznaczony jako polski, więc BONZO ustawia preferencję PL dla napisów i interfejsu YouTube, jeśli platforma je udostępnia.",
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TrailerAssistantRequest
    const fallback = buildLocalFallback(body)

    let env: CloudflareEnv
    try {
      env = getRequestContext().env as CloudflareEnv
    } catch {
      return NextResponse.json(fallback)
    }

    const ai = env.AI
    const result = await ai.run(CHAT_MODEL, {
      messages: [
        {
          role: "system",
          content:
            "Jesteś BONZO Trailer Agent. Na podstawie tytułu filmu, opisu TMDB i nazwy trailera przygotuj krótki panel po polsku. Nie transkrybuj dialogów i nie udawaj pełnych napisów. Jeśli nie masz tekstu mówionego, napisz wyraźnie, że napisy zależą od YouTube. Zwróć WYŁĄCZNIE JSON: {\"translatedTitle\": string, \"polishSummary\": string, \"subtitleStatus\": string, \"languageNote\": string}",
        },
        {
          role: "user",
          content: JSON.stringify({
            movieTitle: body.movieTitle || "",
            overview: body.overview || "",
            trailerName: body.trailerName || "",
            trailerLanguage: body.trailerLanguage || "",
          }),
        },
      ],
      max_tokens: 400,
    })

    const responseText = (result as { response?: string }).response || ""
    const parsed = parseJsonObject(responseText)

    return NextResponse.json({
      ...fallback,
      ...parsed,
    })
  } catch (error) {
    console.error("Trailer assistant error:", error)
    return NextResponse.json(
      buildLocalFallback({}),
      { status: 200 },
    )
  }
}
