#!/usr/bin/env node

/**
 * Generate Polish Interactive Film Catalog with Trailers
 *
 * Reads catalog_with_tmdb.json and generates a standalone HTML file
 * with embedded trailer links from TMDB
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const CATALOG_PATH = path.join(__dirname, '../components/features/films/data/catalog/catalog_with_tmdb.json');
const OUTPUT_PATH = path.join(__dirname, '../components/features/films/data/catalog/interactive-katalog-enhanced-pl.html');

// TMDB API configuration (optional - set env var TMDB_API_KEY to fetch real trailers)
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Fetch trailer URL for a film from TMDB
 */
async function fetchTrailerUrl(tmdbId) {
  if (!TMDB_API_KEY || !tmdbId) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent('trailer')}`;
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${tmdbId}/videos?api_key=${TMDB_API_KEY}&language=pl-PL`
    );

    if (!response.ok) {
      // Fallback to English
      const enResponse = await fetch(
        `${TMDB_BASE_URL}/movie/${tmdbId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
      );
      if (enResponse.ok) {
        const data = await enResponse.json();
        const trailer = data.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
      }
      return null;
    }

    const data = await response.json();
    const trailer = data.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  } catch (error) {
    console.error(`Error fetching trailer for TMDB ID ${tmdbId}:`, error.message);
    return null;
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Translate category names to Polish
 */
const categoryTranslations = {
  'Psychodeliczne, ale bez horroru': 'Psychodeliczne, ale bez horroru',
  'Czułe o miłości, ale bez kiczu': 'Czułe o miłości, ale bez kiczu',
  'Urban Decay': 'Miejski Rozkład',
  'Kino o outsiderach': 'Kino o outsiderach',
  'Brudna, uliczna poezja': 'Brudna, uliczna poezja',
  'Senne i eteryczne': 'Senne i eteryczne',
  'Kino o życiu': 'Kino o życiu'
};

/**
 * Generate HTML template
 */
function generateHTML(catalogData, trailerMap) {
  const totalFilms = catalogData.totalFilms || catalogData.categories.reduce((sum, cat) => sum + cat.films.length, 0);
  const totalCategories = catalogData.totalCategories || catalogData.categories.length;

  // Generate JavaScript data array
  const dataArray = catalogData.categories.map(category => {
    const translatedCategory = categoryTranslations[category.category] || category.category;

    return {
      category: translatedCategory,
      mood: category.mood || [],
      films: category.films.map(film => {
        const trailerUrl = trailerMap.get(film.tmdb_id) || '#';
        const streamingText = film.streaming && film.streaming.length > 0
          ? film.streaming.map(s => `${s.name} (${s.type})`).join(', ')
          : 'Sprawdź dostępność';

        return {
          title: film.title,
          year: film.year || new Date().getFullYear(),
          source: film.source || 'TMDB',
          poster: film.poster || '',
          desc: film.overview || 'Brak opisu.',
          streaming: [streamingText],
          tags: [...(film.mood || []), ...(film.genres?.slice(0, 2) || [])],
          trailer: trailerUrl,
          tmdb_id: film.tmdb_id,
          rating: film.rating || 0
        };
      })
    };
  });

  return `<!DOCTYPE html>
<html lang="pl" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BONZO Film Catalog - Interaktywny katalog filmowy z trailerami</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@300..700&display=swap" rel="stylesheet">
  <style>
    :root,[data-theme="light"]{--text-xs:clamp(.75rem,.7rem + .25vw,.875rem);--text-sm:clamp(.875rem,.8rem + .35vw,1rem);--text-base:clamp(1rem,.95rem + .25vw,1.125rem);--text-lg:clamp(1.125rem,1rem + .75vw,1.5rem);--text-xl:clamp(1.5rem,1.2rem + 1.25vw,2.25rem);--text-2xl:clamp(2rem,1.2rem + 2.5vw,3.5rem);--space-2:.5rem;--space-3:.75rem;--space-4:1rem;--space-6:1.5rem;--space-8:2rem;--space-12:3rem;--space-16:4rem;--color-bg:#f7f6f2;--color-surface:#f9f8f5;--color-surface-2:#fbfbf9;--color-border:#d4d1ca;--color-text:#28251d;--color-text-muted:#7a7974;--color-primary:#01696f;--color-primary-hover:#0c4e54;--radius-md:.5rem;--radius-lg:.75rem;--radius-xl:1rem;--shadow-sm:0 1px 2px rgba(0,0,0,.06);--shadow-md:0 10px 24px rgba(0,0,0,.08);--content:1280px;--font-display:'Instrument Serif',Georgia,serif;--font-body:'Work Sans',Arial,sans-serif}
    [data-theme="dark"]{--color-bg:#171614;--color-surface:#1c1b19;--color-surface-2:#201f1d;--color-border:#393836;--color-text:#cdccca;--color-text-muted:#97958f;--color-primary:#4f98a3;--color-primary-hover:#227f8b;--shadow-sm:0 1px 2px rgba(0,0,0,.2);--shadow-md:0 12px 32px rgba(0,0,0,.35)}
    *{box-sizing:border-box;margin:0;padding:0} html{scroll-behavior:smooth} body{font-family:var(--font-body);font-size:var(--text-base);background:radial-gradient(circle at top left,rgba(79,152,163,.14),transparent 28%),var(--color-bg);color:var(--color-text);line-height:1.6} img{display:block;max-width:100%;height:auto} button,input,select{font:inherit;color:inherit} a{color:inherit;text-decoration:none} .wrap{max-width:var(--content);margin:0 auto;padding:0 var(--space-4)}
    .topbar{position:sticky;top:0;z-index:20;backdrop-filter:blur(14px);background:color-mix(in srgb,var(--color-bg) 78%,transparent);border-bottom:1px solid var(--color-border)}
    .topbar-inner{display:flex;gap:var(--space-4);align-items:center;justify-content:space-between;padding:var(--space-4) 0}
    .brand{display:flex;align-items:center;gap:var(--space-3)} .logo{width:42px;height:42px;border:1px solid var(--color-border);border-radius:50%;display:grid;place-items:center;background:var(--color-surface)}
    .logo svg{width:24px;height:24px} .brand h1{font-family:var(--font-display);font-size:var(--text-xl);line-height:1} .muted{color:var(--color-text-muted)}
    .toolbar{display:grid;grid-template-columns:1.4fr .9fr auto;gap:var(--space-3);padding-bottom:var(--space-4)} input,select{width:100%;background:var(--color-surface);border:1px solid var(--color-border);border-radius:999px;padding:.85rem 1rem} .theme-btn,.jump-btn{border:1px solid var(--color-border);border-radius:999px;padding:.85rem 1rem;background:var(--color-surface);cursor:pointer} .theme-btn:hover,.jump-btn:hover{background:var(--color-surface-2)}
    .hero{padding:var(--space-16) 0 var(--space-12)} .hero-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:var(--space-8);align-items:end} .eyebrow{font-size:var(--text-xs);letter-spacing:.14em;text-transform:uppercase;color:var(--color-primary);font-weight:700;margin-bottom:var(--space-3)}
    .hero h2{font-family:var(--font-display);font-size:clamp(2.6rem,2rem + 3vw,5.2rem);line-height:.95;max-width:12ch;margin-bottom:var(--space-4)} .hero p{max-width:60ch;color:var(--color-text-muted)}
    .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3);margin-top:var(--space-6)} .stat{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:var(--space-4);box-shadow:var(--shadow-sm)} .stat strong{display:block;font-size:var(--text-xl);font-family:var(--font-display)}
    .sources{background:var(--color-surface);border:1px solid var(--color-border);border-radius:24px;padding:var(--space-6);box-shadow:var(--shadow-md)} .sources ul{list-style:none;display:grid;gap:var(--space-3)} .sources li{display:flex;justify-content:space-between;gap:var(--space-4);padding-bottom:var(--space-3);border-bottom:1px dashed var(--color-border)} .sources li:last-child{border-bottom:0;padding-bottom:0}
    .section{padding:var(--space-12) 0} .section-head{display:flex;align-items:end;justify-content:space-between;gap:var(--space-4);margin-bottom:var(--space-6)} .section-head h3{font-family:var(--font-display);font-size:var(--text-2xl)}
    .chips{display:flex;flex-wrap:wrap;gap:.6rem} .chip{padding:.45rem .8rem;border-radius:999px;border:1px solid var(--color-border);background:var(--color-surface);font-size:var(--text-xs)}
    .category{margin-bottom:var(--space-12)} .category-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:var(--space-4)} .card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:20px;overflow:hidden;box-shadow:var(--shadow-sm);display:flex;flex-direction:column;min-height:100%;transition:transform .2s,box-shadow .2s} .card:hover{transform:translateY(-4px);box-shadow:var(--shadow-md)}
    .poster{aspect-ratio:2/3;background:linear-gradient(135deg,rgba(79,152,163,.25),rgba(0,0,0,.08));position:relative} .poster img{width:100%;height:100%;object-fit:cover} .poster .fallback{position:absolute;inset:0;display:grid;place-items:center;padding:var(--space-4);text-align:center;color:var(--color-text-muted);font-size:var(--text-sm)}
    .trailer-overlay{position:absolute;inset:0;background:rgba(0,0,0,.6);display:grid;place-items:center;opacity:0;transition:opacity .3s} .card:hover .trailer-overlay{opacity:1} .trailer-btn{background:var(--color-primary);color:white;border:2px solid white;border-radius:50%;width:64px;height:64px;display:grid;place-items:center;cursor:pointer;font-size:24px;box-shadow:0 4px 12px rgba(0,0,0,.3)} .trailer-btn:hover{background:var(--color-primary-hover);transform:scale(1.1)}
    .card-body{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)} .card h4{font-size:1.02rem;line-height:1.2} .meta{display:flex;flex-wrap:wrap;gap:.45rem} .tag{font-size:var(--text-xs);padding:.35rem .55rem;border-radius:999px;background:color-mix(in srgb,var(--color-primary) 11%,var(--color-surface));border:1px solid color-mix(in srgb,var(--color-primary) 34%,var(--color-border))}
    .desc{font-size:var(--text-sm);color:var(--color-text-muted);display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden;min-height:7.6em}
    .streaming{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:auto} .provider{font-size:var(--text-xs);padding:.35rem .55rem;border:1px solid var(--color-border);border-radius:999px;background:var(--color-surface-2)} .provider.missing{opacity:.75}
    .rating{display:flex;align-items:center;gap:.3rem;font-size:var(--text-sm);color:var(--color-primary)} .rating svg{width:16px;height:16px;fill:currentColor}
    .footer-note{padding:var(--space-12) 0 var(--space-16);color:var(--color-text-muted);font-size:var(--text-sm)}
    @media (max-width: 980px){.hero-grid,.toolbar{grid-template-columns:1fr}.stats{grid-template-columns:1fr 1fr 1fr}} @media (max-width: 640px){.stats{grid-template-columns:1fr}.topbar-inner,.section-head{align-items:flex-start;flex-direction:column}.hero h2{max-width:9ch}}
  </style>
