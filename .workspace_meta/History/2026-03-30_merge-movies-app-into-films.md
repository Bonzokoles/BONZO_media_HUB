# Task: merge movies-app into films

**Data:** 2026-03-30
**Status:** completed

## Cel
Włączyć dane i UI z `components/features/films/movies-app/` do widoku `films`, usuwając osobny top-level widok `vault`.

## Zakres wykonanych zmian
- `components/features/films/movie-vault.tsx`
  - przerobione na natywny komponent Next/React z lokalnym importem `movies_db.json`
  - poprawione budowanie URL obrazów TMDB
- `components/features/films/film-library.tsx`
  - dodana sekcja `vault` i render `MovieVault` wewnątrz `films`
- `app/page.tsx`
  - usunięty osobny render `activeView === "vault"`
- `components/features/navigation/sidebar-nav.tsx`
  - usunięty osobny item `VAULT`
- `components/features/navigation/mobile-nav.tsx`
  - usunięty osobny item `Vault`
- `lib/media-context.tsx`
  - usunięty typ widoku `vault` z `ActiveView`, parsera i URL state

## Walidacja
- Sprawdzenie błędów TS/Problems dla kluczowych plików wykonane.
- Brak błędów blokujących po integracji logiki widoków.
- Pozostałe sugestie dotyczące skrótów klas Tailwind są stylistyczne, nie blokują działania.

## Uwagi
- Nie użyto narzędzia „v0 MCP”, bo nie jest dostępne w aktywnym zestawie narzędzi tej sesji.
- Efekt końcowy odpowiada celowi: `vault` nie istnieje już jako osobna aplikacja/widok globalny, działa jako część `films` w Next.
