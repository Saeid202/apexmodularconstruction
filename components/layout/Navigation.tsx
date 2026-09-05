'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Wrench, ShieldCheck } from 'lucide-react'

const PURPLE = '#4B1D8F'

interface NavigationProps {
  className?: string
  onLinkClick?: () => void
  onOpenSellerAuth?: (mode: 'login' | 'register') => void
  scrolled?: boolean
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

export function Navigation({ className, onLinkClick }: NavigationProps) {
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

  // The header is a white surface, so links are ink-on-white with a brand
  // underline on hover.
  const linkClass =
    'group relative flex items-center rounded-lg px-3.5 py-2 text-[13.5px] font-medium whitespace-nowrap text-neutral-600 transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-[#6B35B8] focus-visible:ring-offset-2 focus-visible:outline-none'

  return (
    <nav className={className}>
      <ul className="flex items-center gap-1">
        {/* About Us
        <li>
          <Link href="/about" onClick={() => onLinkClick?.()} className={linkClass}>
            About Us
            <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-[#4B1D8F] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
          </Link>
        </li>
        */}

        {/* Buildings */}
        <li>
          <Link href="/products" onClick={() => onLinkClick?.()} className={linkClass}>
            Buildings
            <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-[#4B1D8F] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
          </Link>
        </li>

        {/* Materials — `all-materials` is the identifier the catalogue uses for
            "materials mode, everything"; `?category=materials` matched no slug. */}
        <li>
          <Link href="/products?category=all-materials" onClick={() => onLinkClick?.()} className={linkClass}>
            Materials
            <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-[#4B1D8F] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
          </Link>
        </li>

        {/* Services */}
        <li
          ref={dropdownRef}
          className="relative hidden"
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
            <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-[#4B1D8F] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
          </button>

          {/* Dropdown panel */}
          {servicesOpen && (
            <div className="shadow-panel absolute left-0 top-full z-50 mt-1.5 w-72 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              {/* Header */}
              <div className="border-b border-neutral-100 bg-[var(--surface-subtle)] px-4 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Our Services
                </p>
              </div>

              {/* Items */}
              <div className="p-2">
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
                      className="group/item flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--surface-subtle)]"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-tint)]">
                        <Icon className="h-4 w-4" style={{ color: PURPLE }} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 group-hover/item:text-[#4B1D8F]">
                          {s.label}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">
                          {s.description}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </li>





        {/* Contact Us */}
        <li>
          <Link href="/contact" onClick={() => onLinkClick?.()} className={linkClass}>
            Contact Us
            <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-[#4B1D8F] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
          </Link>
        </li>
      </ul>
    </nav>
  )
}
