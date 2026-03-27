"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Monitor, Smartphone, Chrome, CheckCircle, ExternalLink } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setIsInstalled(true)
    }
    setDeferredPrompt(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs uppercase tracking-wider"
        >
          <Download className="h-3 w-3" />
          {isInstalled ? "INSTALLED" : "INSTALL"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl font-mono">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm uppercase tracking-widest">
            <Download className="h-4 w-4" />
            INSTALL_BONZO_MEDIA_HUB
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Install the app for offline use and background playback
          </DialogDescription>
        </DialogHeader>

        {isInstalled ? (
          <div className="flex items-center gap-3 border border-primary/50 bg-primary/10 p-4">
            <CheckCircle className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                APP_INSTALLED
              </p>
              <p className="text-xs text-muted-foreground">
                BONZO_media_HUB is installed and ready for offline use
              </p>
            </div>
          </div>
        ) : deferredPrompt ? (
          <div className="space-y-4">
            <div className="border border-border bg-card p-4">
              <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
                [QUICK_INSTALL]
              </p>
              <Button
                onClick={handleInstall}
                className="w-full gap-2 text-xs uppercase tracking-wider"
              >
                <Download className="h-4 w-4" />
                INSTALL_NOW
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="windows" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="windows" className="gap-2 text-xs uppercase">
                <Monitor className="h-3 w-3" />
                WINDOWS
              </TabsTrigger>
              <TabsTrigger value="android" className="gap-2 text-xs uppercase">
                <Smartphone className="h-3 w-3" />
                ANDROID
              </TabsTrigger>
              <TabsTrigger value="chrome" className="gap-2 text-xs uppercase">
                <Chrome className="h-3 w-3" />
                CHROME
              </TabsTrigger>
            </TabsList>

            <TabsContent value="windows" className="mt-4 space-y-4">
              <div className="border border-border bg-card p-4">
                <p className="mb-3 text-xs uppercase tracking-wider text-primary">
                  [WINDOWS_INSTALLATION]
                </p>
                <div className="space-y-3 text-xs">
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">01.</span>
                    <span>Open BONZO_media_HUB in Microsoft Edge or Chrome</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">02.</span>
                    <span>Click the install icon in the address bar (or menu)</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">03.</span>
                    <span>Click &quot;Install&quot; in the prompt dialog</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">04.</span>
                    <span>App will appear in Start Menu and Desktop</span>
                  </div>
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                    [EDGE_SHORTCUT]
                  </p>
                  <code className="block bg-muted p-2 text-xs">
                    Menu (...) → Apps → Install this site as an app
                  </code>
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                    [CHROME_SHORTCUT]
                  </p>
                  <code className="block bg-muted p-2 text-xs">
                    Menu (⋮) → Save and share → Install page as app...
                  </code>
                </div>
              </div>

              <div className="border border-accent/30 bg-accent/10 p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-accent">
                  [BACKGROUND_AUDIO]
                </p>
                <p className="text-xs text-muted-foreground">
                  After installation, music will continue playing when the window is minimized
                  or when using other applications.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="android" className="mt-4 space-y-4">
              <div className="border border-border bg-card p-4">
                <p className="mb-3 text-xs uppercase tracking-wider text-primary">
                  [ANDROID_INSTALLATION]
                </p>
                <div className="space-y-3 text-xs">
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">01.</span>
                    <span>Open BONZO_media_HUB in Chrome browser</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">02.</span>
                    <span>Tap the menu button (⋮) in top right</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">03.</span>
                    <span>Select &quot;Add to Home screen&quot; or &quot;Install app&quot;</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">04.</span>
                    <span>Tap &quot;Install&quot; to confirm</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">05.</span>
                    <span>App icon will appear on home screen</span>
                  </div>
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                    [ALTERNATIVE_BROWSERS]
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Samsung Internet, Firefox, Opera also support PWA installation
                  </p>
                </div>
              </div>

              <div className="border border-accent/30 bg-accent/10 p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-accent">
                  [BACKGROUND_PLAYBACK]
                </p>
                <p className="text-xs text-muted-foreground">
                  Music continues playing when screen is off or using other apps.
                  Control playback from notification panel or lock screen.
                </p>
              </div>

              <div className="border border-primary/30 bg-primary/10 p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-primary">
                  [OFFLINE_MODE]
                </p>
                <p className="text-xs text-muted-foreground">
                  Previously loaded content and local media files are available offline.
                  The app caches essential resources automatically.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="chrome" className="mt-4 space-y-4">
              <div className="border border-border bg-card p-4">
                <p className="mb-3 text-xs uppercase tracking-wider text-primary">
                  [CHROME_DESKTOP_INSTALLATION]
                </p>
                <div className="space-y-3 text-xs">
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">01.</span>
                    <span>Look for install icon (⊕) in address bar</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">02.</span>
                    <span>Or click Menu (⋮) → Save and share → Install...</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">03.</span>
                    <span>Click &quot;Install&quot; in the dialog</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">04.</span>
                    <span>App opens in its own window</span>
                  </div>
                </div>
              </div>

              <div className="border border-border bg-card p-4">
                <p className="mb-3 text-xs uppercase tracking-wider text-primary">
                  [MANAGE_INSTALLED_APPS]
                </p>
                <code className="block bg-muted p-2 text-xs">
                  chrome://apps
                </code>
                <p className="mt-2 text-xs text-muted-foreground">
                  View and manage all installed PWAs in Chrome
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            [FEATURES_AFTER_INSTALL]
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-primary" />
              <span>Offline support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-primary" />
              <span>Background audio</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-primary" />
              <span>System integration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-primary" />
              <span>Desktop shortcuts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-primary" />
              <span>Media controls</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-primary" />
              <span>Auto updates</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
