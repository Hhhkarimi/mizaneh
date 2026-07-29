// Minimal service worker for Mizaneh's offline/PWA support (round 2).
//
// Strategy: network-first with cache fallback. This app is entirely
// client-side (no backend), so there is no API data to go stale — the
// only goal here is "the calculator still loads if the network is slow
// or absent, after at least one successful online visit." Network-first
// (rather than precaching every hashed build asset) was chosen so a
// fresh deploy is never masked by a stale cached bundle while online;
// the cache is purely a fallback for when the network fetch fails.

const CACHE_NAME = "mizaneh-shell-v1";
const APP_SHELL = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {
        // Precaching the shell is best-effort; a failure here shouldn't
        // block installation (per-request caching in "fetch" still works).
      }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(request, copy))
          .catch(() => {});
        return response;
      })
      .catch(
        () =>
          caches
            .match(request)
            .then((cached) => cached || caches.match("/"))
            // If even the app-shell fallback isn't cached yet (first-ever
            // offline attempt before any successful online visit), let the
            // original network error propagate instead of hiding it.
            .then((cached) => cached ?? Promise.reject(new Error("offline, no cache"))),
      ),
  );
});
