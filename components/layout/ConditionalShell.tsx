'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'

import { FloatingWidget } from '../adu/FloatingWidget'

const DASHBOARD_PREFIXES = ['/partner', '/admin', '/seller', '/account']

interface ConditionalShellProps {
  children: React.ReactNode
  cmsNav?: React.ReactNode
  footer?: React.ReactNode
}

export function ConditionalShell({ children, cmsNav, footer }: ConditionalShellProps) {
  const pathname = usePathname()
  const isDashboard = DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p))

  return (
    <>
      {!isDashboard && <Header cmsNav={cmsNav} />}
      {children}
      {!isDashboard && footer}
      {!isDashboard && <FloatingWidget />}
    </>
  )
}
