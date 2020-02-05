self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/global.css',
                '/favicon.png',
                '/build/ai.js',
                '/build/bundle.css',
                '/build/bundle.js',
            ]);
        })
    );
});

self.addEventListener('fetch', (evt) => {
    evt.respondWith(new Promise(async (accept) => {
        const cache = await caches.open('v1');
        await cache.add(evt.request).catch(_ => _);
        const response = await caches.match(evt.request);
        accept(response || new Response("No network and no cache for " + evt.request.url, { status: 404 }));
    }));
});