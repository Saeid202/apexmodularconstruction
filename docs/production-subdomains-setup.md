# Production setup: architect studio subdomains (Vercel)

This is a hand-off runbook for whoever has access to the **Vercel project** and the
**Namecheap** account for `apexmodularconstruction.com`.

## What this enables

Every architect studio is served on its own subdomain, Shopify-style:

```
sarah-designs.apexmodularconstruction.com   ->  Sarah's studio
<any-architect>.apexmodularconstruction.com ->  that architect's studio
```

The **application code already handles this** (merged separately — it rewrites any
studio subdomain to the right studio). The only remaining work is **DNS + TLS**, which
lives in Vercel / Namecheap, not in the codebase. Until the steps below are done, a
subdomain like `sarah-designs.apexmodularconstruction.com` does not resolve and returns
a browser/DNS error.

## Current state (verified)

- **Host:** Vercel. Apex `apexmodularconstruction.com` already points at Vercel
  (`A 216.198.79.1`). The website works today.
- **DNS registrar/manager:** Namecheap (nameservers `dns1.registrar-servers.com`,
  `dns2.registrar-servers.com`).
- **Email:** Zoho. These records exist and **must keep working**:
  | Type | Host | Value | Priority |
  |------|------|-------|----------|
  | MX | `@` | `mx.zohocloud.ca` | 10 |
  | MX | `@` | `mx2.zohocloud.ca` | 20 |
  | MX | `@` | `mx3.zohocloud.ca` | 50 |
  | TXT | `@` | `v=spf1 include:zohocloud.ca ~all` | — |
  | TXT | `zmail._domainkey` | `v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCrFnaFryyG2XMTPPcb3z/vorgpyPkgyevnsdQ0SpAqtFvVkHx3wzlh4ddXsff8wgQqaZ4GqlpwA1vvaB+jVnBC/UdmJ60xye3+n0cT8ft2uuCCI2oQcjUV23D6CmLr0xwIyssl1la9glXg35DfILAtsHU+hjjnB/JOkyswvHCR8QIDAQAB` | — |

- No subdomain and no wildcard DNS record exists yet — **this is the blocker.**

---

## Recommended path — Delegate DNS to Vercel (true wildcard + auto HTTPS)

This gives a single `*.apexmodularconstruction.com` wildcard certificate, so **every**
architect subdomain works instantly with HTTPS and needs no per-subdomain setup ever.
It requires moving nameservers to Vercel. **Email stays working IF you mirror the Zoho
records into Vercel BEFORE switching nameservers** — that ordering is the whole game.

Do the steps strictly in this order.

### 1. Add the domains in Vercel
1. Vercel → the project → **Settings → Domains**.
2. Add `apexmodularconstruction.com`.
3. Add `*.apexmodularconstruction.com` (this is the wildcard — type it exactly).
4. Vercel will now show it wants your domain to use **Vercel's nameservers** and will
   display the exact pair to use (typically `ns1.vercel-dns.com` and
   `ns2.vercel-dns.com`). **Write down the exact pair Vercel shows — do not change
   nameservers yet.**

### 2. Re-create ALL existing records in Vercel DNS (do this BEFORE step 3)
In Vercel → **Settings → Domains → apexmodularconstruction.com → DNS Records**, add
every record below. This makes Vercel's zone a complete mirror of what's live today, so
nothing drops when nameservers move:

| Type | Name | Value | Priority / notes |
|------|------|-------|------------------|
| A | `@` | `216.198.79.1` | apex → Vercel (may be auto-added) |
| MX | `@` | `mx.zohocloud.ca` | 10 |
| MX | `@` | `mx2.zohocloud.ca` | 20 |
| MX | `@` | `mx3.zohocloud.ca` | 50 |
| TXT | `@` | `v=spf1 include:zohocloud.ca ~all` | SPF |
| TXT | `zmail._domainkey` | *(the DKIM `v=DKIM1...` value from the table above)* | Zoho DKIM |

> ⚠️ Copy the DKIM value **exactly**, including the whole `p=...` string. A truncated
> DKIM record silently sends Zoho mail to spam.
>
> Also log into the **Namecheap** DNS panel and confirm there are no *other* records
> there (extra subdomains, verification TXTs, CNAMEs). If there are, mirror those into
> Vercel too. What you see in Namecheap's "Advanced DNS" is the source of truth.

### 3. Switch nameservers at Namecheap (the go-live step)
1. Namecheap → **Domain List → Manage → Nameservers → Custom DNS**.
2. Replace with the two Vercel nameservers from step 1.4.
3. Save. Propagation is usually minutes but can take up to a few hours.

### 4. Verify (see "Verification" section below)
Once nameservers propagate, Vercel auto-issues the wildcard TLS cert (can take a few
minutes after DNS resolves). Then any subdomain works over HTTPS.

### 5. Set the environment variable
Vercel → **Settings → Environment Variables** → add for **Production**:
```
NEXT_PUBLIC_ROOT_DOMAIN = apexmodularconstruction.com
```
Then redeploy. (The code works without this, but it keeps the in-app custom-domain
"Verify connection" instructions accurate.)

---

## Lower-risk alternative — keep Namecheap nameservers (no email migration)

If you'd rather **not** move nameservers, you can avoid touching email entirely. The
trade-off: there's no wildcard cert, so each architect subdomain must be registered in
Vercel once (a 10-second step, easy to automate later via the Vercel API on signup).

1. **Namecheap → Advanced DNS**, add one record:
   `Type: CNAME  |  Host: *  |  Value: cname.vercel-dns.com`
   (Leave all MX/TXT/A records exactly as they are — email is untouched.)
2. For each architect subdomain, **Vercel → Settings → Domains → Add** e.g.
   `sarah-designs.apexmodularconstruction.com`. Because the wildcard CNAME already makes
   it resolve to Vercel, Vercel issues that subdomain's certificate automatically.
3. Set the `NEXT_PUBLIC_ROOT_DOMAIN` env var as in step 5 above.

Pick this if email risk is the priority; pick the recommended path if you want new
architect subdomains to light up with zero per-subdomain work.

---

## Verification (run after DNS propagates)

```bash
# 1. A subdomain now resolves (recommended path -> to Vercel; alternative -> the CNAME)
dig +short sarah-designs.apexmodularconstruction.com

# 2. Email records still resolve — MUST still list the Zoho MX servers
dig +short MX apexmodularconstruction.com
dig +short TXT apexmodularconstruction.com          # SPF must still be present

# 3. The subdomain serves the studio over HTTPS (200, valid cert)
curl -sI https://sarah-designs.apexmodularconstruction.com/ | head -1

# 4. A real end-to-end check in a browser: open
#    https://sarah-designs.apexmodularconstruction.com
#    -> Sarah's studio page, padlock shows a valid certificate.
```

If step 2 ever stops listing the Zoho MX/SPF records, **stop** — a record wasn't
mirrored. Re-add it in Vercel DNS; mail resumes once it propagates.

## Rollback

- **Recommended path:** set the nameservers back to `dns1.registrar-servers.com` /
  `dns2.registrar-servers.com` at Namecheap. DNS reverts to the current Namecheap zone.
- **Alternative path:** delete the `*` CNAME record in Namecheap. Nothing else changed.
