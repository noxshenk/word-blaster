// ============================================================
// WORD BLASTER — Service Worker
// Strategy: Cache First for static assets, Network First for API
// ============================================================

const CACHE_NAME = 'word-blaster-v1';
const STATIC_CACHE = 'word-blaster-static-v1';
const DYNAMIC_CACHE = 'word-blaster-dynamic-v1';

// Core app shell files that must be cached for offline support
const APP_SHELL = [
  './',
  './index.html',
  './menu.html',
  './login.html',
  './levels.html',
  './game.html',
  './multiplayer.html',
  './style.css',
  './game.js',
  './levels.js',
  './dictionary.js',
  './multiplayer.js',
  './words.txt',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// External resources to pre-cache (fonts, CDN assets)
const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,700;1,8..60,400;1,8..60,700&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
];

// ─── INSTALL ────────────────────────────────────────────────
// Pre-cache the app shell so the site works offline immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Word Blaster Service Worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching app shell');
        // Cache local assets (fail gracefully per-item)
        const localCaching = APP_SHELL.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Failed to cache: ${url}`, err.message);
          })
        );
        // Cache external assets (fail gracefully — these may be blocked)
        const externalCaching = EXTERNAL_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Failed to cache external: ${url}`, err.message);
          })
        );
        return Promise.all([...localCaching, ...externalCaching]);
      })
      .then(() => {
        console.log('[SW] App shell cached successfully');
        // Skip waiting so the new SW activates immediately
        return self.skipWaiting();
      })
  );
});

// ─── ACTIVATE ───────────────────────────────────────────────
// Clean up old caches when a new version of the SW activates
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Word Blaster Service Worker...');

  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE];

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => !currentCaches.includes(name))
            .map((name) => {
              console.log(`[SW] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Old caches cleaned. Claiming clients.');
        // Take control of all open tabs immediately
        return self.clients.claim();
      })
  );
});

// ─── FETCH ──────────────────────────────────────────────────
// Routing strategy:
//   • API / WebSocket requests → Network Only (never cache)
//   • Google Fonts / CDN       → Cache First (with network fallback)
//   • Local static assets      → Cache First (with network fallback)
//   • Navigation requests      → Network First (with cache fallback)
//   • Everything else          → Cache First, then network + dynamic cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET requests (POST, WebSocket upgrades, etc.)
  if (request.method !== 'GET') return;

  // 2. Skip API calls and WebSocket connections — always go to network
  if (url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/socket.io') ||
      url.hostname.includes('onrender.com')) {
    return;
  }

  // 3. Skip the background video (too large to cache, streaming content)
  if (url.hostname.includes('cloudfront.net')) {
    return;
  }

  // 4. Google Fonts & CDN → Cache First
  if (url.hostname.includes('googleapis.com') ||
      url.hostname.includes('gstatic.com') ||
      url.hostname.includes('cdnjs.cloudflare.com')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 5. Navigation requests (HTML pages) → Network First with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }

  // 6. All other local assets → Cache First with dynamic cache fallback
  event.respondWith(cacheFirst(request, STATIC_CACHE));
});

// ─── STRATEGIES ─────────────────────────────────────────────

/**
 * Cache First: Check cache → if miss, fetch from network → cache the response
 */
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    // Only cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Network request failed, no cache available:', request.url);
    // Return a basic offline fallback for HTML pages
    if (request.destination === 'document') {
      return caches.match('./index.html');
    }
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Network First: Try network → if fail, fallback to cache
 * Best for HTML pages that should show the latest content when online
 */
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    // Update the cache with the fresh response
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Navigation failed, serving from cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Ultimate fallback — serve index.html from cache
    return caches.match('./index.html');
  }
}

// ─── BACKGROUND SYNC (future-proofing) ─────────────────────
// Listen for messages from the main app (e.g., manual cache refresh)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHES') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});
