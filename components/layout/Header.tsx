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

  function closeAuth() {
    setAuthModal((prev) => ({ ...prev, open: false }))
  }
  function closeSellerAuth() {
    setSellerAuthModal((prev) => ({ ...prev, open: false }))
  }

  return (
    <>
      <header className="w-full bg-[#4B1D8F] border-b border-purple-900/50 py-3 transition-all duration-500">
        <div className="container mx-auto px-4">
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
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white transition-all hover:bg-white/10 lg:hidden"
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
