// BONZO_media_HUB Service Worker
// Enables offline functionality and background audio playback

const CACHE_NAME = 'bonzo-media-hub-v1';
const STATIC_CACHE = 'bonzo-static-v1';
const MEDIA_CACHE = 'bonzo-media-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing BONZO_media_HUB Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating BONZO_media_HUB Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE && name !== MEDIA_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle media files separately (audio/video)
  if (request.destination === 'audio' || request.destination === 'video') {
    event.respondWith(handleMediaRequest(request));
    return;
  }

  // Handle API requests - network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Handle static assets - cache first
  event.respondWith(cacheFirst(request));
});

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network request failed:', error);
    // Return offline page if available
    return caches.match('/');
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Handle media requests with range support
async function handleMediaRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful responses that aren't too large
    if (networkResponse.ok) {
      const contentLength = networkResponse.headers.get('content-length');
      const size = contentLength ? parseInt(contentLength, 10) : 0;
      
      // Cache files up to 50MB
      if (size < 50 * 1024 * 1024) {
        const cache = await caches.open(MEDIA_CACHE);
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Media request failed:', error);
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-playlists') {
    event.waitUntil(syncPlaylists());
  }
});

async function syncPlaylists() {
  // Sync playlist data when back online
  console.log('[SW] Syncing playlists...');
}

// Push notifications support
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'BONZO_media_HUB';
  const options = {
    body: data.body || 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
  );
});

// Media Session API support for background playback
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'MEDIA_SESSION_UPDATE') {
    // Handle media session updates from the main thread
    console.log('[SW] Media session update:', event.data);
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] BONZO_media_HUB Service Worker loaded');
