'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { X, ShoppingCart, User, ChevronDown, Wrench, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  cartItemCount: number
  isAuthenticated: boolean
  onOpenLogin: () => void
  onOpenRegister: () => void
  onOpenSellerAuth?: (mode: 'login' | 'register') => void
}

const navLinks = [
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About Us' },
  { href: '/3d-printer', label: 'Construction 3D Printer' },
  { href: '/video-centre', label: 'Video Centre' },
  { href: '/contact', label: 'Contact Us' },
]

export function MobileMenu({
  isOpen,
  onClose,
  cartItemCount,
  isAuthenticated,
  onOpenLogin,
  onOpenRegister,
  onOpenSellerAuth,
}: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [servicesOpen, setServicesOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            ref={menuRef}
            className="absolute right-0 top-0 h-full w-80 max-w-[calc(100vw-3rem)] bg-background shadow-elevation-raised border-l border-border"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border px-4 h-14">
                <span className="text-lg font-semibold">Menu</span>
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/products"
                      onClick={onClose}
                      className="flex min-h-[44px] items-center rounded-lg px-4 text-base font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                    >
                      Products
                    </Link>
                  </li>

                  <li>
                    <button
                      type="button"
                      onClick={() => setServicesOpen((v) => !v)}
                      className="flex min-h-[44px] w-full items-center justify-between rounded-lg px-4 text-base font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                    >
                      Services
                      <ChevronDown
                        className="h-4 w-4 transition-transform duration-200"
                        style={{ transform: servicesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    </button>
                    {servicesOpen && (
                      <ul className="ml-4 mt-1 space-y-1 border-l-2 border-primary/20 pl-3">
                        <li>
                          <Link
                            href="/services/construction-solutions"
                            onClick={onClose}
                            className="flex min-h-[40px] items-center gap-2 rounded-lg px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <Wrench className="h-4 w-4 text-primary" />
                            Construction Solutions
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/services/csa-certification"
                            onClick={onClose}
                            className="flex min-h-[40px] items-center gap-2 rounded-lg px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            CSA Certification Guide
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>

                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="flex min-h-[44px] items-center rounded-lg px-4 text-base font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}

                  <li className="pt-2">
                    <button
                      onClick={() => {
                      }}
                      className="flex min-h-[44px] w-full items-center rounded-lg px-4 text-base font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      Sell on Apex Modular Construction
                    </button>
                  </li>
                </ul>
              </nav>

              <div className="border-t border-border p-4 space-y-3">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex min-h-[44px] items-center justify-between rounded-lg px-4 text-base font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                >
                  <span className="flex items-center gap-3">
                    <ShoppingCart className="h-5 w-5" />
                    Cart
                  </span>
                  {cartItemCount > 0 && (
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                {isAuthenticated ? (
                  <Link
                    href="/account/profile"
                    onClick={onClose}
                    className="flex min-h-[44px] items-center gap-3 rounded-lg px-4 text-base font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <User className="h-5 w-5" />
                    My Account
                  </Link>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onClose()
                        onOpenLogin()
                      }}
                      className="flex flex-1 min-h-[44px] items-center justify-center rounded-lg border border-border text-base font-medium transition-colors hover:bg-muted"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        onClose()
                        onOpenRegister()
                      }}
                      className="flex flex-1 min-h-[44px] items-center justify-center rounded-lg bg-primary text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}