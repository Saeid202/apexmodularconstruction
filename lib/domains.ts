/**
 * Shared helpers for architect custom domains.
 * Pure functions — safe to import from server actions, middleware, and
 * client components alike. No backend/database state involved.
 */

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
