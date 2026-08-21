# Implementation Plan: PWA Install

## Overview

Add a full PWA layer to the Next.js 16 / TypeScript / Tailwind / Supabase platform: manifest, icons, service worker, install UI, push subscription storage, and push notification dispatch wired into three existing server actions.

## Tasks

- [x] 1. Install dependencies and set up environment variables
  - Run `npm install --save-dev sharp tsx` to add icon generation tooling
  - Run `npm install web-push` and `npm install --save-dev @types/web-push` for push dispatch
  - Run `npm install --save-dev fast-check` for property-based tests
  - Add `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` to `.env.local` (generate once with `npx web-push generate-vapid-keys`)
  - Add both variables to `.env.example` with placeholder values and a comment explaining how to generate them
  - _Requirements: 8.5, 9.4_

- [x] 2. Generate PNG icons from logo.svg
  - [x] 2.1 Create `scripts/generate-icons.ts`
    - Use `sharp` to produce `public/icons/icon-192.png` (192×192), `public/icons/icon-512.png` (512×512), and `public/icons/icon-maskable.png` (512×512, logo at 80% centred on `#4B1D8F` background)
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.2 Run the script and commit the generated icons
    - Execute `npx tsx scripts/generate-icons.ts` and verify the three files exist in `public/icons/`
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Create `public/manifest.json`
  - Write the static manifest with `name`, `short_name`, `description`, `start_url`, `display`, `theme_color`, `background_color`, and the three icon entries
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 4. Create `public/offline.html`
  - Write a minimal HTML page showing the Apex Modular Construction logo and a "You are offline" message, styled with inline CSS using the brand colour `#4B1D8F`
  - _Requirements: 3.4_

- [x] 5. Create `public/sw.js` — Service Worker
  - [x] 5.1 Implement install, activate, and fetch handlers
    - Versioned cache names (`cargoplus-static-v1`, `cargoplus-html-v1`)
    - Install: pre-cache `/`, `/products`, `/manifest.json`, `/icons/icon-192.png`, `/icons/icon-512.png`, `/offline.html`; call `self.skipWaiting()`
    - Activate: delete caches not in `KNOWN_CACHES`; call `self.clients.claim()`
    - Fetch: cache-first for static assets (`.js`, `.css`, `.png`, `.jpg`, `.svg`, `.ico`, `.woff2`); network-first for HTML navigation with `/offline.html` fallback; ignore cross-origin requests
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_
  - [x] 5.2 Implement push and notificationclick handlers
    - Push: parse event data as JSON, fall back to generic title/body on parse failure, call `self.registration.showNotification` with `title`, `body`, `icon` (default `/icons/icon-192.png`), `data`; wrap in `event.waitUntil`
    - Notificationclick: close notification, focus existing window at `data.url` or call `clients.openWindow`; wrap in `event.waitUntil`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ]* 5.3 Write property test for cache-first strategy (Property 1)
    - **Property 1: Cache-first strategy for static assets**
    - Generate random static asset pathnames, populate mock cache, simulate network failure, assert cached response returned
    - **Validates: Requirements 3.3, 3.6**
  - [ ]* 5.4 Write property test for network-first HTML fallback (Property 2)
    - **Property 2: Network-first fallback for HTML navigation**
    - Generate random navigation URLs not in cache, simulate network failure, assert `/offline.html` returned
    - **Validates: Requirements 3.4, 3.6**
  - [ ]* 5.5 Write property test for push payload round-trip (Property 3)
    - **Property 3: Push notification payload round-trip**
    - Generate random `{ title, body, icon, data: { url } }` objects including missing-icon variants and invalid JSON strings, assert `showNotification` called with correct args
    - **Validates: Requirements 4.1, 4.2, 4.4**
  - [ ]* 5.6 Write property test for notification click URL (Property 4)
    - **Property 4: Notification click opens correct URL**
    - Generate random URL strings, assert `clients.openWindow` called with exact URL
    - **Validates: Requirements 4.3**

- [x] 6. Create `components/pwa/ServiceWorkerRegistrar.tsx`
  - `"use client"` component; register `/sw.js` via `navigator.serviceWorker.register` inside `useEffect`; return `null`
  - _Requirements: 3.1_

