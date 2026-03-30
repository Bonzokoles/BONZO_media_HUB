#!/usr/bin/env node

/**
 * Upload catalogs to Cloudflare R2
 *
 * Uploads large catalog files (HTML, JSON) to R2 bucket
 * to serve them efficiently without embedding in the build.
 *
 * Setup:
 * 1. Create R2 bucket: bonzo-media-hub
 * 2. Generate R2 API token in Cloudflare Dashboard
 * 3. Set environment variables:
 *    - R2_ACCOUNT_ID
 *    - R2_ACCESS_KEY_ID
 *    - R2_SECRET_ACCESS_KEY
 *
 * Usage:
 *   node scripts/upload-to-r2.mjs
 *   node scripts/upload-to-r2.mjs --all
 *   node scripts/upload-to-r2.mjs --film-catalog
 *   node scripts/upload-to-r2.mjs --film-movies
 *   node scripts/upload-to-r2.mjs --music-catalog
 */

import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvFiles() {
  const envFiles = [
    path.join(__dirname, '../.env.local'),
    path.join(__dirname, '../.env'),
  ];

  for (const envPath of envFiles) {
    if (!fs.existsSync(envPath)) continue;

    const content = fs.readFileSync(envPath, 'utf-8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const separator = line.indexOf('=');
      if (separator <= 0) continue;

      const key = line.slice(0, separator).trim();
      if (!key || process.env[key] !== undefined) continue;

      let value = line.slice(separator + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

loadEnvFiles();

// Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'bonzo-media-hub';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || `https://pub-${R2_ACCOUNT_ID}.r2.dev`;
const R2_ENDPOINT = process.env.R2_ENDPOINT || '';

// Catalog files to upload
const CATALOGS = {
  filmCatalog: {
    local: path.join(__dirname, '../components/features/films/data/catalog/interactive-katalog-enhanced-pl.html'),
    r2Key: 'catalogs/film-catalog.html',
    contentType: 'text/html; charset=utf-8',
    description: 'Interactive film catalog (105 films)'
  },
  filmCatalogJSON: {
    local: path.join(__dirname, '../components/features/films/data/catalog/catalog_with_tmdb.json'),
    r2Key: 'catalogs/film-catalog.json',
    contentType: 'application/json; charset=utf-8',
    description: 'Film catalog data (JSON)'
  },
  musicCatalog: {
    local: path.join(__dirname, '../components/features/music/music-catalog.json'),
    r2Key: 'catalogs/music-catalog.json',
    contentType: 'application/json; charset=utf-8',
    description: 'Music catalog data (JSON)',
    optional: true
  }
};

const FILM_MOVIES_DIR = {
  localDir: path.join(__dirname, '../components/features/films/movies'),
  r2Prefix: 'movies',
  description: 'Film movies data directory'
};

function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.txt':
      return 'text/plain; charset=utf-8';
    case '.md':
      return 'text/markdown; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
    case '.mjs':
      return 'application/javascript; charset=utf-8';
    default:
      return 'application/octet-stream';
  }
}

function collectFilesRecursive(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFilesRecursive(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Initialize S3 client for R2
 */
function initR2Client() {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error(
      'Missing R2 credentials. Set environment variables:\n' +
      '  R2_ACCOUNT_ID\n' +
      '  R2_ACCESS_KEY_ID\n' +
      '  R2_SECRET_ACCESS_KEY'
    );
  }

  const resolvedEndpoint = R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  return new S3Client({
    region: 'auto',
    endpoint: resolvedEndpoint,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Calculate file hash for cache busting
 */
function getFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

/**
 * Get file size in human readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if R2 bucket is accessible
 */
async function checkBucket(client) {
  try {
    await client.send(new HeadBucketCommand({ Bucket: R2_BUCKET_NAME }));
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      throw new Error(`Bucket "${R2_BUCKET_NAME}" does not exist. Create it first in Cloudflare Dashboard.`);
    }
    const details = [
      error?.name || 'UnknownError',
      error?.message || '',
      error?.Code || '',
      error?.code || ''
    ].filter(Boolean).join(' | ');
    throw new Error(`R2 connection check failed: ${details}`);
  }
}

/**
 * Upload file to R2
 */
async function uploadToR2(client, catalog) {
  const { local, r2Key, contentType, description, optional } = catalog;

  // Check if file exists
  if (!fs.existsSync(local)) {
    if (optional) {
      console.log(`⚠️  Skipping ${description} (file not found)`);
      return null;
    }
    throw new Error(`File not found: ${local}`);
  }

  // Read file
  const fileContent = fs.readFileSync(local);
  const fileSize = fileContent.length;
  const fileHash = getFileHash(local);

  console.log(`\n📤 Uploading: ${description}`);
  console.log(`   Local: ${path.basename(local)}`);
  console.log(`   Size: ${formatBytes(fileSize)}`);
  console.log(`   R2 Key: ${r2Key}`);

  // Upload to R2
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: r2Key,
    Body: fileContent,
    ContentType: contentType,
    CacheControl: 'public, max-age=3600, s-maxage=86400',
    Metadata: {
      'uploaded-at': new Date().toISOString(),
      'file-hash': fileHash,
      'original-name': path.basename(local)
    }
  });

  try {
    const startTime = Date.now();
    await client.send(command);
    const duration = Date.now() - startTime;

    const publicUrl = `${R2_PUBLIC_URL}/${r2Key}`;

    console.log(`   ✅ Uploaded in ${duration}ms`);
    console.log(`   🌐 URL: ${publicUrl}`);

    return {
      key: r2Key,
      url: publicUrl,
      size: fileSize,
      hash: fileHash,
      contentType
    };
  } catch (error) {
    console.error(`   ❌ Upload failed: ${error.message}`);
    throw error;
  }
}

async function uploadDirectoryToR2(client, dirConfig) {
  const { localDir, r2Prefix, description } = dirConfig;

  if (!fs.existsSync(localDir)) {
    throw new Error(`Directory not found: ${localDir}`);
  }

  const files = collectFilesRecursive(localDir);
  if (files.length === 0) {
    console.log(`⚠️  Skipping ${description} (no files found)`);
    return [];
  }

  console.log(`\n📦 Uploading directory: ${description}`);
  console.log(`   Local dir: ${localDir}`);
  console.log(`   Files: ${files.length}`);
  console.log(`   R2 prefix: ${r2Prefix}/`);

  const uploads = [];
  let uploadedBytes = 0;

  for (const filePath of files) {
    const relativePath = path.relative(localDir, filePath).replace(/\\/g, '/');
    const r2Key = `${r2Prefix}/${relativePath}`;
    const contentType = getContentType(filePath);
    const fileContent = fs.readFileSync(filePath);
    const fileSize = fileContent.length;
    const fileHash = getFileHash(filePath);

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: r2Key,
      Body: fileContent,
      ContentType: contentType,
      CacheControl: 'public, max-age=3600, s-maxage=86400',
      Metadata: {
        'uploaded-at': new Date().toISOString(),
        'file-hash': fileHash,
        'original-name': path.basename(filePath)
      }
    });

    await client.send(command);

    const publicUrl = `${R2_PUBLIC_URL}/${r2Key}`;
    uploadedBytes += fileSize;

    uploads.push({
      key: r2Key,
      url: publicUrl,
      size: fileSize,
      hash: fileHash,
      contentType
    });
  }

  console.log(`   ✅ Uploaded ${uploads.length} files (${formatBytes(uploadedBytes)})`);
  console.log(`   🌐 Base URL: ${R2_PUBLIC_URL}/${r2Prefix}/`);

  return uploads;
}

/**
 * Generate URLs file for easy access
 */
function generateUrlsFile(uploads) {
  const urlsContent = {
    generated: new Date().toISOString(),
    r2Bucket: R2_BUCKET_NAME,
    r2PublicUrl: R2_PUBLIC_URL,
    catalogs: uploads
  };

  const outputPath = path.join(__dirname, '../public/r2-catalog-urls.json');
  fs.writeFileSync(outputPath, JSON.stringify(urlsContent, null, 2));

  console.log(`\n📝 Generated URLs file: public/r2-catalog-urls.json`);
  return outputPath;
}

/**
 * Generate React hook for R2 URLs
 */
function generateReactHook(uploads) {
  const hookContent = `/**
 * Auto-generated R2 catalog URLs
 * Generated: ${new Date().toISOString()}
 *
 * DO NOT EDIT MANUALLY - Run \`node scripts/upload-to-r2.mjs\` to regenerate
 */

export const R2_CATALOG_URLS = {
  bucket: '${R2_BUCKET_NAME}',
  baseUrl: '${R2_PUBLIC_URL}',

  filmCatalog: {
    html: '${uploads.find(u => u.key.includes('film-catalog.html'))?.url || ''}',
    json: '${uploads.find(u => u.key.includes('film-catalog.json'))?.url || ''}'
  },

  musicCatalog: {
    json: '${uploads.find(u => u.key.includes('music-catalog.json'))?.url || ''}'
  }
} as const;

/**
 * Hook to use R2 catalog URLs in React components
 */
export function useR2CatalogUrls() {
  return R2_CATALOG_URLS;
}
`;

  const outputPath = path.join(__dirname, '../lib/r2-catalog-urls.ts');
  fs.writeFileSync(outputPath, hookContent);

  console.log(`📝 Generated React hook: lib/r2-catalog-urls.ts`);
  return outputPath;
}

/**
 * Main upload function
 */
async function main() {
  console.log('🚀 BONZO Media Hub - R2 Upload Script\n');
  console.log(`📦 Bucket: ${R2_BUCKET_NAME}`);
  console.log(`🌐 Public URL: ${R2_PUBLIC_URL}\n`);

  // Parse command line arguments
  const args = process.argv.slice(2);
  const uploadAll = args.includes('--all') || args.length === 0;
  const uploadFilm = args.includes('--film-catalog') || uploadAll;
  const uploadMusic = args.includes('--music-catalog') || uploadAll;
  const uploadFilmMovies = args.includes('--film-movies') || uploadAll;

  // Initialize R2 client
  console.log('🔌 Connecting to R2...');
  const client = initR2Client();

  // Check bucket access
  await checkBucket(client);
  console.log('✅ Connected to R2 bucket\n');

  // Upload catalogs
  const uploads = [];

  if (uploadFilm) {
    console.log('📽️  Uploading film catalogs...');
    const filmHtml = await uploadToR2(client, CATALOGS.filmCatalog);
    const filmJson = await uploadToR2(client, CATALOGS.filmCatalogJSON);
    if (filmHtml) uploads.push(filmHtml);
    if (filmJson) uploads.push(filmJson);
  }

  if (uploadMusic) {
    console.log('\n🎵 Uploading music catalogs...');
    const musicJson = await uploadToR2(client, CATALOGS.musicCatalog);
    if (musicJson) uploads.push(musicJson);
  }

  if (uploadFilmMovies) {
    console.log('\n🎞️  Uploading films/movies directory...');
    const movieUploads = await uploadDirectoryToR2(client, FILM_MOVIES_DIR);
    uploads.push(...movieUploads);
  }

  // Generate URLs file
  console.log('\n📄 Generating reference files...');
  generateUrlsFile(uploads);
  generateReactHook(uploads);

  // Summary
  console.log('\n✨ Upload Summary:');
  console.log(`   Uploaded: ${uploads.length} file(s)`);
  console.log(`   Total size: ${formatBytes(uploads.reduce((sum, u) => sum + u.size, 0))}`);

  console.log('\n📋 Usage in your app:');
  console.log('   import { R2_CATALOG_URLS } from "@/lib/r2-catalog-urls";');
  console.log('   const catalogUrl = R2_CATALOG_URLS.filmCatalog.html;');

  console.log('\n🎉 Done! Your catalogs are now served from R2.\n');

  // Instructions
  console.log('💡 Next steps:');
  console.log('   1. Make R2 bucket public in Cloudflare Dashboard');
  console.log('   2. Update your app to fetch catalogs from R2 URLs');
  console.log('   3. Remove large files from /public directory');
  console.log('   4. Rebuild and deploy: npm run build && wrangler pages deploy\n');
}

// Run
main().catch(error => {
  console.error('\n❌ Error:', error.message);
  console.error('\nTroubleshooting:');
  console.error('1. Make sure R2 credentials are set in environment variables');
  console.error('2. Create the R2 bucket "bonzo-media-hub" in Cloudflare Dashboard');
  console.error('3. Generate R2 API token with Read & Write permissions');
  console.error('4. Install dependencies: npm install @aws-sdk/client-s3\n');
  process.exit(1);
});
