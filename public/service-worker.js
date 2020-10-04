const CACHE = 'v2';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => {
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

function timeout(promise, ms) {
    return new Promise(async (accept, reject) => {
        const t = setTimeout(reject, ms, new Error("timeout"));
        await promise.then(accept).catch(reject);
        clearTimeout(t);
    });
}

function onSuccess(evt) {
    return async (response) => {
        console.log(`Adding ${evt.request.url} to cache ${CACHE}`)
        const cache = await caches.open(CACHE);
        await cache.delete(evt.request);
        await cache.put(evt.request, response.clone());
        return response.clone();
    }
}

function onError(evt) {
    return async (err) => {
        console.error(`Serving ${evt.request.url} from cache ${CACHE} because request returned ${err}`);
        const response = await caches.match(evt.request, { cacheName: CACHE });
        return response || new Response(err);
    }
}

self.addEventListener('fetch', (evt) => {
    evt.respondWith(
        timeout(fetch(evt.request).then(onSuccess(evt)), 500)
            .catch(onError(evt)));
});