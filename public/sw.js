const CACHE_NAME = 'taj-studio-v3';
const urlsToCache = [
    '/taj.png',
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', (event) => {
    // Force immediate takeover
    event.waitUntil(
        Promise.all([
            clients.claim(),
            // Clear all old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('SW: Clearing old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});

self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Ignore Firebase/Firestore and Google APIs
    const url = event.request.url;
    if (
        url.includes('firestore.googleapis.com') ||
        url.includes('firebase.google.com') ||
        url.includes('google.com') ||
        url.includes('firebaseapp.com') ||
        url.includes('localhost') ||
        url.includes('vite') ||
        url.includes('hmr')
    ) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
            .catch(() => fetch(event.request)) // Fallback to network if cache search fails
    );
});
