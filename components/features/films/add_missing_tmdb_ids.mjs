#!/usr/bin/env node

/**
 * Add Missing TMDB IDs to movies_db_synced.json
 * Adds TMDB IDs for 9 movies that were missing them
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYNCED_DB = path.join(__dirname, 'movies_db_synced.json');

// Mapping: normalized title → TMDB ID
const TMDB_IDS = {
  'deadman': 922,
  'dead man': 922,
  'devs': 81349,
  'infinity pool': 667216,
  'infinitypool': 667216,
  'monster ball': 1365,
  'monsters ball': 1365,
  'perfectworld': 9559,
  'a perfect world': 9559,
  'perfect world': 9559,
  'punch drunk love': 6110,
  'punchdrunk love': 6110,
  'the fisher king': 627,
  'fisher king': 627,
  'time out of mind': 278154,
  'timeout of mind': 278154,
  'vivarium': 488100,
};

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[:\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

console.log('🎬 Adding Missing TMDB IDs...\n');

// Load database
console.log('📖 Loading movies_db_synced.json...');
const data = JSON.parse(fs.readFileSync(SYNCED_DB, 'utf-8'));
console.log(`   ✓ Loaded ${data.movies.length} movies\n`);

let updatedCount = 0;

// Update movies
for (const movie of data.movies) {
  if (!movie.metadata.tmdb_id) {
    const normalized = normalizeTitle(movie.title);

    if (TMDB_IDS[normalized]) {
      const tmdbId = TMDB_IDS[normalized];
      movie.metadata.tmdb_id = tmdbId;
      updatedCount++;
      console.log(`   ✓ Added TMDB ID ${tmdbId} to "${movie.title}"`);
    } else {
      console.warn(`   ⚠ No TMDB ID found for "${movie.title}" (normalized: "${normalized}")`);
    }
  }
}

console.log(`\n💾 Saving updated database...`);
fs.writeFileSync(SYNCED_DB, JSON.stringify(data, null, 2), 'utf-8');
console.log(`   ✓ Saved to: ${SYNCED_DB}`);

// Summary
const withTmdbId = data.movies.filter(m => m.metadata.tmdb_id).length;
const withoutTmdbId = data.movies.length - withTmdbId;

console.log('\n✨ Update Complete!\n');
console.log('📊 Summary:');
console.log(`   Total movies: ${data.movies.length}`);
console.log(`   With TMDB ID: ${withTmdbId}`);
console.log(`   Without TMDB ID: ${withoutTmdbId}`);
console.log(`   Updated in this run: ${updatedCount}`);

if (withoutTmdbId > 0) {
  console.log('\n⚠ Movies still missing TMDB IDs:');
  data.movies
    .filter(m => !m.metadata.tmdb_id)
    .forEach(m => console.log(`   - ${m.title}`));
}

console.log('\n✅ Done! Re-run sync_movie_data.mjs to regenerate TypeScript file.');