</head>
<body>
  <a class="sr-only" href="#catalog">Przejdź do katalogu</a>
  <header class="topbar">
    <div class="wrap">
      <div class="topbar-inner">
        <div class="brand">
          <div class="logo" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4">
              <circle cx="24" cy="24" r="18"></circle>
              <path d="M18 16h12M18 24h12M18 32h7"></path>
            </svg>
          </div>
          <div>
            <h1>BONZO Film Catalog</h1>
            <div class="muted">Interaktywny katalog z trailerami • ${totalFilms} filmów</div>
          </div>
        </div>
        <button class="theme-btn" data-theme-toggle aria-label="Przełącz motyw">🌙 Motyw</button>
      </div>
      <div class="toolbar">
        <input id="searchInput" type="search" placeholder="Szukaj tytułu, klimatu, źródła..." />
        <select id="categorySelect">
          <option value="all">Wszystkie kategorie</option>
        </select>
        <button class="jump-btn" onclick="document.querySelector('#catalog').scrollIntoView({behavior:'smooth'})">📖 Przeglądaj</button>
      </div>
    </div>
  </header>

  <main>
    <section class="hero wrap">
      <div class="hero-grid">
        <div>
          <div class="eyebrow">Curated Cinema Explorer</div>
          <h2>Kino pod klimat, nie pod algorytm</h2>
          <p>Kuratorski katalog ${totalFilms} filmów w ${totalCategories} autorskich kategoriach. Każdy film ma plakat, opis, ocenę TMDB i <strong>link do trailera</strong>. Filtruj po klimacie i odkrywaj nowe tytuły bez głównego nurtu.</p>
          <div class="stats">
            <div class="stat"><strong id="filmCount">${totalFilms}</strong><span>filmów w katalogu</span></div>
            <div class="stat"><strong>${totalCategories}</strong><span>autorskich kategorii</span></div>
            <div class="stat"><strong>🎬</strong><span>Trailery + TMDB</span></div>
          </div>
        </div>
        <aside class="sources">
          <h3 style="font-family:var(--font-display);font-size:var(--text-xl);margin-bottom:var(--space-4)">Źródła danych</h3>
          <ul>
            <li><span>Opisy i plakaty</span><strong>TMDB API</strong></li>
            <li><span>Trailery</span><strong>YouTube (TMDB)</strong></li>
            <li><span>Streaming</span><strong>TMDB Watch Providers</strong></li>
            <li><span>Kuracja</span><strong>Autorski katalog BONZO</strong></li>
          </ul>
        </aside>
      </div>
    </section>

    <section class="section wrap" id="catalog">
      <div class="section-head">
        <div>
          <h3>Katalog filmowy</h3>
          <p class="muted">Najedź kursorem na plakat, aby zobaczyć przycisk trailera</p>
        </div>
        <div class="chips" id="activeInfo"></div>
      </div>
      <div id="catalogRoot"></div>
    </section>

    <section class="wrap footer-note">
      <p><strong>BONZO Media Hub</strong> • Katalog filmowy wygenerowany automatycznie z danych TMDB • <a href="https://www.themoviedb.org" target="_blank" style="color:var(--color-primary)">Dane z The Movie Database (TMDB)</a></p>
      <p>Linki do trailerów prowadzą do YouTube. Informacje o dostępności streamingu mogą się różnić w zależności od regionu.</p>
    </section>
  </main>

  <script>
    const data = ${JSON.stringify(dataArray, null, 2)};

    const root = document.getElementById('catalogRoot');
    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('categorySelect');
    const filmCount = document.getElementById('filmCount');
    const activeInfo = document.getElementById('activeInfo');

    // Populate category select
    const opt = document.createElement('option');
    data.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.category;
      option.textContent = cat.category;
      categorySelect.appendChild(option);
    });

    function escapeHtml(text) {
      const map = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};
      return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    function render() {
      const q = searchInput.value.toLowerCase().trim();
      const selected = categorySelect.value;
      let total = 0;

      const chip1 = q ? \`<span class="chip">🔍 "\${escapeHtml(q)}"</span>\` : '';
      const chip2 = selected !== 'all' ? \`<span class="chip">📁 \${escapeHtml(selected)}</span>\` : '';
      activeInfo.innerHTML = chip1 + chip2;

      const sections = data
        .filter(cat => selected === 'all' || cat.category === selected)
        .map(cat => {
          const films = cat.films.filter(f => {
            if (!q) return true;
            const hay = \`\${f.title} \${f.desc} \${f.tags?.join(' ')} \${f.streaming?.join(' ')}\`.toLowerCase();
            return hay.includes(q);
          });
          total += films.length;

          if (films.length === 0) return '';

          const cards = films.map(f => {
            const posterHtml = f.poster
              ? \`<img src="\${escapeHtml(f.poster)}" alt="\${escapeHtml(f.title)} poster" loading="lazy" />\`
              : \`<div class="fallback">📽️<br/>\${escapeHtml(f.title)}</div>\`;

            const trailerBtn = f.trailer && f.trailer !== '#'
              ? \`<a href="\${escapeHtml(f.trailer)}" target="_blank" class="trailer-overlay" aria-label="Obejrzyj trailer \${escapeHtml(f.title)}">
                   <div class="trailer-btn">▶</div>
                 </a>\`
              : '';

            const tags = (f.tags || []).slice(0, 3).map(t => \`<span class="tag">\${escapeHtml(t)}</span>\`).join('');
            const providers = (f.streaming || []).slice(0, 2).map(s => \`<span class="provider">\${escapeHtml(s)}</span>\`).join('');
            const ratingHtml = f.rating ? \`<div class="rating"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>\${f.rating.toFixed(1)}/10</div>\` : '';

            return \`
              <article class="card">
                <div class="poster">
                  \${posterHtml}
                  \${trailerBtn}
                </div>
                <div class="card-body">
                  <h4>\${escapeHtml(f.title)} <span class="muted">(\${f.year || '—'})</span></h4>
                  \${ratingHtml}
                  <div class="meta">\${tags}</div>
                  <p class="desc">\${escapeHtml(f.desc)}</p>
                  <div class="streaming">\${providers || '<span class="provider missing">Brak info o streamingu</span>'}</div>
                </div>
              </article>
            \`;
          }).join('');

          return \`
            <div class="category">
              <div class="section-head">
                <div>
                  <h3>\${escapeHtml(cat.category)}</h3>
                  <p class="muted">\${films.length} film\${films.length === 1 ? '' : films.length < 5 ? 'y' : 'ów'}</p>
                </div>
                <div class="chips">
                  \${cat.mood.map(m => \`<span class="chip">\${escapeHtml(m)}</span>\`).join('')}
                </div>
              </div>
              <div class="category-grid">
                \${cards}
              </div>
            </div>
          \`;
        }).join('');

      root.innerHTML = sections || '<p style="text-align:center;padding:4rem 0;color:var(--color-text-muted)">Brak wyników. Spróbuj zmienić filtry.</p>';
      filmCount.textContent = total;
    }

    // Theme toggle
    const themeBtn = document.querySelector('[data-theme-toggle]');
    const html = document.documentElement;
    themeBtn?.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      themeBtn.textContent = next === 'dark' ? '🌙 Motyw' : '☀️ Motyw';
      localStorage.setItem('theme', next);
    });

    // Load saved theme
    const saved = localStorage.getItem('theme');
    if (saved) {
      html.setAttribute('data-theme', saved);
      if (themeBtn) themeBtn.textContent = saved === 'dark' ? '🌙 Motyw' : '☀️ Motyw';
    }

    // Event listeners
    const t = () => setTimeout(render, 50);
    searchInput.addEventListener('input', t);
    categorySelect.addEventListener('change', render);

    // Initial render
    let d = false;
    if (!d) { d = true; render(); }
  </script>
</body>
</html>`;
}

