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

/// Tries to cache a request, and times out after 500ms
function try_cache(request) {
    return new Promise(async accept => {
        const timeout = setTimeout(accept, 500);
        try {
            const cache = await caches.open('v1');
            await cache.add(request);
        } catch (e) {
            console.error("Failed to query " + request.url, e);
        } finally {
            clearTimeout(timeout);
            accept();
        }
    });
}

self.addEventListener('fetch', (evt) => {
    evt.respondWith(new Promise(async (accept) => {
        await try_cache(evt.request);
        const response = await caches.match(evt.request);
        accept(response || new Response("No network and no cache for " + evt.request.url, { status: 404 }));
    }));
});