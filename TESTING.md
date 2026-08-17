# Testing the architect Page Builder & Custom Domains

This guide walks through the two features added for the **architect** role:

1. **Page Builder** — compose a public studio page from pre-built blocks (Hero / Text / Gallery / CTA).
2. **Custom domains** — connect your own domain (Shopify-style), with a live **Verify connection** DNS check.

Both are UI/data-only: everything is stored in the existing `branding` JSON column via the existing
`updateArchitectProfile` action. No schema change, no new backend write path.

---

## Prerequisites

```bash
npm install
# .env.local must contain the Supabase keys:
#   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm run dev            # serves on http://localhost:3000
```

No real architect account is required — the login form has a built-in **dev bypass**
(`app/architect/(auth)/login/ArchitectLoginForm.tsx`): any email + password **`admin123`**.

---

## A) Page Builder + Domains UI

1. Open <http://localhost:3000/architect/login> and log in with any email + password `admin123`.
2. Sidebar → **Page Builder**: add **Hero / Text / Gallery / CTA** blocks, edit their fields,
   reorder with the up/down controls, watch the live preview, then **Save**.
3. Sidebar → **Domains**:
   - See the free built-in address (`<subdomain>.apex.com`).
   - Type a domain (e.g. `myfirm.test`) and **Save** → the Shopify-style DNS records appear.
   - Click **Verify connection**. A domain you don't actually control correctly reports
     **"Not detected yet"** — that is the live DNS check working, not a bug. A green **Connected**
     only appears once a real domain's DNS points at the app.

---

## B) Watch a custom domain route to a studio (locally)

A demo studio is pre-seeded in `scratch/dev_architect_profiles.json` under the domain **`myfirm.test`**,
with a full Hero → Gallery → Text → CTA layout.

1. Map the demo domain to localhost:

   ```bash
   echo '127.0.0.1 myfirm.test' | sudo tee -a /etc/hosts
   ```

2. Open <http://myfirm.test:3000>.

   The request flows: **middleware custom-domain rewrite → `/studio/domain/[host]` →
   `getArchitectProfileByCustomDomain` → `ArchitectStudioView`**, rendering the studio and its
   Page Builder blocks. (`:3000` is only because it's local; production would be `443`.)

3. Cleanup when done:

   ```bash
   sudo sed -i '' '/myfirm.test/d' /etc/hosts
   ```

> Prefer to create your own instead of using the seed? Log in (step A), open **Domains**, save
> `myfirm.test` — this indexes your dev profile by that domain — then do steps B1–B2.

---

## C) No-browser smoke test (fastest — no `/etc/hosts` edit)

The `Host` header exercises the exact routing path a real custom domain would:

```bash
# Custom domain -> studio (served by the custom-domain route)
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: myfirm.test' http://localhost:3000/          # 200

# Existing subdomain routing still works
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: demo-studio.apex.com' http://localhost:3000/ # 200

# Unknown custom domain -> resolver reached, no owner -> 404 (expected)
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: nobody-owns-this.example' http://localhost:3000/ # 404
```

To confirm the demo actually renders its blocks:

```bash
curl -s -H 'Host: myfirm.test' http://localhost:3000/ | grep -o 'Selected Work'   # gallery heading
```

---

## Type check

```bash
npx tsc --noEmit    # expected: 0 errors
```

---

## Caveat — the one infra step

The code resolves and renders a custom domain the moment DNS points at the app, but **DNS + TLS/SSL
provisioning is a platform infra step** (adding the domain to the host, issuing the certificate),
performed once per domain. Shopify automates this behind the scenes; here it is a manual platform
action. The Domains UI states this so architects aren't surprised.
