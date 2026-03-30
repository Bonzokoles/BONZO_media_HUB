"use client"

import { useState } from "react"
import { useMedia } from "@/lib/media-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Bot, Loader2, MessageSquare, Minimize2, Send, Sparkles, X } from "lucide-react"

type ChatRole = "user" | "assistant"

interface ChatMessage {
  role: ChatRole
  content: string
}

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Cześć! Jestem BONZO AI 🤖 Mogę pomóc z aplikacją, polecić film, ogarnąć playlistę albo doradzić co obejrzeć i czego posłuchać.",
}

const getPlaylistCount = () => {
  if (typeof window === "undefined") return 0

  try {
    const saved = localStorage.getItem("bonzo-playlists")
    if (!saved) return 0

    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed.length : 0
  } catch {
    return 0
  }
}

export function GlobalAiChatbox() {
  const { activeView, localTracks, favorites } = useMedia()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const buildContextLine = () => {
    const playlistCount = getPlaylistCount()
    return `Kontekst: widok=${activeView}, localTracks=${localTracks.length}, playlisty=${playlistCount}, ulubione_tracks=${favorites.tracks.length}, ulubione_filmy=${favorites.films.length}, ulubione_linki=${favorites.links.length}`
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }]
    setMessages(nextMessages)
    setInput("")
    setError("")
    setLoading(true)

    try {
      const apiMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const contextualUserPrompt = `${buildContextLine()}\n\nUżytkownik: ${text}\n\nOdpowiedz po polsku, krótko i konkretnie, z naciskiem na BONZO_media_HUB, muzykę i film.`

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          prompt: contextualUserPrompt,
          messages: apiMessages,
        }),
      })

      const data = (await response.json()) as { result?: string; error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? "Błąd AI")
      }

      const answer = data.result?.trim() || "Brak odpowiedzi z modelu."
      setMessages((prev) => [...prev, { role: "assistant", content: answer }])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Nie udało się wysłać wiadomości"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 font-mono">
      {!open ? (
        <Button
          onClick={() => setOpen(true)}
          className="h-11 gap-2 border border-primary bg-background/90 px-4 text-xs uppercase tracking-wider text-primary backdrop-blur hover:bg-primary/10"
        >
          <Bot className="h-4 w-4" />
          BONZO_AI_CHAT
          <Sparkles className="h-3 w-3" />
        </Button>
      ) : (
        <div className="flex h-[420px] w-[350px] flex-col border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <MessageSquare className="h-3.5 w-3.5" />
              BONZO_AI
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-7 w-7"
                title="Zminimalizuj"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setMessages([WELCOME_MESSAGE])
                  setError("")
                }}
                className="h-7 w-7"
                title="Nowa rozmowa"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded border px-2.5 py-2 text-[11px] leading-relaxed",
                    msg.role === "user"
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-secondary/40 text-foreground"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                BONZO AI myśli...
              </div>
            )}

            {error && <p className="text-[11px] text-red-400">Błąd: {error}</p>}
          </div>

          <div className="border-t border-border p-2">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Zapytaj o appkę, muzykę lub filmy..."
                className="h-8 text-xs"
                disabled={loading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="h-8 gap-1 px-2"
                title="Wyślij"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
