// ==============================
// SERVICE WORKER — CURRÍCULO PWA
// ==============================

// versão do cache (mude quando atualizar o site)
const CACHE_NAME = "marco-cv-v1";

// arquivos essenciais para offline
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./foto-marco.jpg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// ------------------------------
// INSTALL — salva no cache
// ------------------------------
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

// ------------------------------
// ACTIVATE — limpa caches antigos
// ------------------------------
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ------------------------------
// FETCH — offline-first
// ------------------------------
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request)
          .then(netRes => {
            // salva novos recursos
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, netRes.clone());
              return netRes;
            });
          })
          .catch(() => {
            // fallback offline
            if (event.request.mode === "navigate") {
              return caches.match("./offline.html");
            }
          })
      );
    })
  );
});
