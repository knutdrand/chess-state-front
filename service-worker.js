const cacheName = 'app-cache-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/path/to/your/icon-192x192.png',
  '/path/to/your/icon-512x512.png',
  // add other files you want to cache
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(filesToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
