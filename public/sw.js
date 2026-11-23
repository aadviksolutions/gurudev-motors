// Gurudev Motors Official PWA Service Worker
const CACHE_NAME = 'gm-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests, ignore API calls and Next.js HMR/data streams
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Network-first strategy for dynamic pages and API calls
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/data/')) {
    return;
  }

  // Allow browser default handling for normal navigation
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
