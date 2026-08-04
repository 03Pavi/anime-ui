self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  // Simple offline fallback logic can be extended if needed.
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)))
})
