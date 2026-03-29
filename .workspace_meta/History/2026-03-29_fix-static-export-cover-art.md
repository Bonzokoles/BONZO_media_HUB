# Naprawa static export dla cover-art

## Cel
Usunąć błąd builda `Export encountered an error on /api/cover-art/route` podczas eksportu statycznego.

## Zakres
- przeanalizowano `app/api/cover-art/route.ts`
- sprawdzono pozostałe `app/api/*` pod kątem tego samego wzorca
- wdrożono poprawkę kompatybilną ze static export
- zweryfikowano build

## Oczekiwane pliki
- `app/api/cover-art/route.ts`
- `lib/deepseek-music-ai.ts`
- `components/music-library-ai.tsx`
- `lib/music-types.ts`
- `scripts/run-next-build.mjs`
- `package.json`

## Skills / agent
- Skills: brak dopasowanego skilla z dostępnej listy
- Agent: Context Architect

## Zakończenie
- **Data zakończenia:** 2026-03-29
- **Podsumowanie:** static export przestawał działać, bo route handlery w `app/api/*` używały `NextRequest` i były analizowane podczas eksportu. Dodano wrapper buildu, który przy `NEXT_STATIC_EXPORT=1` tymczasowo stubuje `route.ts`, a po buildzie przywraca oryginały.
- **Zmodyfikowane pliki:** `lib/deepseek-music-ai.ts`, `components/music-library-ai.tsx`, `app/api/cover-art/route.ts`, `lib/music-types.ts`, `scripts/run-next-build.mjs`, `package.json`, `.workspace_meta/notes/project-notes.md`
- **Weryfikacja:** `npm run build` z `NEXT_STATIC_EXPORT=1` przechodzi bez błędu `/api/cover-art/route`.
