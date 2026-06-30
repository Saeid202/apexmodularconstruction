# Requirements Document

## Introduction

Apex Modular Construction needs a Progressive Web App (PWA) layer added to the existing Next.js 16 / TypeScript / Tailwind CSS / Supabase platform. The goal is to let any visitor — authenticated or not — install Apex Modular Construction as a standalone app on their device, receive push notifications for key business events, and continue browsing cached content when offline.

The implementation is PWA-only (no native app-store wrapper). It covers six areas: a production-ready Web App Manifest, PNG icon generation from the existing `logo.svg`, a service worker for offline caching and push delivery, an `InstallButton` component embedded in the public header, a `push_subscriptions` Supabase table with a server action to persist Web Push subscriptions, and push notification dispatch hooks wired into three existing server actions (agent response, order status update, consolidation message).

---

## Glossary

- **PWA**: Progressive Web App — a web application that can be installed on a device and run in a standalone window.
- **Manifest**: The `manifest.json` file at the site root that describes the app to the browser (name, icons, theme colour, display mode).
- **Service_Worker**: The `sw.js` script registered at the root scope that intercepts network requests for offline caching and handles incoming push events.
- **Install_Prompt**: The browser-native `BeforeInstallPromptEvent` that signals the PWA install criteria are met and allows the app to defer and trigger the install dialog.
- **InstallButton**: The React client component rendered in the public `Header` that surfaces the install prompt to the visitor.
- **iOS_Tooltip**: The fallback UI shown on iOS Safari (which does not fire `BeforeInstallPromptEvent`) instructing the visitor to use the Share → Add to Home Screen flow.
- **Push_Subscription**: A `PushSubscription` object (endpoint + keys) created by the browser after the visitor grants notification permission; stored in the `push_subscriptions` Supabase table.
- **VAPID**: Voluntary Application Server Identification — the public/private key pair used to authenticate push messages sent from the Apex Modular Construction server to the browser push service.
- **Notification_Trigger**: A point in an existing server action where a push notification is dispatched to all relevant subscribers.
- **Maskable_Icon**: A PWA icon with safe-zone padding that allows the OS to apply its own shape mask (circle, squircle, etc.) without clipping the logo.
- **Offline_Cache**: The set of static assets and pages pre-cached by the Service_Worker so the app remains usable without a network connection.
- **Splash_Screen**: The loading screen shown by the OS when the PWA launches in standalone mode, composed from the manifest `background_color`, `theme_color`, and app icon.

---

## Requirements

---

### Requirement 1: Web App Manifest

**User Story:** As a visitor, I want the browser to recognise Apex Modular Construction as an installable PWA, so that I can add it to my home screen and launch it like a native app.

#### Acceptance Criteria

1. THE Manifest SHALL be served at `/manifest.json` with `Content-Type: application/manifest+json`.
2. THE Manifest SHALL set `"name"` to `"Apex Modular Construction"` and `"short_name"` to `"Apex Modular Construction"`.
3. THE Manifest SHALL set `"theme_color"` to `"#4B1D8F"` and `"background_color"` to `"#4B1D8F"`.
4. THE Manifest SHALL set `"display"` to `"standalone"` and `"start_url"` to `"/"`.
5. THE Manifest SHALL declare three icon entries: a 192×192 PNG (`/icons/icon-192.png`), a 512×512 PNG (`/icons/icon-512.png`), and a 512×512 maskable PNG (`/icons/icon-maskable.png`) with `"purpose": "maskable"`.
6. THE Manifest SHALL set `"description"` to `"Construction materials & robots marketplace"`.
7. WHEN the browser evaluates the Manifest, THE PWA SHALL pass Chrome's installability checklist (valid `start_url`, HTTPS, at least one icon ≥ 192×192, `display` not `"browser"`).

---

### Requirement 2: PNG Icon Generation

**User Story:** As a developer, I want PNG icons derived from the existing `logo.svg`, so that the installed PWA displays the Apex Modular Construction brand on the device home screen and splash screen.

#### Acceptance Criteria

1. THE Build_Process SHALL generate `/public/icons/icon-192.png` at exactly 192×192 pixels from `public/logo.svg`.
2. THE Build_Process SHALL generate `/public/icons/icon-512.png` at exactly 512×512 pixels from `public/logo.svg`.
3. THE Build_Process SHALL generate `/public/icons/icon-maskable.png` at exactly 512×512 pixels from `public/logo.svg` with the logo scaled to occupy no more than 80% of the canvas (safe-zone padding), centred on a `#4B1D8F` background.
4. THE `<head>` element in `app/layout.tsx` SHALL reference `/icons/icon-192.png` as the `apple-touch-icon` so iOS Safari uses the Apex Modular Construction icon when the visitor adds the page to their home screen.
5. WHEN the PWA launches in standalone mode on Android or iOS, THE Splash_Screen SHALL display the Apex Modular Construction logo centred on a `#4B1D8F` background on both mobile and desktop viewports.

---

### Requirement 3: Service Worker — Offline Caching

