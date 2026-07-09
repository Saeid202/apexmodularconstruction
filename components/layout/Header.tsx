'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Navigation } from './Navigation'
import { MobileMenu } from './MobileMenu'
import { AuthModal } from '@/components/auth/AuthModal'
import { SellerAuthModal } from '@/components/auth/SellerAuthModal'
import { HeaderAuth } from './HeaderAuth'
import { CartBadge } from './CartBadge'
import { getSiteSettings, type SiteSettings } from '@/app/actions/cms-settings'

interface HeaderProps {
  cmsNav?: React.ReactNode
}

export function Header({ cmsNav }: HeaderProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' }>({
    open: false,
    mode: 'login',
  })
  const [sellerAuthModal, setSellerAuthModal] = useState<{
    open: boolean
    mode: 'login' | 'register'
  }>({
    open: false,
    mode: 'register',
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    getSiteSettings().then(setSettings)
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const mode = (e as CustomEvent).detail as 'login' | 'register'
      setAuthModal({ open: true, mode })
    }
    window.addEventListener('open-auth-modal', handler)
    return () => window.removeEventListener('open-auth-modal', handler)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const mode = (e as CustomEvent).detail as 'login' | 'register'
      setSellerAuthModal({ open: true, mode })
    }
    window.addEventListener('open-seller-auth-modal', handler)
    return () => window.removeEventListener('open-seller-auth-modal', handler)
  }, [])

  function closeAuth() {
    setAuthModal((prev) => ({ ...prev, open: false }))
  }
  function closeSellerAuth() {
    setSellerAuthModal((prev) => ({ ...prev, open: false }))
  }

  const headerClass = mounted && scrolled
    ? 'bg-primary shadow-elevation-medium border-b border-primary-700/50'
    : 'bg-primary border-b border-primary-700/50'

  return (
    <>
      <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${headerClass}`}>
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex h-14 lg:h-16 items-center gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center shrink-0 hover:opacity-85 transition-opacity"
            >
              {(!settings || settings.logo_style === 'complete-banner') && (
                <div
                  className={`flex items-center bg-white rounded-lg px-2 py-1 overflow-hidden ${
                    settings?.logo_height === 'h-20' ? 'h-10' : 'h-8'
                  }`}
                >
                  <img
                    src={settings?.logo_complete_banner_url || '/logo.png'}
                    alt="Apex Modular Construction"
                    className="h-full w-auto object-contain"
                  />
                </div>
              )}
              {settings?.logo_style === 'icon-and-text' && (
                <div className="flex items-center gap-2">
                  <img
                    src={settings.logo_icon_url || '/logo.jpg'}
                    alt="Apex Logo"
                    className="h-8 w-auto rounded-md"
                  />
                  <img
                    src={settings.logo_text_url || '/logo.svg'}
                    alt="Apex Modular Construction"
                    className="h-6 w-auto hidden sm:block"
                  />
                </div>
              )}
              {settings?.logo_style === 'text-only' && (
                <img
                  src={settings.logo_text_url || '/logo.svg'}
                  alt="Apex Modular Construction"
                  className="h-6 w-auto"
                />
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center flex-1">
              <Navigation
                onOpenSellerAuth={(mode) => setSellerAuthModal({ open: true, mode })}
              />
              {cmsNav}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <CartBadge />
              <div className="hidden lg:flex items-center gap-1.5">
                <HeaderAuth />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground/80 transition-colors hover:bg-white/10 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        cartItemCount={0}
        isAuthenticated={false}
        onOpenLogin={() => setAuthModal({ open: true, mode: 'login' })}
        onOpenRegister={() => setAuthModal({ open: true, mode: 'register' })}
        onOpenSellerAuth={(mode) => setSellerAuthModal({ open: true, mode })}
      />

      <AuthModal isOpen={authModal.open} initialMode={authModal.mode} onClose={closeAuth} />
      <SellerAuthModal
        isOpen={sellerAuthModal.open}
        initialMode={sellerAuthModal.mode}
        onClose={closeSellerAuth}
      />
    </>
  )
}