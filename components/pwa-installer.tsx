"use client"

import { useState, useEffect, useRef } from "react"
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
import { Download, Monitor, Smartphone, Chrome, CheckCircle, Star } from "lucide-react"

import { FolderOpen, HardDrive } from "lucide-react"
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [installing, setInstalling] = useState(false)

  const [musicConnected, setMusicConnected] = useState(0)
  const [videoConnected, setVideoConnected] = useState(0)
  const [supportsFolderPicker, setSupportsFolderPicker] = useState(false)
  const musicFolderRef = useRef<HTMLInputElement>(null)
  const videoFolderRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSupportsFolderPicker(typeof window !== "undefined" && "showDirectoryPicker" in window)

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

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
    setInstalling(true)
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") setIsInstalled(true)
    setDeferredPrompt(null)
    setInstalling(false)
  }

  const emitLocalFiles = (kind: "music" | "video", files: File[]) => {
    window.dispatchEvent(
      new CustomEvent("bonzo-local-files", {
        detail: { kind, files },
      })
    )
  }

  const handleFolderFiles = (kind: "music" | "video", files: FileList | null) => {
    if (!files) return

    const selected = Array.from(files)
    const accepted = selected.filter((file) =>
      kind === "music" ? file.type.startsWith("audio/") : file.type.startsWith("video/")
    )

    emitLocalFiles(kind, accepted)
    if (kind === "music") setMusicConnected(accepted.length)
    if (kind === "video") setVideoConnected(accepted.length)
  }

  const InstallButton = ({ label }: { label: string }) => (
    <div className="mt-4 border-t border-border pt-4">
      {deferredPrompt ? (
        <Button
          onClick={handleInstall}
          disabled={installing}
          className="w-full gap-2 text-xs uppercase tracking-wider"
        >
          <Download className="h-4 w-4" />
          {installing ? "INSTALLING..." : label}
        </Button>
      ) : (
        <div className="border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
          <span className="mb-1 block uppercase tracking-wider text-foreground">[MANUAL_INSTALL]</span>
          Install icon appears in address bar when app is installable. Use the browser menu if icon is missing.
        </div>
      )}
    </div>
  )

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
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">APP_INSTALLED</p>
              <p className="text-xs text-muted-foreground">
                BONZO_media_HUB is installed and ready for offline use
              </p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="windows" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="windows" className="gap-2 text-xs uppercase">
                <Monitor className="h-3 w-3" />
                WINDOWS
                <span className="ml-1 rounded bg-primary/20 px-1 py-0.5 text-[9px] text-primary">BEST</span>
              </TabsTrigger>
              <TabsTrigger value="android" className="gap-2 text-xs uppercase">
                <Smartphone className="h-3 w-3" />
                ANDROID
              </TabsTrigger>
              <TabsTrigger value="chrome" className="gap-2 text-xs uppercase">
                <Chrome className="h-3 w-3" />
                CHROME
              </TabsTrigger>
              <TabsTrigger value="local" className="gap-2 text-xs uppercase">
                <HardDrive className="h-3 w-3" />
                LOCAL_SETUP
              </TabsTrigger>
            </TabsList>

            <TabsContent value="windows" className="mt-4 space-y-4">
              <div className="border border-primary/40 bg-primary/5 p-3">
                <div className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium uppercase tracking-wider text-primary">
                    RECOMMENDED: MICROSOFT_EDGE
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Edge provides the best PWA experience on Windows — runs as native app with system integration
                </p>
              </div>

              <div className="border border-border bg-card p-4">
                <p className="mb-3 text-xs uppercase tracking-wider text-primary">[WINDOWS_INSTALLATION]</p>
                <div className="space-y-3 text-xs">
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">01.</span>
                    <span>Open BONZO_media_HUB in Microsoft Edge <span className="text-primary">(recommended)</span> or Chrome</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">02.</span>
                    <span>Click the install icon (⊕) in the address bar</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">03.</span>
                    <span>Click &quot;Install&quot; in the prompt dialog</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">04.</span>
                    <span>App appears in Start Menu, Desktop, and taskbar</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4">
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">[EDGE]</p>
                    <code className="block bg-muted p-2 text-xs">(...) → Apps → Install this site</code>
                  </div>
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">[CHROME]</p>
                    <code className="block bg-muted p-2 text-xs">(⋮) → Save and share → Install...</code>
                  </div>
                </div>
              </div>

              <InstallButton label="INSTALL_TO_WINDOWS" />
            </TabsContent>

            <TabsContent value="android" className="mt-4 space-y-4">
              <div className="border border-primary/40 bg-primary/5 p-3">
                <div className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium uppercase tracking-wider text-primary">
                    RECOMMENDED: CHROME_FOR_ANDROID
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Chrome Android delivers the best PWA install with background audio and lock screen controls
                </p>
              </div>

              <div className="border border-border bg-card p-4">
                <p className="mb-3 text-xs uppercase tracking-wider text-primary">[ANDROID_INSTALLATION]</p>
                <div className="space-y-3 text-xs">
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">01.</span>
                    <span>Open in Chrome browser <span className="text-primary">(recommended)</span></span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">02.</span>
                    <span>Tap the menu button (⋮) → &quot;Add to Home screen&quot;</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">03.</span>
                    <span>Tap &quot;Install&quot; to confirm</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">04.</span>
                    <span>App icon appears on home screen</span>
                  </div>
                </div>
                <div className="mt-4 border-t border-border pt-3">
                  <p className="mb-1 text-xs text-muted-foreground">Also supported: Samsung Internet, Firefox, Opera</p>
                </div>
              </div>

              <div className="border border-accent/30 bg-accent/10 p-3">
                <p className="mb-1 text-xs uppercase tracking-wider text-accent">[BACKGROUND_PLAYBACK]</p>
                <p className="text-xs text-muted-foreground">
                  Music continues when screen is off. Control from notification panel or lock screen.
                </p>
              </div>

              <InstallButton label="INSTALL_TO_ANDROID" />
            </TabsContent>

            <TabsContent value="chrome" className="mt-4 space-y-4">
              <div className="border border-border bg-card p-4">
                <p className="mb-3 text-xs uppercase tracking-wider text-primary">[CHROME_DESKTOP_INSTALLATION]</p>
                <div className="space-y-3 text-xs">
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">01.</span>
                    <span>Look for install icon (⊕) in address bar</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">02.</span>
                    <span>Or: Menu (⋮) → Save and share → Install page as app...</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">03.</span>
                    <span>Click &quot;Install&quot; in the dialog</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-muted-foreground">04.</span>
                    <span>App opens in its own window without browser UI</span>
                  </div>
                </div>
              </div>

              <div className="border border-border bg-card p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-primary">[MANAGE_INSTALLED_APPS]</p>
                <code className="block bg-muted p-2 text-xs">chrome://apps</code>
                <p className="mt-2 text-xs text-muted-foreground">View and manage all installed PWAs in Chrome</p>
              </div>

              <InstallButton label="INSTALL_TO_CHROME" />
            </TabsContent>

            <TabsContent value="local" className="mt-4 space-y-4">
              <input
                ref={musicFolderRef}
                type="file"
                accept="audio/*"
                multiple
                // @ts-ignore
                webkitdirectory=""
                className="hidden"
                onChange={(e) => handleFolderFiles("music", e.target.files)}
              />

              <input
                ref={videoFolderRef}
                type="file"
                accept="video/*"
                multiple
                // @ts-ignore
                webkitdirectory=""
                className="hidden"
                onChange={(e) => handleFolderFiles("video", e.target.files)}
              />

              <div className="border border-primary/40 bg-primary/5 p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">[LOCAL_MEDIA_SETUP]</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Podłącz lokalne foldery do AUDIO_PLAYER i VIDEO_PLAYER jednym kliknięciem.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Button
                  variant="outline"
                  className="gap-2 text-xs uppercase tracking-wider"
                  onClick={() => musicFolderRef.current?.click()}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  CONNECT_MUSIC_FOLDER
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 text-xs uppercase tracking-wider"
                  onClick={() => videoFolderRef.current?.click()}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  CONNECT_VIDEO_FOLDER
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="border border-border bg-card p-3">
                  <p className="uppercase tracking-wider text-muted-foreground">music connected</p>
                  <p className="mt-1 text-sm font-semibold text-primary">{musicConnected} plików</p>
                </div>
                <div className="border border-border bg-card p-3">
                  <p className="uppercase tracking-wider text-muted-foreground">video connected</p>
                  <p className="mt-1 text-sm font-semibold text-primary">{videoConnected} plików</p>
                </div>
              </div>

              <div className="border border-border bg-card p-4 text-xs">
                <p className="mb-2 uppercase tracking-wider text-primary">[LOCAL_INSTALLER_FILES]</p>
                <p className="text-muted-foreground">
                  Windows: <code className="bg-muted px-1 py-0.5">installers/windows/install-bonzo-local.bat</code>
                </p>
                <p className="mt-1 text-muted-foreground">
                  Android: <code className="bg-muted px-1 py-0.5">installers/android/setup-bonzo-android.sh</code>
                </p>
                <p className="mt-2 text-muted-foreground">
                  {supportsFolderPicker
                    ? "Twoja przeglądarka wspiera nowoczesny filesystem API."
                    : "Jeśli folder picker jest ograniczony, użyj ręcznie ADD_FOLDER w AUDIO/VIDEO."}
                </p>
              </div>
            </TabsContent>

          </Tabs>
        )}

        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">[FEATURES_AFTER_INSTALL]</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {["Offline support", "Background audio", "System integration", "Desktop shortcuts", "Media controls", "Auto updates"].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-primary" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
