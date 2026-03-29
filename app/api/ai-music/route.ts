import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'error'

// Proxy dla DeepSeek API — klucz zostaje po stronie serwera
export async function POST(request: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Brak klucza DEEPSEEK_API_KEY w .env. Dodaj: DEEPSEEK_API_KEY=sk-...' },
      { status: 500 }
    )
  }

  let body: { messages: { role: string; content: string }[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400 })
  }

  if (!body.messages || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: 'Brak pola messages' }, { status: 400 })
  }

  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: body.messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json(
        { error: `DeepSeek API: ${res.status} — ${errText.slice(0, 200)}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content ?? ''
    return NextResponse.json({ content })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Nieznany błąd'
    return NextResponse.json({ error: `Błąd połączenia: ${msg}` }, { status: 500 })
  }
}
