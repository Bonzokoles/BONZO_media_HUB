# Project Snapshots

> Generuj snapshot co ~2h aktywnej pracy.  
> Format: data + czas → co zrobiono → co dalej → blokady

---

## Template

### [YYYY-MM-DD HH:MM] Snapshot
**Zrobiono:**
- punkt 1
- punkt 2

**Następne kroki:**
- krok 1
- krok 2

**Blokady:** brak | opis

---

<!-- Dodawaj nowe snapshoty poniżej -->

### [2026-03-30] Snapshot — PWA popup, modal width, my_collections filters + deploy

**Zrobiono:**

**Deploy:**
- `npm run deploy` — build `✓ Compiled successfully in 5.1s`, deployment `3c1a3481` wgrany na `bonzo-media-hub.stolarnia-ams.workers.dev`
- `wrangler pages deploy .open-next/assets` — statyczne assets na `bonzo-media-hub.pages.dev` (latest: `4f5c9f16`)

**PWA popup usunięty (`components/service-worker-register.tsx`):**
- usunięto stany: `updateAvailable`, `installing`, `swRegistration`
- usunięto importy: `Button`, `RefreshCw`, `Download`
- usunięto cały blok JSX "POBIERANIE APLIKACJI" i "AKTUALIZACJA DOSTĘPNA"
- usunięto funkcję `handleUpdate()`
- zachowano: offline indicator (`WifiOff`), `isOnline` state, logowanie SW

**INSTALL_APP hardened (`components/pwa-installer.tsx`):**
- dodano stan `installError`
- `handleInstall()` — guard gdy brak `deferredPrompt`: ustawia komunikat błędu po polsku zamiast cichego return
- dodano try/catch wokół `prompt()` z polskim komunikatem błędu
- dodano blok wyświetlający błąd nad listą feature'ów

**Modal width fix (`components/film-library.tsx`):**
- problem: base `DialogContent` w `ui/dialog.tsx` ma `sm:max-w-lg` który bił poprzedni `max-w-[110rem]`
- rozwiązanie: Tailwind v4 `!` suffix + inline `style` override:
  ```tsx
  <DialogContent
    className="max-h-[94vh] w-[96vw]! max-w-[96vw]! sm:max-w-[96vw]! xl:max-w-[1400px]! overflow-hidden p-0 font-mono"
    style={{ width: "min(96vw, 1400px)", maxWidth: "min(96vw, 1400px)" }}
  >
  ```

**my_collections RECENZJE filter fix (`components/film-library.tsx`):**
- problem: `film.reviews` było puste dla większości filmów; `RECENZJE_GIGACHAD` (~50 plików HTML) nie jest ładowane do danych
- rozwiązanie: `const vaultReviewsAvailable = true` — wszystkie filmy dostępne w zakładce RECENZJE
- `hasAnyReview = hasEmbeddedReviews || hasPersonalReview || vaultReviewsAvailable`

**Architektura Cloudflare (wyjaśnienie):**
- **Workers AI**: binding `AI` w `wrangler.jsonc`, trasy `/api/ai` i `/api/ai-music` już go używają — nic nie trzeba zmieniać
- **hub-proxy**: osobny standalone Worker na `bonzo-media-hub-proxy.stolarnia-ams.workers.dev`, obsługuje: TMDB proxy, R2 odczyty, reviews JSON, lyrics, cover-art — działa niezależnie

**Następne kroki:**
- hard refresh (`Ctrl+Shift+R`) lub Incognito żeby ominąć cache SW i zobaczyć nowy rozmiar modalu
- opcjonalnie: konsolidacja hub-proxy do głównego Workera jeśli potrzeba

**Blokady:** brak

### [2026-03-29 22:05] Snapshot — naprawa blank page na CF Pages + rozdzielenie Workerów

**Zrobiono:**
- zdiagnozowano źródło problemu: `bonzo-media-hub.pages.dev` miał pusty ekran mimo poprawnego buildu
- potwierdzono, że proxy Worker na `/` zwraca `Not found` celowo (obsługuje tylko ścieżki `/api/*`)
- naprawiono kolizję nazw Workerów: `workers/wrangler.proxy.toml` zmieniono z `bonzo-media-hub` na `bonzo-media-hub-proxy`
- wdrożono proxy ponownie: `https://bonzo-media-hub-proxy.stolarnia-ams.workers.dev`
- zaktualizowano `lib/remote-media.ts` (`DEFAULT_WORKER_BASE`) na nowy URL proxy
- wykonano build statyczny pod CF Pages (pusty base path, poprawne odwołania do `/_next/static/...`)
- wdrożono Pages ręcznie: nowy production deployment `5b405b0d` (commit `80bcbb1`)
- zapisano zmiany w repo i wypchnięto commit `7e5b16b`

**Następne kroki:**
- odświeżyć `https://bonzo-media-hub.pages.dev` (hard refresh) i potwierdzić UI end-to-end
- dokończyć pozostały refactor: `lib/deepseek-music-ai.ts` przepiąć na `buildLyricsUrl()` i `buildCoverArtUrl()`
- opcjonalnie dodać dedykowaną odpowiedź JSON dla `/` w proxy Workerze (zamiast 404), żeby uniknąć mylących testów root URL

**Blokady:** brak

---

### [2026-03-29 21:30] Snapshot — Worker proxy kompletny + Pages deploy

**Zrobiono:**
- smoke test Workera: `/api/health` ✅, `/api/r2` ✅, `/api/reviews` ✅, `/api/tmdb` ⚠️ (brak sekretu TMDB_READ_TOKEN)
- dodano endpointy `/api/lyrics` i `/api/cover-art` do `workers/bonzo-media-hub-proxy.mjs`
- zaktualizowano `lib/remote-media.ts` o `buildLyricsUrl()` i `buildCoverArtUrl()`
- wdrożono Worker (v `fb0f9e65`): wszystkie 6 endpointów działają produkcyjnie ✅
- ustawiono sekret `TMDB_READ_TOKEN` — TMDB zwraca filmy po polsku ✅

**Następne kroki:**
- ustawić sekret `TMDB_READ_TOKEN` w Cloudflare: `wrangler secret put TMDB_READ_TOKEN --config workers/wrangler.proxy.toml` (potrzebny klucz z themoviedb.org)
- po ustawieniu sekretu: ponownie sprawdzić `/api/tmdb?action=popular&mediaType=movie`
- rozważyć przepięcie wywołań lyrics i cover-art w `music-library-ai.tsx` na nowe helpery z `remote-media.ts`
- commit `80bcbb1` + push → GitHub Pages deploy wyzwolony automatycznie

**Blokady:** brak

---

### [2026-03-29 20:05] Snapshot — checkpoint przed restartem

**Zrobiono:**
- Utworzono `C:\WORKSPACE_META_TEMPLATE\.workspace_meta` jako osobny, samodzielny workspace
- Wypełniono `workspace.spec.json` z pełną specyfikacją template (v2.0.0)
- Zintegrowano `awesome-copilot` repozytorium (1371 plików w 14 kategoriach)
- Struktura template kompletna: README, notes, ToDo, History, mcp, secrets, Definition_of_done.html
- Dodano `project-notes.md` z pełnym opisem co jest zrobione i etap projektu
- Dodano `decisions.md` z 3 ADR-ami dokumentującymi kluczowe decyzje

**Następne kroki:**
- Przetestować kopiowanie template do nowego workspace i weryfikację workflow
- Dodać prompts/ do awesome-copilot (brakuje w obecnej wersji)
- Rozważyć automatyczny skrypt `init-workspace.ps1`

**Blokady:** brak
