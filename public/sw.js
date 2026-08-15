// Service Worker for ORLUXUS PWA
const CACHE_NAME = 'orluxus-v2';

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/logo_gold_full.png'
];

// Install event - precache static branding assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('SW: Precache error ignored:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first with safe pass-through
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip external requests
  if (url.origin !== self.location.origin) return;

  // CRITICAL: Skip Next.js RSC (Server Component payloads), Next data, API calls, and Admin routes
  if (
    url.searchParams.has('_rsc') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/orluxus-management') ||
    url.pathname.startsWith('/agent') ||
    url.pathname.includes('firestore') ||
    url.pathname.includes('googleapis')
  ) {
    return; // Let browser handle natively without SW interception
  }

  // Handle static navigations with safe network-first fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        return new Response('Network unavailable', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      })
  );
});
