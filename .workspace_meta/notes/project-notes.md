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
- 2026-03-29: `NEXT_STATIC_EXPORT=1` wysypuje `next build`, gdy `app/api/*/route.ts` używają obiektu `Request`/`NextRequest`. Rozwiązanie robocze: wrapper `scripts/run-next-build.mjs` tymczasowo stubuje route handlery na czas static exportu i przywraca je po buildzie; typy klienckie trzeba trzymać poza `app/api`.
- 2026-03-30: Integracja `movies-app` do struktury feature `components/features/films` została domknięta jako natywny przepływ Next/React: usunięto globalny view `vault` z `app/page.tsx`, nawigacji i `lib/media-context.tsx`; `MovieVault` działa jako sekcja wewnątrz `FilmLibrary` oraz korzysta bezpośrednio z lokalnego `movies_db.json`.
- 2026-03-30: Globalny chatbox AI przekazywał kontekst w `prompt`, ale endpoint `app/api/ai/route.ts` dla akcji `chat` brał tylko `messages`, więc model w praktyce nie widział bieżącego stanu aplikacji. Poprawka: scalać historię z `prompt` po stronie API i dołączać do kontekstu także liczbę playlist z `localStorage` (`bonzo-playlists`).
- 2026-03-30: Błąd konsolowy Radix `DialogContent requires a DialogTitle` w sekcji filmów wynikał z kilku modalów renderujących `DialogContent` bez `DialogTitle` i `DialogDescription`. Poprawka: dodać ukryte semantycznie (`sr-only`) tytuły i opisy do modalów w `film-library.tsx`, `my-collection.tsx` i `catalog-from-r2.tsx`.
- 2026-03-30: CORS dla recenzji filmowych wynikał z klientowego fetchu bezpośrednio do zewnętrznego workera `/api/reviews`. Poprawka: sekcja filmów pobiera recenzje przez istniejący same-origin endpoint `app/api/tmdb/route.ts` z akcją `reviews`; brak pliku recenzji zwraca teraz `200 { reviews: {} }` zamiast czerwonego `404` w konsoli.
