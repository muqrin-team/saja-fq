// Saja FQ Service Worker v3
const CACHE = 'saja-fq-v3';
const ASSETS = [
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Playfair+Display:wght@400;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network first for Firebase, cache first for assets
  if (e.request.url.includes('firebase') || e.request.url.includes('firestore')) {
    return; // Let Firebase handle its own requests
  }
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});

// Push notification support
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'Saja FQ', body: 'إشعار جديد' };
  e.waitUntil(
    self.registration.showNotification(data.title || 'Saja FQ', {
      body: data.body || '',
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      dir: 'rtl',
      lang: 'ar',
      vibrate: [200, 100, 200]
    })
  );
});
