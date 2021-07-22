const STATIC_CACHE = "static-cache-v1";
const DATA_CACHE = "data-cache-v1";

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/indexedDB.js",
    "/index.js",
    "/favicon.ico",
    "/manifest.webmanifest",
    "/styles.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "/icons/budget64.png",
    "/icons/budget128.png",
    "/icons/budget256.png",
    "/icons/budget512.png",
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) => cache.addAll(FILES_TO_CACHE))
            .then(self.skipWaiting())
    );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", (event) => {
    const currentCaches = [STATIC_CACHE, DATA_CACHE];
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return cacheNames.filter(
                    (cacheName) => !currentCaches.includes(cacheName)
                );
            })
            .then((cachesToDelete) => {
                return Promise.all(
                    cachesToDelete.map((cacheToDelete) => {
                        return caches.delete(cacheToDelete);
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener("fetch", (event) => {
    // Skip cross-origin requests, like those for Google Analytics.
    if (event.request.url.includes("/api/") && event.request.method === "GET") {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return caches.open(DATA_CACHE).then((cache) => {
                    return fetch(event.request).then((response) => {
                        // Put a copy of the response in the runtime cache.
                        if (response.status === 200) {
                            cache.put(event.request.url, response.clone());
                        }
                        return response;
                    });
                });
            })
        );
        location.reload(true);
    } else {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return caches.open(STATIC_CACHE).then((cache) => {
                    return fetch(event.request).then((response) => {
                        // Put a copy of the response in the runtime cache.
                        return response;
                    });
                });
            })
        );
    }
});