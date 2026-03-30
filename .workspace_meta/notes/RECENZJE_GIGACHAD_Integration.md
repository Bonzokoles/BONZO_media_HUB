# RECENZJE_GIGACHAD Integration Guide

> **Status:** ✅ Fully Integrated  
> **Last Updated:** 2026-03-30 05:16  
> **Version:** 2.0

---

## 📋 Overview

RECENZJE_GIGACHAD to kolekcja **50 plików HTML** zawierających recenzje filmowe napisane w **5 różnych stylach** przez AI:

- **AKADEMICKI** - analiza teoretyczna i filmoznawcza
- **BUKOWSKI** - surowy, brutalny, uliczny styl
- **THOMPSON** - gonzo journalism, chaotyczny i dziennikarsko-literacki
- **LITERACKI** - poetycki, metaforyczny, artystyczny
- **GONZO** - anarchistyczny, nieprzewidywalny, humorystyczny

Każdy film ma **5 różnych recenzji**, co daje łącznie **~250 unikalnych tekstów**.

---

## 🗂️ Struktura Plików

```
components/features/films/
├── movies/
│   ├── RECENZJE_GIGACHAD/
│   │   ├── 12 Monkeys.html
│   │   ├── A Clockwork Orange.html
│   │   ├── Blade Runner.html
│   │   ├── Pulp Fiction.html
│   │   └── ... (50 total)
│   └── unified_movie_database.json
├── movies_db.json                    # Original database
├── movies_db_synced.json             # ✨ SYNCED OUTPUT
└── sync_movie_data.mjs               # 🔄 Sync Script

lib/
└── movies-data-synced.ts             # ✨ TypeScript Export
```

---

## 🔄 Data Sync Process

### Skrypt: `sync_movie_data.mjs`

```javascript
// 3 źródła danych:
1. unified_movie_database.json  // 58 filmów + TMDB posters
2. movies_db.json               // 66 filmów + existing data
3. RECENZJE_GIGACHAD/*.html     // 50 plików HTML z recenzjami

// Output:
→ movies_db_synced.json         // 67 filmów (merged)
→ lib/movies-data-synced.ts     // TypeScript export
```

### Uruchomienie Sync:

```bash
node components/features/films/sync_movie_data.mjs
```

**Output:**
```
🎬 BONZO Film Data Sync Starting...
📖 Loading unified_movie_database.json...
   ✓ Loaded 58 movies
📖 Loading movies_db.json...
   ✓ Loaded 66 movies
📖 Parsing HTML reviews from RECENZJE_GIGACHAD...
   ✓ Found 50 review files
   ✓ Parsed 5 reviews from "12 Monkeys"
   ✓ Parsed 5 reviews from "Blade Runner"
   ...
✨ Sync Complete!
📊 Summary:
   Total movies: 67
   With reviews: 51
   With TMDB posters: 59
```

---

## 📦 Data Structure

### TypeScript Interface

```typescript
interface Movie {
  id: string;
  title: string;
  metadata: {
    director?: string;
    year?: number | null;
    genres?: string[];
    tmdb_id?: number;
    tmdb_rating?: number;
    tmdb_poster?: string;      // ✨ TMDB poster URL
    tmdb_backdrop?: string;    // ✨ TMDB backdrop URL
    runtime?: number;
    overview?: string;
    cast?: string[];
  };
  reviews: {
    styles?: Record<string, string>;  // ✨ 5 stylów recenzji
    personal?: string | null;
  };
}
```

### Przykładowe Dane

```json
{
  "id": "blade_runner_2049",
  "title": "Blade Runner 2049",
  "metadata": {
    "tmdb_id": 335984,
    "tmdb_rating": 7.566,
    "tmdb_poster": "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    "tmdb_backdrop": "https://image.tmdb.org/t/p/w1280/ilRyazdMJwN05exqhwK4tMKBYZs.jpg",
    "director": "Denis Villeneuve",
    "year": 2017,
    "runtime": 164,
    "genres": ["Science Fiction", "Drama"]
  },
  "reviews": {
    "styles": {
      "akademicki": "Blade Runner 2049 Denisa Villeneuve'a to nie tylko...",
      "bukowski": "Blade Runner 2049. Kurwa, jakie to piękne...",
      "thompson": "Cholera, gdzie zacząć z tym filmem...",
      "literacki": "W cieniu neonów, gdzie deszcz...",
      "gonzo": "OK, słuchajcie uważnie, bo to będzie jazda..."
    },
    "personal": null
  }
}
```

---

## 💻 Usage w Aplikacji

### Import Danych

```typescript
// Option 1: Użyj nowych zsynchronizowanych danych
import { moviesCollectionComplete, movieStats } from "@/lib/movies-data-synced";

// Option 2: Import surowego JSON
import syncedData from "@/components/features/films/movies_db_synced.json";
```

### Component Usage

```tsx
"use client";

import { moviesCollectionComplete } from "@/lib/movies-data-synced";

export function MovieList() {
  const movies = moviesCollectionComplete;
  
  const moviesWithReviews = movies.filter(
    m => Object.keys(m.reviews?.styles || {}).length > 0
  );

  return (
    <div>
      {moviesWithReviews.map(movie => (
        <div key={movie.id}>
          <h2>{movie.title}</h2>
          
          {/* Poster TMDB */}
          {movie.metadata.tmdb_poster && (
            <img src={movie.metadata.tmdb_poster} alt={movie.title} />
          )}
          
          {/* Recenzje w różnych stylach */}
          {Object.entries(movie.reviews.styles || {}).map(([style, review]) => (
            <div key={style}>
              <h3>{style.toUpperCase()}</h3>
              <p>{review}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

## 🎨 UI Integration

### MovieVault Component

```typescript
// components/features/films/my-collection.tsx

