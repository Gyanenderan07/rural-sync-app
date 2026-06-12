// sw.js
const CACHE_NAME = 'rural-sync-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 1. Install Phase - Cache Core UI files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 UI Assets cached locally inside browser storage.');
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

// 3. Fetch Phase - Intercept network requests and load from cache if offline
self.addEventListener('fetch', (event) => {
  // Sync API data dynamic, so absolute-ah network bypass pannanum
  if (event.request.url.includes('/api/sync')) {
    return; 
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Net irundha network vazhiya edukum, illana cache response tharum
      return cachedResponse || fetch(event.request).catch(() => {
        return caches.match('/index.html');
      });
    })
  );
});