**User Story:** As a visitor, I want to browse previously visited Apex Modular Construction pages when I have no internet connection, so that I can still access product information and my account pages offline.

#### Acceptance Criteria

1. THE Service_Worker SHALL be registered from a client component mounted in `app/layout.tsx` using `navigator.serviceWorker.register('/sw.js')`.
2. WHEN the Service_Worker installs, THE Service_Worker SHALL pre-cache the following static assets: `/`, `/products`, `/manifest.json`, `/icons/icon-192.png`, `/icons/icon-512.png`, and the root CSS and JS bundles emitted by Next.js.
3. WHEN a network request for a pre-cached asset fails due to no connectivity, THE Service_Worker SHALL serve the cached version of that asset.
4. WHEN a network request for a non-cached route fails due to no connectivity, THE Service_Worker SHALL serve a cached offline fallback page (`/offline`) that displays the Apex Modular Construction logo and a "You are offline" message.
5. WHEN the Service_Worker activates a new version, THE Service_Worker SHALL delete all caches from previous versions to prevent stale asset delivery.
6. THE Service_Worker SHALL use a cache-first strategy for static assets (JS, CSS, images) and a network-first strategy for HTML navigation requests.

---

### Requirement 4: Service Worker — Push Notification Handling

**User Story:** As a visitor who has granted notification permission, I want to receive push notifications from Apex Modular Construction, so that I am immediately informed of quote updates, order changes, and new messages.

#### Acceptance Criteria

1. WHEN the Service_Worker receives a `push` event, THE Service_Worker SHALL parse the event data as JSON and call `self.registration.showNotification` with the `title`, `body`, `icon`, and `data.url` fields from the payload.
2. THE Service_Worker SHALL use `/icons/icon-192.png` as the default notification icon when no `icon` field is present in the push payload.
3. WHEN the visitor clicks a displayed notification, THE Service_Worker SHALL handle the `notificationclick` event by opening or focusing the URL specified in `notification.data.url`.
4. IF the push event data cannot be parsed as valid JSON, THEN THE Service_Worker SHALL show a generic notification with title `"Apex Modular Construction"` and body `"You have a new update"` rather than silently failing.
5. THE Service_Worker SHALL call `event.waitUntil` on both the `push` and `notificationclick` handlers to prevent the browser from terminating the worker before the operations complete.

---

### Requirement 5: InstallButton Component

**User Story:** As a visitor, I want to see an "Install App" button in the header, so that I can install Apex Modular Construction on my device with a single tap.

#### Acceptance Criteria

1. THE InstallButton SHALL be rendered in the public `Header` component in the right-side action area, visible to all visitors regardless of authentication state.
2. WHEN the browser fires the `beforeinstallprompt` event, THE InstallButton SHALL become visible and store the deferred prompt.
3. WHEN the visitor clicks the InstallButton, THE InstallButton SHALL call `prompt()` on the stored `BeforeInstallPromptEvent` to trigger the native install dialog.
4. WHEN the browser fires the `appinstalled` event, THE InstallButton SHALL hide itself so it is no longer shown to users who have already installed the app.
5. WHEN the browser fires `beforeinstallprompt` again (indicating the user has uninstalled the app), THE InstallButton SHALL become visible again automatically.
6. WHILE the PWA is running in `standalone` display mode (i.e. already installed and launched as an app), THE InstallButton SHALL remain hidden.
7. THE InstallButton SHALL be implemented as a `"use client"` component and SHALL NOT cause a hydration mismatch by rendering differently on server and client.

---

### Requirement 6: iOS Safari Install Tooltip

**User Story:** As an iOS Safari visitor, I want to see instructions for adding Apex Modular Construction to my home screen, so that I can install the PWA even though iOS does not support the standard install prompt.

#### Acceptance Criteria

1. WHEN the visitor's browser is identified as iOS Safari (user-agent contains `iPhone` or `iPad` and does not contain `CriOS` or `FxiOS`), THE InstallButton SHALL render an iOS-specific install trigger instead of the standard install button.
2. WHEN the iOS visitor taps the iOS install trigger, THE InstallButton SHALL display a tooltip or popover containing the instruction: "Tap the Share button (⎋) then select 'Add to Home Screen'".
3. WHILE the PWA is running in `standalone` display mode on iOS, THE InstallButton SHALL remain hidden.
4. THE iOS_Tooltip SHALL be dismissible by tapping outside it or pressing a close button.
5. THE iOS_Tooltip SHALL be positioned so it does not overflow the viewport on small screens (320px width minimum).

---

### Requirement 7: Push Subscription Storage

**User Story:** As a developer, I want push subscriptions stored in Supabase, so that the server can send targeted push notifications to subscribed users.

#### Acceptance Criteria

