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

### [2026-03-29 20:05] Snapshot — checkpoint przed restartem

**Zrobiono:**
- wdrożono Worker proxy `bonzo-media-hub` z endpointami `/api/health`, `/api/tmdb`, `/api/r2`, `/api/reviews`
- dodano `lib/remote-media.ts` i przepięto `components/film-library.tsx` na Worker-first z fallbackiem do lokalnych `/api`
- wyniesiono typy muzyczne do `lib/music-types.ts`, odpięto klienta od importów z `app/api/*`
- dodano wrapper buildu `scripts/run-next-build.mjs` i podmieniono `package.json` tak, aby `NEXT_STATIC_EXPORT=1` nie wywalał buildu na `app/api/*/route.ts`
- zapisano historię zadania w `.workspace_meta/History/2026-03-29_fix-static-export-cover-art.md`

**Następne kroki:**
- wykonać smoke test endpointów Workera po restarcie
- sprawdzić końcowy deploy Pages po aktualnych zmianach
- zdecydować, czy `lyrics` i `cover-art` też przenieść z lokalnych route handlerów do Workera

**Blokady:**
- wymagany restart komputera użytkownika; testy końcowe odłożone do następnej sesji

### [2026-03-19 00:00] Snapshot — Inicjalizacja workspace

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
