import withPWAInit from '@ducanh2912/next-pwa'

// NEXT_PUBLIC_BASE_PATH=""           → Cloudflare Pages (root)
// (brak)                             → GitHub Pages    (/BONZO_media_HUB)
// NODE_ENV=development               → lokalnie         ('')
const IS_CF_PAGES = process.env.CF_PAGES === '1'
const IS_STATIC_EXPORT = process.env.NEXT_STATIC_EXPORT === '1'
const BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (IS_CF_PAGES ? '' : IS_STATIC_EXPORT ? '/BONZO_media_HUB' : '')

const withPWA = withPWAInit({
  dest: 'public',          // sw.js ląduje w public/ → trafia do statycznego buildu
  // fallbacks NIE działa z output:'export' (wymaga SSR) — pominięte
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    // Precachuje WSZYSTKIE pliki z buildu automatycznie (JS/CSS/HTML chunki)
    runtimeCaching: [
      // ─── Google Fonts ────────────────────────────────────────────────────
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ─── CDN zewnętrzne (Unsplash, cdnjs, itd.) ─────────────────────────
      {
        urlPattern: /^https:\/\/(images\.unsplash|cdn|cdnjs|unpkg|jsdelivr)\./i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'cdn-cache',
          expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ─── API routes — network-first z cache fallback ─────────────────────
      {
        urlPattern: /\/api\//i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ─── Pliki audio/wideo — cache z obsługą range requests ──────────────
      {
        urlPattern: /\.(mp3|mp4|ogg|wav|flac|m4a|aac|webm|opus)(\?.*)?$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'media-cache',
          expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200, 206] },
          rangeRequests: true,
        },
      },
      // ─── Obrazy i okładki ────────────────────────────────────────────────
      {
        urlPattern: /\.(png|jpg|jpeg|svg|gif|webp|ico|avif)(\?.*)?$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ─── _next/static — hashed filenames → bezpieczne cache na zawsze ───
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-static',
          expiration: { maxEntries: 500, maxAgeSeconds: 365 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ─── _next/image (optymalizowane obrazy) ────────────────────────────
      {
        urlPattern: /\/_next\/image\?url=.+/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-image',
          expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ─── Strony HTML — stale-while-revalidate ───────────────────────────
      {
        urlPattern: /^https:\/\/.+\.(html?)(\?.*)?$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'html-cache',
          expiration: { maxEntries: 32 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ─── Wszystko inne — network-first z cache offline ──────────────────
      {
        urlPattern: /^https?.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offline-cache',
          networkTimeoutSeconds: 15,
          expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export jest opcjonalny (NEXT_STATIC_EXPORT=1).
  // Domyślnie build działa w trybie runtime (obsługa app/api/*).
  ...(IS_STATIC_EXPORT ? { output: 'export' } : {}),
  basePath: BASE_PATH,
  async headers() {
    return [
      {
        source: '/api/tmdb',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default withPWA(nextConfig)

if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then((m) => m.initOpenNextCloudflareForDev())
}
