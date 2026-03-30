# Prompt: Refaktor components/ — feature-based structure

**Repo:** `U:\www_BONZO_media_HUB_inc`  
**Agent:** Execution Architect  
**Data:** 2026-03-30

---

## Krok B — refaktor struktury komponentów

Utwórz i użyj struktury:
- `components/features/films`
- `components/features/music`
- `components/features/video`
- `components/features/pwa`
- `components/features/navigation`
- `components/shared/ui`
- `components/shared/layout`

Najpierw przenieś:
- `service-worker-register.tsx` → `features/pwa/`
- `pwa-installer.tsx` → `features/pwa/`
- `mobile-header.tsx` → `features/navigation/`
- `mobile-nav.tsx` → `features/navigation/`
- `sidebar-nav.tsx` → `features/navigation/`

---

## Krok C — kompatybilność importów (obowiązkowe)

Dla każdego przeniesionego pliku zostaw pod starą ścieżką plik kompatybilności:
- re-export nowej lokalizacji (zero łamania obecnych importów)
- stopniowa migracja importów do nowych ścieżek

---

## Krok D — walidacja i runtime

Po zmianach:
1. TypeScript/lint/build — wszystko ma przejść.
2. Sprawdź, że nie wraca stary popup PWA „pobieranie aplikacji".
3. Sprawdź, że `film-library` działa.
4. Potwierdź dla `pages.dev`:
   - recenzje da się otworzyć
   - trailery są pobierane z TMDB (bez „brak trailera" dla pozycji które mają trailer)
5. Jeśli trzeba, popraw fallback API/proxy tak, by `pages.dev` i `workers.dev` miały spójne źródło TMDB.

---

## Krok E — raport końcowy

Na końcu podaj:
- listę przeniesionych plików
- listę compatibility re-export files
- listę zaktualizowanych importów
- wyniki build/test
- ewentualne ryzyka
- kolejny etap refaktoru: `films → music → video` (co dokładnie dalej)

---

## Tryb pracy

- bez pytań blokujących
- małe bezpieczne kroki
- delta raport po każdej większej serii zmian
