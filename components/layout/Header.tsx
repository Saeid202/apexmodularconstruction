'use client'

import { useState, useEffect } from 'react'
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
      {/* Slim white chrome. Keeps the same proportions as the reference site's
       * header bar, but on a light surface so it sits with the white page body
       * rather than reading as a separate dark band.
       *
       * The background is fully opaque on purpose. With `bg-white/90` the bar
       * picked up the hero photograph behind it and rendered slightly grey, while
       * the CMS logo — which ships with an opaque white background rather than a
       * transparent one — stayed pure white. That left a visible white rectangle
       * around the logo whenever the sticky bar crossed the hero image. Opaque
       * white removes the mismatch for any logo asset, transparent or not. */}
      <header
        className={`sticky top-0 z-50 w-full border-b bg-white transition-shadow duration-300 ${
          scrolled
            ? 'border-neutral-200 shadow-[0_1px_16px_rgba(16,16,24,0.07)]'
            : 'border-neutral-200/70'
        }`}
      >
        <div className="relative z-10 mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-10">
          {/* `1fr auto 1fr` rather than `auto 1fr auto`: equal outer tracks make
           * the nav sit dead centre in the bar regardless of how wide the logo or
           * the action cluster happen to be. With `auto 1fr auto` the nav was only
           * centred inside the leftover space, so it drifted off-centre whenever
           * the two sides differed in width — which they always do. */}
          <div className="flex h-16 items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
            {/* Logo */}
            <Link
              href="/"
              className="flex shrink-0 items-center transition-opacity hover:opacity-75 lg:justify-self-start"
            >
              {(!settings || settings.logo_style === 'complete-banner') && (
                <div
                  className={`flex items-center overflow-hidden ${
                    settings?.logo_height === 'h-20' ? 'h-11' : 'h-9'
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
                <div className="flex items-center gap-2.5">
                  <img
                    src={settings.logo_icon_url || '/logo.jpg'}
                    alt="Apex Logo"
                    className="h-8 w-auto rounded-lg"
                  />
                  <img
                    src={settings.logo_text_url || '/logo.svg'}
                    alt="Apex Modular Construction"
                    className="hidden h-6 w-auto sm:block"
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

            {/* Centred navigation. A plain div, not a <nav>: Navigation and
             * CmsNavigation each render their own nav landmark, and nesting them
             * inside a third would give screen readers duplicate landmarks. */}
            <div className="hidden items-center justify-center lg:flex lg:justify-self-center">
              <Navigation
                onOpenSellerAuth={(mode) => setSellerAuthModal({ open: true, mode })}
              />
              {cmsNav}
            </div>

            {/* Right side actions */}
            <div className="flex shrink-0 items-center gap-2 lg:justify-self-end">
              <CartBadge />
              <div className="hidden items-center gap-2 lg:flex">
                <InstallButton />
                <HeaderAuth />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
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
