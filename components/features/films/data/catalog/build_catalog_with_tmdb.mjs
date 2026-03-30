#!/usr/bin/env node

/**
 * Build Catalog with TMDB Data
 * Parsuje mega_katalog_filmowy.md i pobiera dane TMDB dla każdego filmu
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEGA_KATALOG = path.join(__dirname, "mega_katalog_filmowy.md");
const OUTPUT_JSON = path.join(__dirname, "catalog_with_tmdb.json");
const OUTPUT_HTML = path.join(__dirname, "interactive-katalog-enhanced.html");

// TMDB Configuration
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_READ_TOKEN =
  process.env.TMDB_READ_TOKEN ||
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3ZjQwNmZmNzViN2IyYzA1YWYzNTczNDc1MWRjMmEzMCIsInN1YiI6IjY3MTY0N2E5OWQ5Y2I3ODNkNzY2ZGE0MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.uFuEgC_SJBZ0Yw8sBmrjLNOKh6y0w-HQXEFHvbSYf6A";

const HEADERS = {
  accept: "application/json",
  Authorization: `Bearer ${TMDB_READ_TOKEN}`,
};

// Delay between requests to avoid rate limiting
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log("🎬 Building Catalog with TMDB Data...\n");

// Parse markdown and extract films
console.log("📖 Parsing mega_katalog_filmowy.md...");
const markdown = fs.readFileSync(MEGA_KATALOG, "utf-8");

const categories = [
  {
    name: "Psychodeliczne, ale bez horroru",
    mood: ["psychodela", "surreal", "arthouse"],
  },
  {
    name: "Czułe o miłości, ale bez kiczu",
    mood: ["romans", "melancholia", "relacje"],
  },
  { name: "Urban Decay", mood: ["miasto", "noc", "brud"] },
  { name: "Kino o outsiderach", mood: ["outsider", "loner", "misfit"] },
  { name: "Brudna, uliczna poezja", mood: ["ulica", "raw", "gritty"] },
  { name: "Senne i eteryczne", mood: ["sen", "eteryczne", "dreamlike"] },
  {
    name: "Kino o życiu, które nie traktuje widza jak debila",
    mood: ["życie", "realism", "humanizm"],
  },
];

const catalog = [];

for (const category of categories) {
  console.log(`\n📂 Category: ${category.name}`);

  // Find category section in markdown
  const categoryStart = markdown.indexOf(`### ${category.name}`);
  if (categoryStart === -1) continue;

  const nextCategory = markdown.indexOf("###", categoryStart + 1);
  const categorySection =
    nextCategory > -1
      ? markdown.substring(categoryStart, nextCategory)
      : markdown.substring(categoryStart);

  // Extract films from table rows
  const films = [];
  const filmTitles = new Set();

  // Find table rows containing film lists
  const tableRows = categorySection
    .split("\n")
    .filter((line) => line.startsWith("|"));

  for (const row of tableRows) {
    // Skip header rows
    if (row.includes("Typ") || row.includes("---")) continue;

    // Extract cell content (last cell usually contains films)
    const cells = row
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c);
    if (cells.length < 2) continue;

    // Get the films cell (usually the last one)
    const filmsCell = cells[cells.length - 1];

    // Split by semicolon and process each film
    const filmEntries = filmsCell.split(";").map((f) => f.trim());

    for (const entry of filmEntries) {
      // Try to extract title and year
      const yearMatch = entry.match(/^(.+?)\s*\((\d{4})\)\s*$/);

      if (yearMatch) {
        const title = yearMatch[1].trim();
        const year = parseInt(yearMatch[2]);

        if (!filmTitles.has(title)) {
          filmTitles.add(title);
          films.push({ title, year });
        }
      } else if (entry && !entry.includes("[cite:")) {
        // Film without year in parentheses
        const title = entry.trim();
        if (title && !filmTitles.has(title)) {
          filmTitles.add(title);
          films.push({ title, year: null });
        }
      }
    }
  }

  console.log(`   Found ${films.length} unique films`);

  // Fetch TMDB data for each film
  const categoryFilms = [];

  for (const film of films.slice(0, 15)) {
    // Limit to 15 per category to avoid rate limits
    try {
      console.log(`   🔍 Searching TMDB: ${film.title} (${film.year})`);

      // Search for film
      const searchUrl = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(film.title)}&year=${film.year}`;
      const searchRes = await fetch(searchUrl, { headers: HEADERS });
      const searchData = await searchRes.json();

      if (!searchData.results || searchData.results.length === 0) {
        console.log(`   ⚠️  Not found: ${film.title}`);
        categoryFilms.push({
          title: film.title,
          year: film.year,
          source: "Manual",
          mood: category.mood,
          poster: null,
          backdrop: null,
          overview: null,
          tmdb_id: null,
          genres: [],
          streaming: [],
        });
        continue;
      }

      const result = searchData.results[0];

      // Get detailed info
      const detailsUrl = `${TMDB_BASE_URL}/movie/${result.id}?append_to_response=credits`;
      const detailsRes = await fetch(detailsUrl, { headers: HEADERS });
      const details = await detailsRes.json();

      // Get watch providers (Poland)
      const providersUrl = `${TMDB_BASE_URL}/movie/${result.id}/watch/providers`;
      const providersRes = await fetch(providersUrl, { headers: HEADERS });
      const providersData = await providersRes.json();

      const plProviders = providersData.results?.PL || {};
      const streaming = [
        ...(plProviders.flatrate || []).map((p) => ({
          name: p.provider_name,
          type: "stream",
        })),
        ...(plProviders.rent || []).map((p) => ({
          name: p.provider_name,
          type: "rent",
        })),
        ...(plProviders.buy || []).map((p) => ({
          name: p.provider_name,
          type: "buy",
        })),
      ];

      const movieData = {
        title: film.title,
        year: film.year,
        source: "TMDB",
        mood: category.mood,
        poster: result.poster_path
          ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
          : null,
        backdrop: result.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${result.backdrop_path}`
          : null,
        overview: details.overview || result.overview || null,
        tmdb_id: result.id,
        rating: result.vote_average,
        genres: details.genres?.map((g) => g.name) || [],
        director:
          details.credits?.crew?.find((c) => c.job === "Director")?.name ||
          null,
        runtime: details.runtime || null,
        streaming: streaming,
      };

      categoryFilms.push(movieData);
      console.log(`   ✅ Added: ${film.title} (TMDB ID: ${result.id})`);

      // Rate limiting
      await delay(300);
    } catch (error) {
      console.error(`   ❌ Error fetching ${film.title}:`, error.message);
      categoryFilms.push({
        title: film.title,
        year: film.year,
        source: "Error",
        mood: category.mood,
        poster: null,
        backdrop: null,
        overview: null,
        tmdb_id: null,
        genres: [],
        streaming: [],
      });
    }
  }

  catalog.push({
    category: category.name,
    mood: category.mood,
    films: categoryFilms,
  });
}

// Save JSON
console.log("\n💾 Saving catalog JSON...");
const outputData = {
  version: "1.0",
  generated: new Date().toISOString(),
  totalCategories: catalog.length,
  totalFilms: catalog.reduce((sum, cat) => sum + cat.films.length, 0),
  categories: catalog,
};

fs.writeFileSync(OUTPUT_JSON, JSON.stringify(outputData, null, 2), "utf-8");
console.log(`   ✓ Saved to: ${OUTPUT_JSON}`);

// Generate enhanced HTML
console.log("\n🎨 Generating enhanced HTML...");

const htmlTemplate = `<!DOCTYPE html>
<html lang="pl" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BONZO Film Catalog - Interactive</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@300..700&display=swap" rel="stylesheet">
  <style>
    :root,[data-theme="light"]{--text-xs:clamp(.75rem,.7rem + .25vw,.875rem);--text-sm:clamp(.875rem,.8rem + .35vw,1rem);--text-base:clamp(1rem,.95rem + .25vw,1.125rem);--text-lg:clamp(1.125rem,1rem + .75vw,1.5rem);--text-xl:clamp(1.5rem,1.2rem + 1.25vw,2.25rem);--text-2xl:clamp(2rem,1.2rem + 2.5vw,3.5rem);--space-2:.5rem;--space-3:.75rem;--space-4:1rem;--space-6:1.5rem;--space-8:2rem;--space-12:3rem;--space-16:4rem;--color-bg:#f7f6f2;--color-surface:#f9f8f5;--color-surface-2:#fbfbf9;--color-border:#d4d1ca;--color-text:#28251d;--color-text-muted:#7a7974;--color-primary:#01696f;--color-primary-hover:#0c4e54;--radius-md:.5rem;--radius-lg:.75rem;--radius-xl:1rem;--shadow-sm:0 1px 2px rgba(0,0,0,.06);--shadow-md:0 10px 24px rgba(0,0,0,.08);--content:1280px;--font-display:'Instrument Serif',Georgia,serif;--font-body:'Work Sans',Arial,sans-serif}
    [data-theme="dark"]{--color-bg:#171614;--color-surface:#1c1b19;--color-surface-2:#201f1d;--color-border:#393836;--color-text:#cdccca;--color-text-muted:#97958f;--color-primary:#4f98a3;--color-primary-hover:#227f8b;--shadow-sm:0 1px 2px rgba(0,0,0,.2);--shadow-md:0 12px 32px rgba(0,0,0,.35)}
    *{box-sizing:border-box;margin:0;padding:0} html{scroll-behavior:smooth} body{font-family:var(--font-body);font-size:var(--text-base);background:var(--color-bg);color:var(--color-text);line-height:1.6} img{display:block;max-width:100%;height:auto}
    .wrap{max-width:var(--content);margin:0 auto;padding:0 var(--space-4)}
    .topbar{position:sticky;top:0;z-index:20;backdrop-filter:blur(14px);background:color-mix(in srgb,var(--color-bg) 78%,transparent);border-bottom:1px solid var(--color-border);padding:var(--space-4) 0}
    .brand{font-family:var(--font-display);font-size:var(--text-xl);color:var(--color-primary)}
    .section{padding:var(--space-8) 0}
    .category{margin-bottom:var(--space-12)}
    .category h3{font-family:var(--font-display);font-size:var(--text-xl);margin-bottom:var(--space-4);color:var(--color-primary)}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:var(--space-4)}
    .card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-sm)}
    .poster{aspect-ratio:2/3;background:linear-gradient(135deg,rgba(79,152,163,.25),rgba(0,0,0,.08));position:relative}
    .poster img{width:100%;height:100%;object-fit:cover}
    .poster .fallback{position:absolute;inset:0;display:grid;place-items:center;color:var(--color-text-muted);font-size:var(--text-sm)}
    .card-body{padding:var(--space-3)}
    .card h4{font-size:var(--text-sm);margin-bottom:var(--space-2);line-height:1.2}
    .meta{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:var(--space-2);font-size:var(--text-xs)}
    .tag{padding:.3rem .5rem;border-radius:999px;background:color-mix(in srgb,var(--color-primary) 11%,var(--color-surface));border:1px solid color-mix(in srgb,var(--color-primary) 34%,var(--color-border))}
    .streaming{margin-top:var(--space-2);font-size:var(--text-xs);color:var(--color-text-muted)}
  </style>
</head>
<body>
  <header class="topbar">
    <div class="wrap">
      <h1 class="brand">BONZO Film Catalog</h1>
      <p style="color:var(--color-text-muted);font-size:var(--text-sm)">
        ${outputData.totalFilms} filmów w ${outputData.totalCategories} kategoriach • Generated: ${new Date().toLocaleDateString("pl-PL")}
      </p>
    </div>
  </header>

  <main class="wrap section">
    ${catalog
      .map(
        (category) => `
      <div class="category">
        <h3>${category.category}</h3>
        <div class="grid">
          ${category.films
            .map(
              (film) => `
            <div class="card">
              <div class="poster">
                ${
                  film.poster
                    ? `<img src="${film.poster}" alt="${film.title}" loading="lazy" />`
                    : `<div class="fallback">📽️<br>${film.title}</div>`
                }
              </div>
              <div class="card-body">
                <h4>${film.title} ${film.year ? `(${film.year})` : ""}</h4>
                ${film.director ? `<p style="font-size:var(--text-xs);color:var(--color-text-muted)">${film.director}</p>` : ""}
                ${film.overview ? `<p style="font-size:var(--text-xs);margin-top:var(--space-2);color:var(--color-text-muted);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${film.overview}</p>` : ""}
                <div class="meta">
                  ${
                    film.genres
                      ?.slice(0, 2)
                      .map((g) => `<span class="tag">${g}</span>`)
                      .join("") || ""
                  }
                  ${film.rating ? `<span class="tag">⭐ ${film.rating.toFixed(1)}</span>` : ""}
                </div>
                ${
                  film.streaming?.length > 0
                    ? `<div class="streaming">📺 ${film.streaming.map((s) => s.name).join(", ")}</div>`
                    : '<div class="streaming">Brak info o streamingu</div>'
                }
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `,
      )
      .join("")}
  </main>
</body>
</html>`;

fs.writeFileSync(OUTPUT_HTML, htmlTemplate, "utf-8");
console.log(`   ✓ Saved to: ${OUTPUT_HTML}`);

console.log("\n✨ Build Complete!\n");
console.log("📊 Summary:");
console.log(`   Total Categories: ${outputData.totalCategories}`);
console.log(`   Total Films: ${outputData.totalFilms}`);
console.log(
  `   Films with TMDB: ${catalog.reduce((sum, cat) => sum + cat.films.filter((f) => f.tmdb_id).length, 0)}`,
);
console.log(
  `   Films with Posters: ${catalog.reduce((sum, cat) => sum + cat.films.filter((f) => f.poster).length, 0)}`,
);
console.log("\n📁 Output files:");
console.log(`   JSON: ${OUTPUT_JSON}`);
console.log(`   HTML: ${OUTPUT_HTML}`);
console.log("\n✅ Done!");
