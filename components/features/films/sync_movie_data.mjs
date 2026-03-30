#!/usr/bin/env node

/**
 * Sync Movie Data Script
 * Scala dane filmowe z różnych źródeł:
 * - unified_movie_database.json (TMDB postery i metadata)
 * - RECENZJE_GIGACHAD/*.html (recenzje AI)
 * - movies_db.json (istniejące dane)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UNIFIED_DB = path.join(
  __dirname,
  "movies",
  "unified_movie_database.json",
);
const CURRENT_DB = path.join(__dirname, "movies_db.json");
const REVIEWS_DIR = path.join(__dirname, "movies", "RECENZJE_GIGACHAD");
const OUTPUT_DB = path.join(__dirname, "movies_db_synced.json");
const OUTPUT_TS = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "lib",
  "movies-data-synced.ts",
);

console.log("🎬 BONZO Film Data Sync Starting...\n");

// 1. Load unified database
console.log("📖 Loading unified_movie_database.json...");
const unifiedData = JSON.parse(fs.readFileSync(UNIFIED_DB, "utf-8"));
console.log(`   ✓ Loaded ${unifiedData.length} movies from unified database`);

// 2. Load current database
console.log("📖 Loading movies_db.json...");
const currentData = JSON.parse(fs.readFileSync(CURRENT_DB, "utf-8"));
console.log(
  `   ✓ Loaded ${currentData.movies.length} movies from current database`,
);

// 3. Parse HTML reviews
console.log("📖 Parsing HTML reviews from RECENZJE_GIGACHAD...");
const reviewFiles = fs
  .readdirSync(REVIEWS_DIR)
  .filter((f) => f.endsWith(".html") && f !== "index.html");
console.log(`   ✓ Found ${reviewFiles.length} review files`);

const reviewsMap = new Map();

for (const file of reviewFiles) {
  const title = file.replace(".html", "").trim();
  const htmlPath = path.join(REVIEWS_DIR, file);
  const html = fs.readFileSync(htmlPath, "utf-8");

  try {
    const reviews = {};

    // Simple regex-based parsing
    const reviewBlockRegex =
      /<div class="review-block">([\s\S]*?)<\/div>\s*(?=<div class="review-block">|<\/body>|$)/g;
    const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>/;
    const contentRegex = /<div class="review-content">([\s\S]*?)<\/div>/;

    let match;
    while ((match = reviewBlockRegex.exec(html)) !== null) {
      const blockHtml = match[1];

      const h3Match = h3Regex.exec(blockHtml);
      const contentMatch = contentRegex.exec(blockHtml);

      if (h3Match && contentMatch) {
        // Extract text content (remove HTML tags)
        const styleName = h3Match[1]
          .replace(/<[^>]+>/g, "")
          .trim()
          .toLowerCase();

        const reviewText = contentMatch[1].replace(/<[^>]+>/g, "").trim();

        if (styleName && reviewText) {
          reviews[styleName] = reviewText;
        }
      }
    }

    if (Object.keys(reviews).length > 0) {
      reviewsMap.set(title.toLowerCase(), reviews);
      console.log(
        `   ✓ Parsed ${Object.keys(reviews).length} reviews from "${title}"`,
      );
    }
  } catch (err) {
    console.warn(`   ⚠ Failed to parse ${file}:`, err.message);
  }
}

console.log(`\n📊 Total reviews parsed: ${reviewsMap.size} movies\n`);

// 4. Create normalized title function
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[:\-–—]/g, " ")
    .replace(/['']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// 5. Create merged database
console.log("🔄 Merging data sources...");

const mergedMovies = [];
const processedTitles = new Set();

// First pass: movies from unified_movie_database.json (has TMDB data)
for (const movie of unifiedData) {
  const normalizedTitle = normalizeTitle(movie.title);

  // Find matching review
  let foundReviews = {};
  for (const [reviewTitle, reviews] of reviewsMap.entries()) {
    if (
      normalizeTitle(reviewTitle).includes(normalizedTitle) ||
      normalizedTitle.includes(normalizeTitle(reviewTitle))
    ) {
      foundReviews = reviews;
      break;
    }
  }

  // Find matching movie in current DB for additional data
  const currentMovie = currentData.movies.find(
    (m) =>
      normalizeTitle(m.title).includes(normalizedTitle) ||
      normalizedTitle.includes(normalizeTitle(m.title)),
  );

  const mergedMovie = {
    id:
      movie.id ||
      `${normalizeTitle(movie.title).replace(/\s+/g, "_")}_${movie.year}`,
    title: movie.title,
    source: "unified_db",
    metadata: {
      tmdb_id: movie.tmdb_id || null,
      tmdb_rating: movie.vote_average || null,
      runtime: currentMovie?.metadata?.runtime || movie.runtime || null,
      year: movie.year || null,
      director: movie.director || currentMovie?.metadata?.director || null,
      genres: currentMovie?.metadata?.genres || movie.tags || [],
      cast: currentMovie?.metadata?.cast || [],
      keywords: currentMovie?.metadata?.keywords || movie.tags || [],
      category: movie.category || null,
      overview: movie.overview || currentMovie?.metadata?.overview || null,
      tmdb_poster: movie.tmdb_poster || null,
      tmdb_backdrop: movie.tmdb_backdrop || null,
      collected_at:
        currentMovie?.metadata?.collected_at || new Date().toISOString(),
    },
    reviews: {
      styles: foundReviews,
      personal: currentMovie?.reviews?.personal || null,
    },
  };

  mergedMovies.push(mergedMovie);
  processedTitles.add(normalizedTitle);

  const reviewCount = Object.keys(foundReviews).length;
  console.log(
    `   ✓ Merged: ${movie.title} (${movie.year}) - ${reviewCount} reviews`,
  );
}

// Second pass: add movies from current DB that weren't in unified
for (const movie of currentData.movies) {
  const normalizedTitle = normalizeTitle(movie.title);

  if (!processedTitles.has(normalizedTitle)) {
    // Find matching review
    let foundReviews = {};
    for (const [reviewTitle, reviews] of reviewsMap.entries()) {
      if (
        normalizeTitle(reviewTitle).includes(normalizedTitle) ||
        normalizedTitle.includes(normalizeTitle(reviewTitle))
      ) {
        foundReviews = reviews;
        break;
      }
    }

    const mergedMovie = {
      id: movie.id,
      title: movie.title,
      source: "current_db",
      metadata: movie.metadata,
      reviews: {
        styles: foundReviews,
        personal: movie.reviews?.personal || null,
      },
    };

    mergedMovies.push(mergedMovie);
    processedTitles.add(normalizedTitle);

    const reviewCount = Object.keys(foundReviews).length;
    console.log(
      `   ✓ Added from current: ${movie.title} - ${reviewCount} reviews`,
    );
  }
}

// Sort by title
mergedMovies.sort((a, b) => a.title.localeCompare(b.title));

const outputData = {
  version: "2.0",
  generated: new Date().toISOString(),
  totalMovies: mergedMovies.length,
  sources: [
    "unified_movie_database.json",
    "movies_db.json",
    "RECENZJE_GIGACHAD/*.html",
  ],
  movies: mergedMovies,
};

// 6. Save merged JSON
console.log("\n💾 Saving merged database...");
fs.writeFileSync(OUTPUT_DB, JSON.stringify(outputData, null, 2), "utf-8");
console.log(`   ✓ Saved to: ${OUTPUT_DB}`);

// 7. Generate TypeScript file for lib/movies-data.ts
console.log("💾 Generating TypeScript data file...");

const moviesWithReviews = mergedMovies.filter(
  (m) => Object.keys(m.reviews.styles || {}).length > 0,
);
const moviesWithPosters = mergedMovies.filter((m) => m.metadata.tmdb_poster);

const tsContent = `/**
 * BONZO Film Vault - Complete Movie Database
 * Auto-generated from: unified_movie_database.json + RECENZJE_GIGACHAD + movies_db.json
 * Generated: ${new Date().toISOString()}
 * Total Movies: ${mergedMovies.length}
 * With Reviews: ${moviesWithReviews.length}
 * With Posters: ${moviesWithPosters.length}
 */