- [x] 7. Create `components/pwa/InstallButton.tsx`
  - [x] 7.1 Implement core install prompt logic
    - `"use client"` component with `mounted` flag to prevent hydration mismatch
    - Listen for `beforeinstallprompt` (store deferred prompt, show button) and `appinstalled` (hide button) events
    - Detect standalone mode via `window.matchMedia('(display-mode: standalone)')` — hide button when true
    - Clicking the install button calls `prompt()` on the deferred event
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  - [x] 7.2 Implement iOS Safari tooltip
    - Detect iOS Safari: UA contains `iPhone` or `iPad` and does not contain `CriOS` or `FxiOS`
    - Show iOS-specific trigger; tapping it toggles a tooltip with the Share → Add to Home Screen instruction
    - Tooltip dismissible by clicking outside or a close button; constrained to viewport (min 320px)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [x] 7.3 Implement "Enable Notifications" flow
    - "Enable Notifications" button calls `Notification.requestPermission()`
    - On `"granted"`: get `navigator.serviceWorker.ready`, call `pushManager.subscribe` with `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (converted via `urlBase64ToUint8Array`), invoke `savePushSubscription` server action
    - On `"denied"` or `"default"`: silently suppress; on `pushManager.subscribe` error: `console.error` only
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ]* 7.4 Write property test for InstallButton visibility (Property 5)
    - **Property 5: InstallButton visibility tracks prompt availability**
    - Generate random event sequences of `beforeinstallprompt` / `appinstalled`, assert visibility state matches expected
    - **Validates: Requirements 5.2, 5.4, 5.5, 5.6**
  - [ ]* 7.5 Write property test for iOS detection (Property 6)
    - **Property 6: iOS Safari detection is exhaustive**
    - Generate random UA strings with/without `iPhone`/`iPad`/`CriOS`/`FxiOS` tokens, assert `isIOS` returns correct boolean
    - **Validates: Requirements 6.1**
  - [ ]* 7.6 Write property test for notification permission gate (Property 10)
    - **Property 10: Notification permission gate**
    - Generate `"denied"` and `"default"` permission results, assert `savePushSubscription` never called
    - **Validates: Requirements 8.2, 8.3**

- [ ] 8. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Create Supabase migration `supabase/migrations/015_push_subscriptions.sql`
  - `CREATE TABLE IF NOT EXISTS push_subscriptions` with all columns from the data model (`id`, `user_id`, `endpoint`, `p256dh`, `auth`, `created_at`)
  - Create index `idx_push_subscriptions_user_id` on `(user_id)`
  - Enable RLS; add policy for authenticated users to INSERT/DELETE own rows; add policy for anonymous INSERT with `user_id = null`
  - Use `IF NOT EXISTS` / `DO $$ ... IF NOT EXISTS` guards throughout for idempotency
  - _Requirements: 7.1, 7.2, 7.3, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 10. Create `app/actions/push.ts` — `savePushSubscription` server action
  - `"use server"`; accept `{ endpoint, keys: { p256dh, auth } }`; get current user from `createServerClient`; upsert into `push_subscriptions` via admin client with `onConflict: 'endpoint'`; return `{ error: string | null }`
  - _Requirements: 7.4, 7.5, 7.6_
  - [ ]* 10.1 Write property test for savePushSubscription upsert (Property 7)
    - **Property 7: savePushSubscription upsert correctness**
    - Generate random subscription objects, call action twice with same endpoint, assert single row with latest values
    - **Validates: Requirements 7.4, 7.5**

- [x] 11. Create `lib/push/sendPushNotification.ts`
  - Import `web-push`; call `webpush.setVapidDetails` with `mailto:admin@cargoplus.ca` and both env vars
  - Export `sendPushNotification(userId, payload)`: query `push_subscriptions` by `user_id`, call `webpush.sendNotification` for each via `Promise.allSettled`, delete rows that return 410 or 404
  - _Requirements: 9.4, 9.5, 9.6, 9.7_
  - [ ]* 11.1 Write property test for push dispatch coverage (Property 9)
    - **Property 9: Push dispatch covers all subscriptions**
    - Generate random arrays of subscriptions (some returning 410/404), assert `sendNotification` call count equals array length and stale rows deleted
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.5, 9.6**

- [x] 12. Wire push notifications into `app/actions/agent.ts`
  - [x] 12.1 Add push trigger to `submitAgentResponse`
    - After `revalidatePath`, fire-and-forget: `void sendPushNotification(order.user_id, { title: 'Quote Ready', body: '...', data: { url: '/account/consolidation' } })`
    - _Requirements: 9.1_
  - [x] 12.2 Add push trigger to `updateOrderStatus`
    - Fetch `user_id` from `consolidation_orders WHERE id = orderId` if not already available, then fire-and-forget push with title `"Order Update"`
    - _Requirements: 9.2_
  - [x] 12.3 Add push trigger to `sendAgentMessage`
    - Fetch `user_id` from `consolidation_orders WHERE id = orderId` if not already available, then fire-and-forget push with title `"New Message"`
    - _Requirements: 9.3_

- [x] 13. Update `app/layout.tsx`
  - Add `manifest: '/manifest.json'` and `apple: '/icons/icon-192.png'` to the Next.js metadata `icons` config
  - Mount `<ServiceWorkerRegistrar />` inside `<body>` (after reading the Next.js 16 layout API from `node_modules/next/dist/docs/`)
  - _Requirements: 1.1, 2.4, 3.1_

- [x] 14. Mount `InstallButton` in the public `Header`
  - Import and render `<InstallButton />` in the right-side action area of the public header component, visible to all visitors
  - _Requirements: 5.1_

- [x] 15. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Run `npx tsx scripts/generate-icons.ts` once before first deploy to generate the icon files
- Generate VAPID keys once with `npx web-push generate-vapid-keys` and add to `.env.local` and production env
- `sw.js` is plain JS (not TypeScript, not bundled) — it must be served statically from `public/`
- Property tests use `fast-check`; each runs a minimum of 100 iterations
- Push dispatch in agent.ts is fire-and-forget (`void`) — it must not block the server action response
