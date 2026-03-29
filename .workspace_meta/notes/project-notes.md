# BONZO Media HUB — notatki projektu

> **Ostatnia aktualizacja:** 2026-03-27  
> **Typ:** Next.js media web app  
> **Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, pnpm

---

## Opis projektu

**BONZO Media HUB** to aplikacja webowa do zarządzania multimediami i narzędziami AI. Repozytorium zawiera interfejs Next.js z komponentami do biblioteki filmów, playerów audio/video, paneli AI oraz endpointów API.

## Kluczowe obszary

| Obszar | Lokalizacja | Opis |
|--------|-------------|------|
| App Router | `app/` | routing Next.js i endpointy API |
| UI components | `components/` | komponenty paneli, playerów i UI |
| Shared logic | `lib/`, `hooks/` | helpery, kontekst mediów, hooki |
| Static assets | `public/` | manifest, service worker, ikony |
| Movie tooling | `movies-app/` | dane i pomocnicze narzędzia filmowe |

## 2026-03-27 — bootstrap `.workspace_meta`

- skopiowano template `C:\WORKSPACE_META_TEMPLATE\.workspace_meta` do repozytorium
- zaktualizowano `.workspace_meta\workspace.spec.json` pod realny projekt `BONZO_media_HUB`
- dopisano `.workspace_meta/secrets/` oraz `.workspace_meta/awesome-copilot/` do `.gitignore`
- uruchomiono bootstrap SDK i dodano `@github/copilot-sdk` do `package.json`
- zaktualizowano `pnpm-lock.yaml` po instalacji zależności

## Uwagi operacyjne

- package manager projektu: `pnpm`
- repo jest przygotowane do dalszej dokumentacji w `.workspace_meta/notes/`
- taski robocze powinny trafiać do `.workspace_meta/ToDo/`, a po zakończeniu do `.workspace_meta/History/`

## Następne sensowne kroki

- uzupełnić projektowe ADR-y w `.workspace_meta/notes/decisions.md`
- dopisać snapshoty po większych zmianach funkcjonalnych
- zdecydować, czy `.workspace_meta/awesome-copilot/` ma zostać lokalne-only, czy częściowo wersjonowane

## Odkrycia

- 2026-03-29: Efekt „ciągłego uruchamiania” w dev wynikał z aktywnego PWA/Service Workera w `NODE_ENV=development` (cykliczne requesty i odświeżenia). Rozwiązanie: wyłączyć PWA w dev (`next.config.mjs`) oraz dodać czyszczenie starych rejestracji SW/cache w `components/service-worker-register.tsx`.
