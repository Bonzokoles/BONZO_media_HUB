# BONZO Film Catalog - Dokumentacja

Interaktywny katalog filmowy z 105 filmami w 7 autorskich kategoriach, z linkami do trailerów i informacjami o streamingu.

## 📁 Pliki w tym katalogu

- **`catalog_with_tmdb.json`** - Główne dane katalogu ze 105 filmami (tytuły, plakaty, opisy, TMDB ID, streaming)
- **`interactive-katalog-filmowy.html`** - Szablon HTML (oryginalny, mniejszy zestaw)
- **`interactive-katalog-enhanced-pl.html`** - Wygenerowany pełny katalog z trailerami (105 filmów)
- **`mega_katalog_filmowy.md`** - Lista tytułów z rozszerzeniami kategorii

## 🎬 Wygenerowany katalog

Plik `interactive-katalog-enhanced-pl.html` to standalone HTML zawierający:

- **105 filmów** w 7 kategoriach tematycznych
- **Linki do trailerów** z YouTube (przez TMDB API)
- **Plakaty** z TMDB
- **Opisy** w języku angielskim (z TMDB)
- **Informacje o streamingu** (gdzie dostępne)
- **Filtrowanie** po kategorii i wyszukiwanie
- **Ciemny/jasny motyw** przełączany przez użytkownika
- **Oceny TMDB** dla każdego filmu

### Struktura kategorii

1. **Psychodeliczne, ale bez horroru** - 15 filmów
   - Upstream Color, Holy Motors, The Congress, Enter the Void, The Fountain, etc.

2. **Czułe o miłości, ale bez kiczu** - 15 filmów
   - Blue Valentine, Her, Before Sunrise, Past Lives, In the Mood for Love, etc.

3. **Miejski Rozkład (Urban Decay)** - 15 filmów
   - Heaven Knows What, Gummo, Mid90s, Last Days, Pixote, etc.

4. **Kino o outsiderach** - 15 filmów
   - The Station Agent, Wendy and Lucy, Mary and Max, Submarine, Frances Ha, etc.

5. **Brudna, uliczna poezja** - 15 filmów
   - Dead Man, A Girl Walks Home Alone at Night, The Rider, Fish Tank, etc.

6. **Senne i eteryczne** - 15 filmów
   - A Ghost Story, Columbus, Loveless, Drive, Solaris, etc.

7. **Kino o życiu** - 15 filmów
   - The Florida Project, The Wrestler, Short Term 12, Nebraska, etc.

## 🛠️ Generator katalogu

### Użycie

```bash
# Podstawowe użycie (bez prawdziwych trailerów z TMDB)
node scripts/generate-catalog-with-trailers.mjs

# Z kluczem TMDB API (pobiera prawdziwe linki do trailerów)
TMDB_API_KEY=twój_klucz_api node scripts/generate-catalog-with-trailers.mjs
```

### Co robi skrypt

1. Czyta `catalog_with_tmdb.json`
2. Opcjonalnie pobiera linki do trailerów z TMDB API (jeśli ustawiony `TMDB_API_KEY`)
3. Generuje plik HTML z:
   - Wszystkimi danymi osadzonymi w JavaScript
   - Funkcjami wyszukiwania i filtrowania
   - Przyciskami trailerów na posterach
   - Responsywnym designem
4. Zapisuje do `interactive-katalog-enhanced-pl.html`

### Zdobycie klucza TMDB API

1. Zarejestruj się na https://www.themoviedb.org/
2. Przejdź do Settings → API
3. Wypełnij formularz i uzyskaj klucz API
4. Ustaw zmienną środowiskową:
   ```bash
   export TMDB_API_KEY="twój_klucz_tutaj"
   ```

## 📊 Struktura danych JSON

```json
{
  "version": "1.0",
  "generated": "2026-03-30T04:38:32.307Z",
  "totalCategories": 7,
  "totalFilms": 105,
  "categories": [
    {
      "category": "Psychodeliczne, ale bez horroru",
      "mood": ["psychodela", "surreal", "arthouse"],
      "films": [
        {
          "title": "Upstream Color",
          "year": 2013,
          "source": "TMDB",
          "poster": "https://image.tmdb.org/t/p/w500/...",
          "backdrop": "https://image.tmdb.org/t/p/w1280/...",
          "overview": "Film description...",
          "tmdb_id": 145197,
          "rating": 6.336,
          "genres": ["Drama", "Science Fiction"],
          "director": "Shane Carruth",
          "runtime": 96,
          "streaming": [
            {"name": "Apple TV Store", "type": "rent"}
          ]
        }
      ]
    }
  ]
}
```