1. THE Database SHALL contain a `push_subscriptions` table with columns: `id` (uuid, primary key, default `gen_random_uuid()`), `user_id` (uuid, nullable, foreign key referencing `auth.users(id)` on delete cascade), `endpoint` (text, not null, unique), `p256dh` (text, not null), `auth` (text, not null), `created_at` (timestamptz, not null, default `now()`).
2. THE Database SHALL enable Row Level Security on `push_subscriptions` such that authenticated users can INSERT and DELETE only their own rows (`user_id = auth.uid()`).
3. THE Database SHALL allow unauthenticated INSERT into `push_subscriptions` so that visitors who are not logged in can still subscribe to push notifications (with `user_id` set to `null`).
4. THE `savePushSubscription` server action SHALL accept a serialised `PushSubscription` object, extract `endpoint`, `keys.p256dh`, and `keys.auth`, and upsert a row into `push_subscriptions` using `endpoint` as the conflict key.
5. WHEN the `savePushSubscription` server action is called with a subscription whose `endpoint` already exists in the table, THE server action SHALL update the `p256dh` and `auth` values rather than inserting a duplicate row.
6. THE `savePushSubscription` server action SHALL be called from the client after the visitor grants notification permission via `Notification.requestPermission()`.

---

### Requirement 8: Push Notification Permission Request

**User Story:** As a visitor, I want to be asked for notification permission at an appropriate moment, so that I can opt in to push notifications without being interrupted immediately on page load.

#### Acceptance Criteria

1. THE InstallButton SHALL include a "Enable Notifications" secondary action that calls `Notification.requestPermission()` when clicked.
2. WHEN `Notification.requestPermission()` resolves to `"granted"`, THE InstallButton SHALL call `navigator.serviceWorker.ready` to obtain the active service worker registration, subscribe using `pushManager.subscribe` with the VAPID public key, and invoke the `savePushSubscription` server action with the resulting subscription.
3. WHEN `Notification.requestPermission()` resolves to `"denied"` or `"default"`, THE InstallButton SHALL silently suppress the subscription flow without displaying an error to the visitor.
4. IF `pushManager.subscribe` throws an error, THEN THE InstallButton SHALL log the error to the console and SHALL NOT display an error to the visitor.
5. THE VAPID public key SHALL be read from the `NEXT_PUBLIC_VAPID_PUBLIC_KEY` environment variable.

---

### Requirement 9: Push Notification Triggers

**User Story:** As a subscribed visitor, I want to receive a push notification when my quote is ready, my order status changes, or an agent sends me a new consolidation message, so that I can respond promptly without polling the site.

#### Acceptance Criteria

1. WHEN the `submitAgentResponse` server action in `app/actions/agent.ts` completes successfully, THE Notification_Trigger SHALL query `push_subscriptions` for all rows where `user_id` matches the order's `user_id` and dispatch a push notification with title `"Quote Ready"` and body `"Your consolidation order quote is ready. Tap to view."` and `data.url` set to `/account/consolidation`.
2. WHEN the `updateOrderStatus` server action in `app/actions/agent.ts` completes successfully, THE Notification_Trigger SHALL query `push_subscriptions` for all rows where `user_id` matches the order's `user_id` and dispatch a push notification with title `"Order Update"` and body `"Your order status has been updated. Tap to view."` and `data.url` set to `/account/consolidation`.
3. WHEN the `sendAgentMessage` server action in `app/actions/agent.ts` completes successfully, THE Notification_Trigger SHALL query `push_subscriptions` for all rows where `user_id` matches the order's `user_id` and dispatch a push notification with title `"New Message"` and body `"Your agent has sent you a new message. Tap to view."` and `data.url` set to `/account/consolidation`.
4. THE Notification_Trigger SHALL use the `web-push` Node.js library with the VAPID private key (`VAPID_PRIVATE_KEY` env var) and public key (`NEXT_PUBLIC_VAPID_PUBLIC_KEY` env var) to sign and send each push message.
5. IF a push delivery fails with HTTP 410 (Gone) or HTTP 404 (Not Found), THEN THE Notification_Trigger SHALL delete the corresponding row from `push_subscriptions` to remove the stale subscription.
6. THE Notification_Trigger SHALL dispatch push messages to all matching subscriptions concurrently using `Promise.allSettled` so that a single failed delivery does not block the others.
7. THE Notification_Trigger SHALL NOT block the server action response — push dispatch SHALL be fire-and-forget (awaited after the action returns its result to the client).

---

### Requirement 10: Supabase Migration

**User Story:** As a developer, I want a versioned Supabase migration file for the `push_subscriptions` table, so that the schema change is tracked in source control and can be applied consistently across environments.

#### Acceptance Criteria

1. THE Migration SHALL be created as `supabase/migrations/015_push_subscriptions.sql` following the existing migration naming convention.
2. THE Migration SHALL use `CREATE TABLE IF NOT EXISTS` to create the `push_subscriptions` table with all columns defined in Requirement 7.
3. THE Migration SHALL create an index on `push_subscriptions(user_id)` to support efficient lookup of subscriptions by user.
4. THE Migration SHALL enable RLS on `push_subscriptions` and define the policies described in Requirement 7 acceptance criteria 2 and 3.
5. THE Migration SHALL be idempotent — running it twice SHALL NOT produce an error.
