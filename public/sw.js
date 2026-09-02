const CACHE_NAME = 'liftlog-v3';
const PAGE_PATHS = ['', 'record/', 'history/', 'analysis/', 'exercises/', 'settings/'];

const scopedUrl = (path) => new URL(path, self.registration.scope).toString();

const cachePageAndAssets = async (cache, path) => {
  try {
    const pageUrl = scopedUrl(path);
    const response = await fetch(pageUrl, { cache: 'no-cache' });
    if (!response.ok) return;
    await cache.put(pageUrl, response.clone());
    const html = await response.text();
    const assetUrls = Array.from(html.matchAll(/(?:src|href)=["']([^"']+)["']/g), (match) => match[1])
      .filter((url) => url.includes('/_next/static/'))
      .map((url) => new URL(url, pageUrl).toString());
    await Promise.all(assetUrls.map(async (url) => {
      try {
        const asset = await fetch(url);
        if (asset.ok) await cache.put(url, asset);
      } catch {
        // A single optional asset must not block installation.
      }
    }));
  } catch {
    // Installation can finish even when the network is temporarily unavailable.
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(PAGE_PATHS.map((path) => cachePageAndAssets(cache, path)));
    await Promise.all(['manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png'].map(async (path) => {
      try {
        await cache.add(scopedUrl(path));
      } catch {
        // Optional install assets can be retried by the runtime cache.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
        return response;
      } catch {
        return (await caches.match(request)) ?? (await caches.match(scopedUrl('')));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
