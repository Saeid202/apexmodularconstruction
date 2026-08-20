'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'

import { FloatingWidget } from '../adu/FloatingWidget'

const DASHBOARD_PREFIXES = ['/partner', '/admin', '/seller', '/account', '/affiliate']

/**
 * The product configurator at /products/<slug> is an immersive, full-viewport
 * experience, so it opts out of the site chrome the same way /studio does.
 * Deliberately anchored to a single segment: /products (the catalogue) keeps
 * its header and footer.
 */
const IMMERSIVE_ROUTE_PATTERNS = [/^\/products\/[^/]+\/?$/]

interface ConditionalShellProps {
  children: React.ReactNode
  cmsNav?: React.ReactNode
  footer?: React.ReactNode
  isSubdomain?: boolean
}

export function ConditionalShell({ children, cmsNav, footer, isSubdomain = false }: ConditionalShellProps) {
  const pathname = usePathname()
  const isArchitectAuth = pathname === '/architect/login' || pathname === '/architect/register'
  const isArchitectDashboard = pathname.startsWith('/architect') && !isArchitectAuth
  const isStudio = pathname.startsWith('/studio')
  const isImmersive = IMMERSIVE_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname))
  const hideChrome =
    DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p)) ||
    isArchitectDashboard ||
    isStudio ||
    isImmersive ||
    isSubdomain

  return (
    <>
      {!hideChrome && <Header cmsNav={cmsNav} />}
      {children}
      {!hideChrome && footer}
      {!hideChrome && <FloatingWidget />}
    </>
  )
}