## 🚀 Deployment

### Kopiowanie do public

```bash
# Skopiuj wygenerowany HTML do public
cp components/features/films/data/catalog/interactive-katalog-enhanced-pl.html public/katalog-filmowy.html

# Zbuduj aplikację
npm run build

# Wdróż na Cloudflare Pages
npx wrangler pages deploy .open-next/cloudflare --project-name=bonzo-media-hub
```

### Dostęp do katalogu

Po wdrożeniu katalog będzie dostępny pod:
- `https://bonzo-media-hub.pages.dev/katalog-filmowy.html`

## ✨ Funkcje katalogu

### Wyszukiwanie
- Wyszukuje w tytułach, opisach, tagach i informacjach o streamingu
- Wyszukiwanie w czasie rzeczywistym (debounced)

### Filtrowanie
- Dropdown z listą wszystkich kategorii
- Można łączyć z wyszukiwaniem

### Trailery
- Przycisk trailera pojawia się przy hover na posterze
- Otwiera trailer w nowej karcie (YouTube)
- Jeśli trailer nie jest dostępny, przycisk nie pojawia się

### Motywy
- Przełącznik ciemny/jasny motyw
- Preferencja zapisywana w localStorage
- Domyślnie ciemny motyw

### Responsywność
- Desktop: siatka 3-4 kolumn
- Tablet: siatka 2-3 kolumn
- Mobile: 1 kolumna

## 🔧 Customizacja

### Zmiana kolorów

Edytuj CSS variables w sekcji `:root` i `[data-theme="dark"]`:

```css
:root {
  --color-primary: #01696f;
  --color-primary-hover: #0c4e54;
  /* ... */
}
```

### Dodanie nowych filmów

1. Edytuj `catalog_with_tmdb.json`
2. Dodaj film do odpowiedniej kategorii
3. Uruchom generator ponownie:
   ```bash
   node scripts/generate-catalog-with-trailers.mjs
   ```

### Zmiana kategorii

W pliku `scripts/generate-catalog-with-trailers.mjs`, edytuj obiekt `categoryTranslations`:

```javascript
const categoryTranslations = {
  'English Name': 'Polska Nazwa',
  // ...
};
```

## 📝 Źródła danych

- **Plakaty i opisy**: The Movie Database (TMDB)
- **Trailery**: YouTube (przez TMDB API)
- **Streaming**: TMDB Watch Providers
- **Kuracja**: Autorski katalog BONZO

## 🐛 Troubleshooting

### Problem: Brak trailerów
**Rozwiązanie**: Upewnij się, że ustawiłeś `TMDB_API_KEY`. Bez klucza generator używa linków do wyszukiwania YouTube.

### Problem: Brak plakatów
**Rozwiązanie**: Niektóre filmy mogą nie mieć plakatów w TMDB. W takim przypadku pokazuje się placeholder.

### Problem: HTML jest za duży
**Rozwiązanie**: Plik ma ~96KB z danymi wszystkich filmów. To jest OK dla standalone HTML. Jeśli potrzebujesz mniejszego pliku, rozważ ładowanie danych z osobnego pliku JSON.

### Problem: Streaming nieaktualny
**Rozwiązanie**: Dane streamingu z TMDB mogą się różnić w zależności od regionu i czasu. Ponownie wygeneruj katalog, aby uzyskać najnowsze dane.

## 📄 Licencja

Dane z TMDB są dostępne na licencji TMDB. Sprawdź https://www.themoviedb.org/documentation/api/terms-of-use

## 🤝 Contributing

Aby dodać więcej filmów:

1. Znajdź film w TMDB
2. Dodaj jego TMDB ID i podstawowe dane do `catalog_with_tmdb.json`
3. Uruchom generator
4. Przetestuj lokalnie
5. Wdróż na Cloudflare Pages

---

**Ostatnia aktualizacja**: 2026-03-30  
**Kontakt**: BONZO Media Hub