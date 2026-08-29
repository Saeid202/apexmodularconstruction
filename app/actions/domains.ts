'use server'

import { promises as dns } from 'dns'
import {
  normalizeHost,
  isValidCustomDomain,
  APP_ROOT_DOMAIN,
  APP_A_RECORD,
} from '@/lib/domains'

export interface DomainVerifyResult {
  connected: boolean
  method: 'cname' | 'a' | null
  found: string[]
  expected: { cname: string; a: string }
  error: string | null
}

/**
 * Live DNS check for an architect's custom domain (the "Verify connection"
 * button). Read-only — resolves the domain's public DNS records and reports
 * whether they point at the app. No database access, no writes.
 *
 * "Connected" means the architect has done their part (DNS points here). TLS
 * provisioning is a separate platform infra step, so this intentionally checks
 * DNS rather than fetching over HTTPS.
 */
export async function verifyCustomDomainDNS(input: string): Promise<DomainVerifyResult> {
  const host = normalizeHost(input)
  const expected = { cname: APP_ROOT_DOMAIN, a: APP_A_RECORD }

  if (!isValidCustomDomain(host)) {
    return { connected: false, method: null, found: [], expected, error: 'Invalid domain' }
  }

  const found: string[] = []
  let connected = false
  let method: 'cname' | 'a' | null = null

  // CNAME check — used for subdomains (www.myfirm.com -> apexmodularconstruction.com)
  try {
    const cnames = await dns.resolveCname(host)
    for (const c of cnames) {
      found.push(`CNAME → ${c}`)
      const target = normalizeHost(c)
      if (target === APP_ROOT_DOMAIN || target.endsWith(`.${APP_ROOT_DOMAIN}`)) {
        connected = true
        method = 'cname'
      }
    }
  } catch {
    /* no CNAME record — fall through to A check */
  }

  // A record check — used for root domains (myfirm.com -> app IP)
  if (!connected) {
    try {
      const addresses = await dns.resolve4(host)
      for (const a of addresses) {
        found.push(`A → ${a}`)
        if (a === APP_A_RECORD) {
          connected = true
          method = 'a'
        }
      }
    } catch {
      /* no A record either */
    }
  }

  return {
    connected,
    method,
    found,
    expected,
    error: found.length === 0 ? 'No DNS records found yet — add the records below and check again.' : null,
  }
}
