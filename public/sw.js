const CACHE_VERSION = 'v2';
const STATIC_CACHE = `apexmodularconstruction-static-${CACHE_VERSION}`;
const HTML_CACHE = `apexmodularconstruction-html-${CACHE_VERSION}`;
const KNOWN_CACHES = [STATIC_CACHE, HTML_CACHE];

const PRECACHE_URLS = [
  '/',
  '/products',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/offline.html',
];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => !KNOWN_CACHES.includes(k)).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === 'navigate';
  const isStatic = /\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/.test(url.pathname);

  if (isNavigation) {
    // Network-first for HTML navigation
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(HTML_CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached ?? caches.match('/offline.html'))
        )
    );
  } else if (isStatic) {
    // Network-first for JS/CSS so code changes are always picked up
    // Falls back to cache only when offline
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
  }
});

// ── Push ──────────────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Apex Modular Construction',
    body: 'You have a new update',
    icon: '/icons/icon-192.png',
    data: { url: '/' },
  };

  try {
    const parsed = event.data?.json();
    payload = {
      ...payload,
      ...parsed,
      icon: parsed?.icon ?? '/icons/icon-192.png',
    };
  } catch (_) {
    // Use defaults on parse failure
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: '/icons/icon-192.png',
      data: payload.data,
    })
  );
});

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        const existing = windowClients.find((c) => c.url === url && 'focus' in c);
        if (existing) return existing.focus();
        return clients.openWindow(url);
      })
  );
});