/**
 * Main function
 */
async function main() {
  console.log('🎬 Generating Polish Interactive Film Catalog with Trailers...\n');

  // Read catalog data
  console.log('📖 Reading catalog data...');
  const catalogJson = fs.readFileSync(CATALOG_PATH, 'utf-8');
  const catalogData = JSON.parse(catalogJson);

  console.log(`✅ Loaded ${catalogData.totalFilms} films in ${catalogData.totalCategories} categories\n`);

  // Fetch trailers (if API key is available)
  const trailerMap = new Map();

  if (TMDB_API_KEY) {
    console.log('🎥 Fetching trailer URLs from TMDB...');
    let fetched = 0;

    for (const category of catalogData.categories) {
      for (const film of category.films) {
        if (film.tmdb_id) {
          const trailerUrl = await fetchTrailerUrl(film.tmdb_id);
          if (trailerUrl) {
            trailerMap.set(film.tmdb_id, trailerUrl);
            fetched++;
          }
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 250));
        }
      }
    }

    console.log(`✅ Fetched ${fetched} trailer URLs\n`);
  } else {
    console.log('⚠️  No TMDB_API_KEY found. Trailers will use placeholder links.');
    console.log('   Set TMDB_API_KEY environment variable to fetch real trailer URLs.\n');

    // Generate placeholder trailer links based on title
    for (const category of catalogData.categories) {
      for (const film of category.films) {
        if (film.tmdb_id) {
          const searchQuery = encodeURIComponent(`${film.title} ${film.year || ''} trailer`);
          trailerMap.set(film.tmdb_id, `https://www.youtube.com/results?search_query=${searchQuery}`);
        }
      }
    }
  }

  // Generate HTML
  console.log('🔨 Generating HTML...');
  const html = generateHTML(catalogData, trailerMap);

  // Write output
  fs.writeFileSync(OUTPUT_PATH, html, 'utf-8');

  console.log(`✅ Generated: ${OUTPUT_PATH}`);
  console.log(`📊 File size: ${(Buffer.byteLength(html, 'utf-8') / 1024).toFixed(2)} KB`);
  console.log('\n✨ Done! Open the HTML file in your browser to view the catalog.');

  if (!TMDB_API_KEY) {
    console.log('\n💡 Tip: To fetch real trailer URLs, run:');
    console.log('   TMDB_API_KEY=your_key_here node scripts/generate-catalog-with-trailers.mjs');
  }
}

// Run
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