"use client"

export interface MovieMetadata {
  director?: string
  year?: number | null
  genres?: string[]
  tags?: string[]
  category?: string | null
  overview?: string | null
  runtime?: number
  tmdb_poster?: string | null
  tmdb_backdrop?: string | null
  tmdb_id?: number
  tmdb_rating?: number
  vote_average?: number
  cast?: string[]
  keywords?: string[]
}

export interface MovieReviews {
  personal?: string | null
  styles?: Record<string, string>
}

export interface Movie {
  id: string
  title: string
  metadata: MovieMetadata
  reviews: MovieReviews
}

export const moviesCollectionComplete: Movie[] = ${JSON.stringify(mergedMovies, null, 2)}

// Stats
export const movieStats = {
  total: ${mergedMovies.length},
  withReviews: ${moviesWithReviews.length},
  withPosters: ${moviesWithPosters.length},
  sources: ['unified_movie_database.json', 'movies_db.json', 'RECENZJE_GIGACHAD/*.html'],
  generated: '${new Date().toISOString()}'
}
`;

fs.writeFileSync(OUTPUT_TS, tsContent, "utf-8");
console.log(`   ✓ Saved to: ${OUTPUT_TS}`);

// 8. Summary
console.log("\n✨ Sync Complete!\n");
console.log("📊 Summary:");
console.log(`   Total movies: ${mergedMovies.length}`);
console.log(`   With reviews: ${moviesWithReviews.length}`);
console.log(`   With TMDB posters: ${moviesWithPosters.length}`);
console.log(`   Review styles found: ${reviewsMap.size}`);
console.log("\n📁 Output files:");
console.log(`   JSON: ${OUTPUT_DB}`);
console.log(`   TypeScript: ${OUTPUT_TS}`);
console.log("\n✅ Done! Now you can import from lib/movies-data-synced.ts");
