'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Wrench, ShieldCheck } from 'lucide-react'

interface NavigationProps {
  className?: string
  onLinkClick?: () => void
  onOpenSellerAuth?: (mode: 'login' | 'register') => void
}

const services = [
  {
    href: '/services/construction-solutions',
    label: 'Construction Solutions',
    icon: Wrench,
    description: 'Prefab buildings, steel structures & more',
  },
  {
    href: '/services/csa-certification',
    label: 'CSA Certification Guide',
    icon: ShieldCheck,
    description: 'Compliance for prefab buildings in Canada',
  },
]

export function Navigation({ className, onLinkClick, onOpenSellerAuth }: NavigationProps) {
  const [servicesOpen, setServicesOpen] = useState(false)
  const dropdownRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const linkClass =
    'relative text-sm font-medium text-primary-foreground/85 transition-colors hover:text-primary-foreground whitespace-nowrap flex items-center px-3 py-2 rounded-lg hover:bg-white/10'

  return (
    <nav className={className}>
      <ul className="flex items-center gap-0.5">
        <li>
          <Link href="/about" onClick={() => onLinkClick?.()} className={linkClass}>
            About Us
          </Link>
        </li>

        <li>
          <Link href="/products" onClick={() => onLinkClick?.()} className={linkClass}>
            Products
          </Link>
        </li>

        <li
          ref={dropdownRef}
          className="relative"
          onMouseEnter={() => setServicesOpen(true)}
          onMouseLeave={() => setServicesOpen(false)}
        >
          <button
            type="button"
            onClick={() => setServicesOpen((v) => !v)}
            className={`${linkClass} gap-1`}
            aria-expanded={servicesOpen}
            aria-haspopup="true"
          >
            Services
            <ChevronDown
              className="h-3.5 w-3.5 transition-transform duration-200"
              style={{ transform: servicesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {servicesOpen && (
            <div className="absolute left-0 top-full mt-1 w-64 rounded-xl border border-border bg-popover shadow-elevation-raised z-50 overflow-hidden">
              <div className="p-1.5">
                {services.map((s) => {
                  const Icon = s.icon
                  return (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={() => {
                        setServicesOpen(false)
                        onLinkClick?.()
                      }}
                      className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted group/item"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover/item:text-primary">
                          {s.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </li>

        <li>
          <Link href="/3d-printer" onClick={() => onLinkClick?.()} className={linkClass}>
            3D Printer
          </Link>
        </li>

        <li>
          <Link href="/video-centre" onClick={() => onLinkClick?.()} className={linkClass}>
            Videos
          </Link>
        </li>

        <li>
          <Link href="/contact" onClick={() => onLinkClick?.()} className={linkClass}>
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  )
}