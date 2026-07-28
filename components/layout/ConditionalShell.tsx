'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'

import { FloatingWidget } from '../adu/FloatingWidget'

const DASHBOARD_PREFIXES = ['/partner', '/admin', '/seller', '/account']

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
  const isDashboard =
    DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p)) ||
    isArchitectDashboard ||
    isStudio ||
    isSubdomain

  return (
    <>
      {!isDashboard && <Header cmsNav={cmsNav} />}
      {children}
      {!isDashboard && footer}
      {!isDashboard && <FloatingWidget />}
    </>
  )
}
