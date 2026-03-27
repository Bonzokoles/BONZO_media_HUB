"use client"

import { useState } from "react"
import {
  Bot,
  Sparkles,
  Wand2,
  MessageSquare,
  Image as ImageIcon,
  Music,
  Video,
  FileText,
  Settings2,
  Check,
  ExternalLink,
  AlertCircle,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

type AITool = {
  id: string
  name: string
  description: string
  icon: React.ElementType
  category: "chat" | "image" | "audio" | "video" | "text"
  connected: boolean
  apiKeyRequired: boolean
  configUrl?: string
}

const defaultTools: AITool[] = [
  {
    id: "openai",
    name: "OpenAI_GPT",
    description: "GPT-4, DALL-E, Whisper integration",
    icon: Bot,
    category: "chat",
    connected: false,
    apiKeyRequired: true,
  },
  {
    id: "anthropic",
    name: "ANTHROPIC_CLAUDE",
    description: "Claude AI for advanced reasoning",
    icon: MessageSquare,
    category: "chat",
    connected: false,
    apiKeyRequired: true,
  },
  {
    id: "stability",
    name: "STABILITY_AI",
    description: "Stable Diffusion image generation",
    icon: ImageIcon,
    category: "image",
    connected: false,
    apiKeyRequired: true,
  },
  {
    id: "midjourney",
    name: "MIDJOURNEY_API",
    description: "High-quality artistic images",
    icon: Wand2,
    category: "image",
    connected: false,
    apiKeyRequired: true,
  },
  {
    id: "elevenlabs",
    name: "ELEVENLABS_VOICE",
    description: "AI voice synthesis and cloning",
    icon: Music,
    category: "audio",
    connected: false,
    apiKeyRequired: true,
  },
  {
    id: "runway",
    name: "RUNWAY_ML",
    description: "AI video generation and editing",
    icon: Video,
    category: "video",
    connected: false,
    apiKeyRequired: true,
  },
  {
    id: "huggingface",
    name: "HUGGINGFACE_HUB",
    description: "Open-source model repository",
    icon: Sparkles,
    category: "text",
    connected: false,
    apiKeyRequired: true,
  },
  {
    id: "replicate",
    name: "REPLICATE_API",
    description: "Run ML models in the cloud",
    icon: Zap,
    category: "text",
    connected: false,
    apiKeyRequired: true,
  },
]

export function AIToolsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [tools, setTools] = useState<AITool[]>(defaultTools)
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)

  const handleConnect = (toolId: string) => {
    if (!apiKey.trim()) return
    
    setTools((prev) =>
      prev.map((tool) =>
        tool.id === toolId ? { ...tool, connected: true } : tool
      )
    )
    setApiKey("")
    setSelectedTool(null)
    
    // Store API key securely (in real app, use secure storage)
    localStorage.setItem(`bonzo-ai-${toolId}`, apiKey)
  }

  const handleDisconnect = (toolId: string) => {
    setTools((prev) =>
      prev.map((tool) =>
        tool.id === toolId ? { ...tool, connected: false } : tool
      )
    )
    localStorage.removeItem(`bonzo-ai-${toolId}`)
  }

  const connectedCount = tools.filter((t) => t.connected).length

  const categories = [
    { id: "chat", label: "CHAT_AI", icon: MessageSquare },
    { id: "image", label: "IMAGE_GEN", icon: ImageIcon },
    { id: "audio", label: "AUDIO_AI", icon: Music },
    { id: "video", label: "VIDEO_AI", icon: Video },
    { id: "text", label: "TEXT_AI", icon: FileText },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bot className="h-4 w-4" />
          {connectedCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-primary text-xs text-primary-foreground">
              {connectedCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl font-mono">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 uppercase tracking-widest">
            <Bot className="h-4 w-4 text-primary" />
            AI_TOOLS_INTEGRATION
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Connect AI services for enhanced features
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border border-border bg-secondary/50 p-3">
            <div className="text-xs">
              <span className="text-muted-foreground">[STATUS]</span>{" "}
              <span className="text-primary">{connectedCount}</span> AI SERVICES CONNECTED
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-2 w-2",
                connectedCount > 0 ? "bg-green-500" : "bg-muted-foreground"
              )} />
              <span className="text-xs text-muted-foreground">
                {connectedCount > 0 ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
          </div>

          {selectedTool ? (
            <div className="space-y-4 border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-primary bg-primary/10">
                    <selectedTool.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium uppercase tracking-wider">
                      {selectedTool.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {selectedTool.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTool(null)}
                  className="text-xs uppercase"
                >
                  BACK
                </Button>
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider">
                  API_KEY
                </Label>
                <div className="flex gap-2">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    placeholder="> enter_api_key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-xs uppercase"
                  >
                    {showApiKey ? "HIDE" : "SHOW"}
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3" />
                  API keys are stored locally in browser
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleConnect(selectedTool.id)}
                  disabled={!apiKey.trim()}
                  className="flex-1 gap-2 text-xs uppercase tracking-wider"
                >
                  <Check className="h-3 w-3" />
                  CONNECT
                </Button>
                {selectedTool.configUrl && (
                  <Button
                    variant="outline"
                    asChild
                    className="gap-2 text-xs uppercase"
                  >
                    <a href={selectedTool.configUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                      GET_KEY
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => {
                const categoryTools = tools.filter((t) => t.category === category.id)
                if (categoryTools.length === 0) return null

                return (
                  <div key={category.id} className="space-y-2">
                    <h4 className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary">
                      <category.icon className="h-3 w-3" />
                      {category.label}
                    </h4>
                    <div className="grid gap-2">
                      {categoryTools.map((tool) => (
                        <div
                          key={tool.id}
                          className="flex items-center justify-between border border-border p-3 transition-colors hover:border-primary/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex h-8 w-8 items-center justify-center border",
                              tool.connected 
                                ? "border-green-500 bg-green-500/10" 
                                : "border-border bg-secondary"
                            )}>
                              <tool.icon className={cn(
                                "h-4 w-4",
                                tool.connected ? "text-green-500" : "text-muted-foreground"
                              )} />
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wider">
                                {tool.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {tool.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {tool.connected ? (
                              <>
                                <span className="flex items-center gap-1 text-xs text-green-500">
                                  <Check className="h-3 w-3" />
                                  CONNECTED
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDisconnect(tool.id)}
                                  className="text-xs text-destructive uppercase hover:text-destructive"
                                >
                                  DISCONNECT
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedTool(tool)}
                                className="gap-2 text-xs uppercase"
                              >
                                <Settings2 className="h-3 w-3" />
                                SETUP
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              [INFO] Connect AI services to enable smart features like auto-tagging,
              content generation, and intelligent search.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
