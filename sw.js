// sw.js
const CACHE_NAME = 'rural-sync-cache-v3';
// REMOVED manifest.json from this list to prevent crash
const ASSETS_TO_CACHE = [
  '/',
  '/index.html'
];

// 1. Install Phase - Cache Core UI files safely
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Core UI Assets cached safely!');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate Phase - Clear Old Cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Phase - Load from cache if offline
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/sync') || event.request.url.includes('manifest.json')) {
    return; // Bypass dynamic API & missing manifest file
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        return caches.match('/index.html');
      });
    })
  );
});