import { moviesCollectionComplete } from "@/lib/movies-data-synced";

export function MovieVault() {
  const db = useMemo(
    () => ({ movies: moviesCollectionComplete }) as VaultDB,
    []
  );
  
  // Filtrowanie filmów z recenzjami
  const filtered = movies.filter(
    m => Object.keys(m.reviews?.styles || {}).length > 0
  );
  
  return (
    <div>
      {filtered.map(movie => (
        <MovieCard movie={movie} />
      ))}
    </div>
  );
}
```

### Modal z Zakładkami Recenzji

```tsx
function MovieModal({ movie }: { movie: Movie }) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const reviewTabs = Object.keys(movie.reviews?.styles || {});
  
  const tabs = [
    { id: "overview", label: "OVERVIEW" },
    ...reviewTabs.map(id => ({ id, label: id.toUpperCase() })),
  ];
  
  return (
    <Dialog>
      <div className="tabs">
        {tabs.map(tab => (
          <button onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="content">
        {activeTab === "overview" && <Overview movie={movie} />}
        
        {reviewTabs.includes(activeTab) && (
          <div className="review">
            <h3>GIGACHAD REVIEW: {activeTab}</h3>
            <p>{movie.reviews.styles[activeTab]}</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
```

---

## 📊 Statistics

```typescript
import { movieStats } from "@/lib/movies-data-synced";

console.log(movieStats);
// {
//   total: 67,
//   withReviews: 51,
//   withPosters: 59,
//   sources: ['unified_movie_database.json', 'movies_db.json', 'RECENZJE_GIGACHAD/*.html'],
//   generated: '2026-03-30T03:16:00.000Z'
// }
```

---

## 🔧 Maintenance

### Dodawanie Nowych Filmów

1. **Dodaj recenzje HTML:**
   ```bash
   # Skopiuj nowy plik do:
   components/features/films/movies/RECENZJE_GIGACHAD/New Movie.html
   ```

2. **Uruchom sync:**
   ```bash
   node components/features/films/sync_movie_data.mjs
   ```

3. **Build & Deploy:**
   ```bash
   npm run build
   npm run deploy
   ```

### Update Posterów TMDB

1. **Edytuj `unified_movie_database.json`:**
   ```json
   {
     "id": "new-movie-2024",
     "title": "New Movie",
     "tmdb_id": 123456,
     "tmdb_poster": "https://image.tmdb.org/t/p/w500/...",
     "tmdb_backdrop": "https://image.tmdb.org/t/p/w1280/..."
   }
   ```

2. **Re-sync:**
   ```bash
   node components/features/films/sync_movie_data.mjs
   ```

---

## 🐛 Troubleshooting

### Problem: Brak posterów

**Przyczyna:** Film nie ma `tmdb_poster` w metadata

**Rozwiązanie:**
```typescript
// Fallback w komponencie:
const poster = movie.metadata.tmdb_poster || '/placeholder.jpg';
```

### Problem: Recenzje nie matchują z filmami

**Przyczyna:** Różnice w tytułach (np. "Blade Runner" vs "Blade Runner (1982)")

**Rozwiązanie:** Skrypt używa `normalizeTitle()` - sprawdź logi sync:
```bash
node sync_movie_data.mjs | grep "Merged:"
```

### Problem: Za mało recenzji

**Przyczyna:** Niektóre filmy mogą nie mieć wszystkich 5 stylów

**Check:**
```typescript
const reviewCount = Object.keys(movie.reviews?.styles || {}).length;
console.log(`${movie.title}: ${reviewCount} reviews`);
```

---

## 📈 Future Enhancements

### Planned Features

- [ ] **Auto-sync co tydzień** (GitHub Actions cron)
- [ ] **Filter po stylu recenzji** (akademicki, bukowski, etc.)
- [ ] **Search w treści recenzji** (full-text search)
- [ ] **Review ratings** (upvote/downvote per style)
- [ ] **Export do PDF** (pojedynczy film + wszystkie recenzje)
- [ ] **AI-generated podobieństwa** (find similar movies by review style)

### Nice to Have

- Markdown formatting w recenzjach (currently plain text)
- Embedded images w recenzjach
- Audio narration dla każdej recenzji (TTS)
- User comments per review style

---

## 🔗 Related Files

| File | Purpose |
|------|---------|
| `sync_movie_data.mjs` | Main sync script |
| `movies_db_synced.json` | Output JSON database |
| `lib/movies-data-synced.ts` | TypeScript export |
| `my-collection.tsx` | MovieVault component |
| `film-library.tsx` | Main film library |
| `.workspace_meta/notes/snapshots.md` | Change log |

---

## ✅ Checklist - Po każdym sync

- [ ] Uruchomiono `node sync_movie_data.mjs`
- [ ] Sprawdzono output stats (total, withReviews, withPosters)
- [ ] Zbudowano aplikację (`npm run build`)
- [ ] Przetestowano lokalnie
- [ ] Wykonano deploy (`npm run deploy`)
- [ ] Zweryfikowano na live site
- [ ] Zaktualizowano snapshot w `snapshots.md`

---

## 📞 Support

**Issues?** Check:
1. Console logs w sync script
2. TypeScript errors w build
3. Network tab w DevTools (posters loading?)
4. Snapshots history dla poprzednich working versions

**Contact:** Check project maintainers in workspace metadata

---

**Last Sync:** 2026-03-30 05:16  
**Movies:** 67 total, 51 with reviews, 59 with posters  
**Status:** ✅ Production Ready