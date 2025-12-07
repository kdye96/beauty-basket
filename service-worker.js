self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("beauty-basket-cache").then((cache) => {
      return cache.addAll([
        "/beauty-basket/",
        "/beauty-basket/index.html"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
