/**
 * Shared helpers for architect custom domains.
 * Pure functions — safe to import from server actions, middleware, and
 * client components alike. No backend/database state involved.
 */

// The DNS targets architects point their domain at. Single source of truth
// for both the setup instructions (UI) and the verify-connection check.
export const APP_ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'apexmodularconstruction.com'
export const APP_A_RECORD = process.env.NEXT_PUBLIC_APP_IP || '76.76.21.21'

/**
 * Every hostname that belongs to the PLATFORM itself (its marketing site and
 * architect studio subdomains) rather than an architect's own connected domain.
 * This is the single source of truth used by the middleware router.
 *
 * The canonical production domain is ALWAYS included so studio subdomains route
 * correctly even if `NEXT_PUBLIC_ROOT_DOMAIN` is not set in the deploy env — the
 * exact bug that broke `sarah-designs.apexmodularconstruction.com`. The env value
 * (e.g. `localhost:3000`) is added on top for local/preview subdomain testing.
 * To onboard another platform domain, add it here — nothing else needs editing.
 */
export const PLATFORM_ROOT_DOMAINS: string[] = Array.from(
  new Set(
    [process.env.NEXT_PUBLIC_ROOT_DOMAIN, 'apexmodularconstruction.com', 'localhost:3000']
      .filter((d): d is string => !!d)
      .map((d) => d.trim().toLowerCase())
  )
)

/**
 * Extract the studio subdomain from a request `Host` header, or `null` when the
 * host is a platform root itself, a `www.` root, or a foreign (custom) domain.
 * Port-aware, so it works for `sarah.localhost:3000` in dev.
 *   sarah.apexmodularconstruction.com  -> "sarah"
 *   www.apexmodularconstruction.com    -> null
 *   apexmodularconstruction.com        -> null
 *   myfirm.com (custom domain)         -> null
 */
export function getStudioSubdomain(hostHeader: string): string | null {
  const host = (hostHeader || '').trim().toLowerCase()
  if (!host) return null
  for (const root of PLATFORM_ROOT_DOMAINS) {
    if (host === root || host === `www.${root}`) return null
    if (host.endsWith(`.${root}`)) {
      const sub = host.slice(0, host.length - root.length - 1)
      return sub === '' || sub === 'www' ? null : sub
    }
  }
  return null
}

/**
 * True when the `Host` belongs to the platform (its root, `www`, or a studio
 * subdomain) as opposed to an architect's own connected custom domain. Used to
 * keep the custom-domain router from ever hijacking a platform request. Port-
 * insensitive so `apexmodularconstruction.com` and `...:3000` both match.
 */
export function isPlatformHost(hostHeader: string): boolean {
  const host = (hostHeader || '').trim().toLowerCase().replace(/:\d+$/, '')
  if (!host) return false
  return PLATFORM_ROOT_DOMAINS.some((root) => {
    const r = root.replace(/:\d+$/, '')
    return host === r || host === `www.${r}` || host.endsWith(`.${r}`)
  })
}

/**
 * Normalize a hostname/custom domain for consistent storage and lookup:
 * strip protocol, path, port and any trailing dot, and lowercase it.
 * `HTTPS://WWW.MyFirm.com/contact` -> `www.myfirm.com`
 */
export function normalizeHost(input: string): string {
  return (input || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')
    .replace(/\.$/, '')
}

/**
 * Validate that a string looks like a real, fully-qualified domain
 * (e.g. `myfirm.com` or `studio.myfirm.com`). Rejects bare labels,
 * localhost, and anything with a path/protocol left over.
 */
export function isValidCustomDomain(input: string): boolean {
  const host = normalizeHost(input)
  if (!host || host.length > 253) return false
  if (host === 'localhost') return false
  // labels separated by dots; at least two labels; TLD >= 2 alpha chars
  return /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/.test(host) &&
    /\.[a-z]{2,}$/.test(host)
}

/**
 * Return the candidate hosts to match against stored domains, so that the
 * www / apex (non-www) pair resolve to the same architect regardless of
 * which one the visitor typed.
 */
export function hostCandidates(input: string): string[] {
  const host = normalizeHost(input)
  if (!host) return []
  const alt = host.startsWith('www.') ? host.slice(4) : `www.${host}`
  return Array.from(new Set([host, alt]))
}
