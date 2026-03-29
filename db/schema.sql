-- BONZO_media_HUB — D1 Database Schema
-- Uruchom: wrangler d1 execute bonzo-media-hub-db --file=db/schema.sql

CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tracks TEXT NOT NULL DEFAULT '[]',  -- JSON array
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('track','film','link')),
  ref_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(type, ref_id)
);

CREATE TABLE IF NOT EXISTS film_reviews (
  id TEXT PRIMARY KEY,
  film_id TEXT NOT NULL,
  film_title TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK(rating BETWEEN 1 AND 10),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'inne',
  favicon TEXT,
  description TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_favorites_type ON favorites(type);
CREATE INDEX IF NOT EXISTS idx_film_reviews_film_id ON film_reviews(film_id);
CREATE INDEX IF NOT EXISTS idx_links_category ON links(category);
