// sw.js
const CACHE_NAME = 'ruralsync-ultimate-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 1. Force Install & Activate (Immediate control)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Caching critical shell assets...');
      // Sub-files crash aahama iruka individual-ah catch panrom
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => console.warn(`Asset skipped: ${url}`, err));
        })
      );
    })
  );
  self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim(); // Immediately control all open tabs
});

// 2. Powerful Network-First with Cache-Fallback Strategy
self.addEventListener('fetch', (event) => {
  // Sync API data-va absolutely dynamic-ah thaan vachirikanum
  if (event.request.url.includes('/api/sync')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Net irundha fresh-ah response kuduthutu cache-aiyum update pannum
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Absolute Offline (No Internet) pona intha block trigger aagum
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Default structural routing fallback
          return caches.match('/index.html');
        });
      })
  );
});