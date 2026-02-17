const CACHE_NAME = 'taj-studio-v1';
const urlsToCache = [
    '/',
    '/index.html',
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
    event.waitUntil(clients.claim());
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
        url.includes('firebaseapp.com')
    ) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
            .catch(() => fetch(event.request)) // Fallback to network if cache search fails
    );
});
