# BONZO Film Catalog - Quick Start Guide

## 🎬 Szybki start w 2 minuty

### Dostęp do katalogu

Katalog filmowy jest dostępny w **dwóch wersjach**:

1. **Standalone HTML** (katalog-filmowy.html)
   - Otwórz: https://bonzo-media-hub.pages.dev/katalog-filmowy.html
   - Działa bez aplikacji Next.js
   - 105 filmów z trailerami

2. **Aplikacja Next.js** (sekcja KATALOG)
   - Otwórz: https://bonzo-media-hub.pages.dev
   - Przejdź do sekcji "KATALOG"
   - Zintegrowana z resztą aplikacji

---

## 🔍 Jak korzystać z katalogu

### 1. Wyszukiwanie filmów

```
Wpisz w search box:
- Tytuł filmu: "Drive"
- Klimat: "psychodela"
- Gatunek: "surreal"
- Platforma: "Netflix"
```

### 2. Filtrowanie po kategorii

Wybierz z dropdown:
- Psychodeliczne, ale bez horroru
- Czułe o miłości, ale bez kiczu
- Miejski Rozkład
- Kino o outsiderach
- Brudna, uliczna poezja
- Senne i eteryczne
- Kino o życiu

### 3. Obejrzyj trailer

1. Najedź kursorem na plakat filmu
2. Pojawi się przycisk ▶ play
3. Kliknij → otwiera się trailer na YouTube

### 4. Przełącz motyw

Kliknij przycisk 🌙/☀️ w prawym górnym rogu aby zmienić na jasny/ciemny motyw.

---

## 🛠️ Dla developerów

### Regeneracja katalogu

```bash
# 1. Przejdź do katalogu projektu
cd U:\www_BONZO_media_HUB_inc

# 2. Wygeneruj nowy HTML
node scripts/generate-catalog-with-trailers.mjs

# 3. Skopiuj do public
cp components/features/films/data/catalog/interactive-katalog-enhanced-pl.html public/katalog-filmowy.html

# 4. Zbuduj i wdróż
npm run build
npx wrangler pages deploy .open-next/cloudflare --project-name=bonzo-media-hub
```

### Dodanie nowych filmów

```bash
# 1. Edytuj plik JSON
nano components/features/films/data/catalog/catalog_with_tmdb.json

# 2. Dodaj film do odpowiedniej kategorii:
{
  "title": "Nowy Film",
  "year": 2024,
  "tmdb_id": 12345,
  "poster": "https://image.tmdb.org/t/p/w500/...",
  "overview": "Opis filmu...",
  "genres": ["Drama"],
  "rating": 7.5
}

# 3. Regeneruj katalog
node scripts/generate-catalog-with-trailers.mjs
```

### Pobranie trailerów z TMDB

```bash
# Ustaw klucz API (jednorazowo)
export TMDB_API_KEY="twój_klucz_z_themoviedb.org"

# Wygeneruj katalog z prawdziwymi linkami do trailerów
node scripts/generate-catalog-with-trailers.mjs
```

---

## 📊 Struktura katalogu

```
105 filmów = 7 kategorii × 15 filmów

Każdy film zawiera:
✓ Tytuł i rok
✓ Plakat (TMDB)
✓ Opis (TMDB)
✓ Ocena TMDB
✓ Gatunki i tagi
✓ Info o streamingu
✓ Link do trailera
```

---

## 💡 Protips

### Dla użytkowników

- **Łącz filtry**: Wybierz kategorię + wpisz frazę w search
- **Keyboard shortcuts**: Użyj Tab do nawigacji między polami
- **Mobile**: Katalog jest w pełni responsywny
- **Bookmark**: Dodaj katalog do zakładek w przeglądarce

### Dla developerów

- **Bez TMDB key**: Generator utworzy linki do wyszukiwania YouTube
- **Z TMDB key**: Generator pobierze bezpośrednie linki do trailerów
- **Rate limiting**: TMDB API ma limit ~40 req/10s, generator ma delay 250ms
- **Local testing**: Otwórz `interactive-katalog-enhanced-pl.html` bezpośrednio w przeglądarce

---

## 🔧 Troubleshooting

### Problem: Katalog nie wyświetla się
**Rozwiązanie**: 
- Sprawdź czy plik jest w `public/katalog-filmowy.html`
- Rebuild: `npm run build`
- Redeploy: `npx wrangler pages deploy .open-next/cloudflare --project-name=bonzo-media-hub`

### Problem: Brak trailerów lub linki nie działają
**Rozwiązanie**:
```bash
# Pobierz klucz TMDB z https://www.themoviedb.org/settings/api
export TMDB_API_KEY="twój_klucz"
node scripts/generate-catalog-with-trailers.mjs
```

### Problem: HTML jest za duży
**Rozwiązanie**: 
- Aktualny rozmiar: ~96KB (to jest OK)
- Jeśli za duży: podziel na mniejsze pliki lub ładuj dane z JSON

### Problem: Streaming info nieaktualne
**Rozwiązanie**: 
- Regeneruj katalog co miesiąc
- Dane streamingu zmieniają się w czasie

---

## 📚 Dokumentacja

- **Pełna dokumentacja**: `README.md` w tym katalogu
- **Deployment info**: `../../KATALOG_DEPLOYMENT.md`
- **TMDB API**: https://developers.themoviedb.org/3

---

## 🚀 Szybkie komendy

```bash
# Pełny workflow (development → production)
node scripts/generate-catalog-with-trailers.mjs && \
cp components/features/films/data/catalog/interactive-katalog-enhanced-pl.html public/katalog-filmowy.html && \
npm run build && \
npx wrangler pages deploy .open-next/cloudflare --project-name=bonzo-media-hub

# Tylko regeneracja HTML
node scripts/generate-catalog-with-trailers.mjs

# Tylko build (bez deployment)
npm run build

# Tylko deployment (bez build)
npx wrangler pages deploy .open-next/cloudflare --project-name=bonzo-media-hub
```

---

**Pytania?** Sprawdź pełną dokumentację w `README.md` lub `KATALOG_DEPLOYMENT.md`

**Ostatnia aktualizacja**: 2026-03-30