import type { ComponentType } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'
import type { SocialLink } from '@/app/actions/cms-settings'

const quickLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/products', label: 'Products' },
  { href: '/services/construction-solutions', label: 'Construction Solutions' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact Us' },
]

const legalLinks = [
  { href: '/terms', label: 'Terms of Service' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/shipping', label: 'Shipping Policy' },
]

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
  )
}

const PLATFORM_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
}

interface FooterProps {
  socialLinks?: SocialLink[]
}

export function Footer({ socialLinks = [] }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const activeSocialLinks = socialLinks.filter((l) => l.enabled && l.url)

  return (
    <footer className="bg-primary-900">
      {/* Gold accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-secondary-500/50 to-transparent" />

      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="space-y-5 lg:col-span-5">
            <Link
              href="/"
              className="inline-flex items-center gap-3 hover:opacity-85 transition-opacity"
            >
              <div className="bg-white rounded-lg h-10 w-10 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Apex Modular Construction"
                  className="h-8 w-8 object-contain"
                />
              </div>
              <span className="text-white font-semibold text-sm">
                Apex Modular Construction
              </span>
            </Link>
            <p className="text-sm text-primary-100/70 leading-relaxed max-w-sm">
              Your trusted partner for quality prefabricated structures and construction solutions —
              direct from factory to your Canadian site.
            </p>
            <div className="space-y-2 text-sm text-primary-100/70">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-secondary-500" />
                <span>9131 Keele Street, Vaughan, Ontario, L4K 0G7</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-secondary-500" />
                <a href="tel:+14168825015" className="hover:text-white transition-colors">
                  +1 416 882 5015
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-secondary-500" />
                <a href="mailto:info@cargoplus.site" className="hover:text-white transition-colors">
                  info@cargoplus.site
                </a>
              </div>
            </div>

            {activeSocialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {activeSocialLinks.map((link) => {
                  const Icon = PLATFORM_ICONS[link.platform.toLowerCase()]
                  if (!Icon) return null
                  return (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-primary-100/50 hover:bg-secondary-500 hover:text-primary-900 hover:border-secondary-500 transition-all duration-200"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary-500 mb-4">
                Quick Links
              </p>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-100/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary-500 mb-4">
                Services
              </p>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/services/construction-solutions"
                    className="text-sm text-primary-100/70 hover:text-white transition-colors"
                  >
                    Construction Solutions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/csa-certification"
                    className="text-sm text-primary-100/70 hover:text-white transition-colors"
                  >
                    CSA Certification
                  </Link>
                </li>
                <li>
                  <Link
                    href="/3d-printer"
                    className="text-sm text-primary-100/70 hover:text-white transition-colors"
                  >
                    3D Printing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping"
                    className="text-sm text-primary-100/70 hover:text-white transition-colors"
                  >
                    Shipping
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary-500 mb-4">
                Legal
              </p>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-100/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-primary-100/40">
          <p>© {currentYear} Apex Modular Construction. All rights reserved.</p>
          <p>Prices in CAD. HST/GST calculated at checkout.</p>
        </div>
      </div>
    </footer>
  )
}