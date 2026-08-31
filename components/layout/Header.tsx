'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Navigation } from './Navigation'
import { MobileMenu } from './MobileMenu'
import { AuthModal } from '@/components/auth/AuthModal'
import { SellerAuthModal } from '@/components/auth/SellerAuthModal'
import { ArchitectAuthModal } from '@/components/auth/ArchitectAuthModal'
import { AffiliateAuthModal } from '@/components/auth/AffiliateAuthModal'
import { HeaderAuth } from './HeaderAuth'
import { InstallButton } from '@/components/pwa/InstallButton'
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
  const [architectAuthModal, setArchitectAuthModal] = useState<{
    open: boolean
    mode: 'login' | 'register'
  }>({
    open: false,
    mode: 'register',
  })
  const [affiliateAuthModal, setAffiliateAuthModal] = useState<{
    open: boolean
    mode: 'login' | 'register'
  }>({
    open: false,
    mode: 'register',
  })

  useEffect(() => {
    getSiteSettings().then((data) => {
      setSettings(data)
    })
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

  useEffect(() => {
    const handler = (e: Event) => {
      const mode = (e as CustomEvent).detail as 'login' | 'register'
      setArchitectAuthModal({ open: true, mode })
    }
    window.addEventListener('open-architect-auth-modal', handler)
    return () => window.removeEventListener('open-architect-auth-modal', handler)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const mode = (e as CustomEvent).detail as 'login' | 'register'
      setAffiliateAuthModal({ open: true, mode })
    }
    window.addEventListener('open-affiliate-auth-modal', handler)
    return () => window.removeEventListener('open-affiliate-auth-modal', handler)
  }, [])

  function closeAuth() {
    setAuthModal((prev) => ({ ...prev, open: false }))
  }
  function closeSellerAuth() {
    setSellerAuthModal((prev) => ({ ...prev, open: false }))
  }
  function closeArchitectAuth() {
    setArchitectAuthModal((prev) => ({ ...prev, open: false }))
  }
  function closeAffiliateAuth() {
    setAffiliateAuthModal((prev) => ({ ...prev, open: false }))
  }

  return (
    <>
      <header 
        className="w-full py-3 transition-all duration-500 z-50 border-b border-gray-200 bg-white shadow-sm"
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center shrink-0 hover:opacity-85 transition-opacity"
            >
              {(!settings || settings.logo_style === 'complete-banner') && (
                <div
                  className={`flex items-center bg-white rounded-xl px-3 py-1.5 overflow-hidden ${
                    settings?.logo_height === 'h-12'
                      ? 'h-12'
                      : settings?.logo_height === 'h-20'
                        ? 'h-20'
                        : 'h-12'
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
                <div className="flex items-center gap-3">
                  <img
                    src={settings.logo_icon_url || '/logo.jpg'}
                    alt="Apex Logo"
                    className={`w-auto rounded-lg ${
                      settings.logo_height === 'h-12'
                        ? 'h-12'
                        : settings.logo_height === 'h-20'
                          ? 'h-20'
                          : 'h-10'
                    }`}
                  />
                  <img
                    src={settings.logo_text_url || '/logo.svg'}
                    alt="Apex Modular Construction"
                    className="h-8 w-auto hidden sm:block"
                  />
                </div>
              )}
              {settings?.logo_style === 'text-only' && (
                <img
                  src={settings.logo_text_url || '/logo.svg'}
                  alt="Apex Modular Construction"
                  className="h-8 w-auto"
                />
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <Navigation
                scrolled={scrolled}
                onOpenSellerAuth={(mode) => setSellerAuthModal({ open: true, mode })}
              />
              {cmsNav}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right side */}
            <div className="flex items-center gap-2 shrink-0">
              <CartBadge />
              <div className="hidden lg:flex items-center gap-2">
                <InstallButton />
                <HeaderAuth scrolled={scrolled} />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 transition-all hover:bg-gray-100 lg:hidden"
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

      <AuthModal
        key={`user-auth-${authModal.open}-${authModal.mode}`}
        isOpen={authModal.open}
        initialMode={authModal.mode}
        onClose={closeAuth}
      />

      <SellerAuthModal
        isOpen={sellerAuthModal.open}
        initialMode={sellerAuthModal.mode}
        onClose={closeSellerAuth}
      />

      <ArchitectAuthModal
        key={`architect-auth-${architectAuthModal.open}-${architectAuthModal.mode}`}
        isOpen={architectAuthModal.open}
        initialMode={architectAuthModal.mode}
        onClose={closeArchitectAuth}
      />

      <AffiliateAuthModal
        key={`affiliate-auth-${affiliateAuthModal.open}-${affiliateAuthModal.mode}`}
        isOpen={affiliateAuthModal.open}
        initialMode={affiliateAuthModal.mode}
        onClose={closeAffiliateAuth}
      />
    </>
  )
}
