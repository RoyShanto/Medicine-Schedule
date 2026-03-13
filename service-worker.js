const CACHE_PREFIX = "Medicine-Schedule-cache-";
const VERSION = "v2";

const CACHE_NAME = CACHE_PREFIX + VERSION;

const urlsToCache = [
  "/Medicine-Schedule/",
  "/Medicine-Schedule/index.html",
  "/Medicine-Schedule/medicines.js",
  "/Medicine-Schedule/output.css",
  "/Medicine-Schedule/favicon.png",
  "/Medicine-Schedule/manifest.json"
];


// INSTALL
self.addEventListener("install", (event) => {

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );

});


// ACTIVATE
self.addEventListener("activate", (event) => {

  event.waitUntil(
    caches.keys().then((keys) => {

      return Promise.all(
        keys.map((key) => {

          // delete only this project's old caches
          if (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME) {
            return caches.delete(key);
          }

        })
      );

    })
  );

  self.clients.claim();

});


// FETCH
self.addEventListener("fetch", (event) => {

  // NETWORK FIRST for HTML
  if (event.request.mode === "navigate") {

    event.respondWith(
      fetch(event.request)
        .then((response) => {

          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;

        })
        .catch(() => {
          return caches.match(event.request);
        })
    );

    return;
  }


  // CACHE FIRST for assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {

        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {

          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;

        });

      })
  );

});