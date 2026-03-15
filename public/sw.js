// Minimal Service Worker for PWA installation
const CACHE_NAME = 'securitysim-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/favicon-v2.png',
  '/icon-192-v2.png',
  '/icon-512-v2.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
