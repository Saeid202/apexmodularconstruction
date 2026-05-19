"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Navigation } from "./Navigation";
import { MobileMenu } from "./MobileMenu";
import { AuthModal } from "@/components/auth/AuthModal";
import { SellerAuthModal } from "@/components/auth/SellerAuthModal";
import { HeaderAuth } from "./HeaderAuth";
import { InstallButton } from "@/components/pwa/InstallButton";
import { CartBadge } from "./CartBadge";
import { getSiteSettings, type SiteSettings } from "@/app/actions/cms-settings";

interface HeaderProps {
  cmsNav?: React.ReactNode;
}

export function Header({ cmsNav }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: "login" | "register" }>({
    open: false,
    mode: "login",
  });
  const [sellerAuthModal, setSellerAuthModal] = useState<{ open: boolean; mode: "login" | "register" }>({
    open: false,
    mode: "register", // Default to register for "Sell on Apex Modular Construction"
  });

  useEffect(() => {
    getSiteSettings().then((data) => {
      setSettings(data);
    });
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const mode = (e as CustomEvent).detail as "login" | "register";
      setAuthModal({ open: true, mode });
    };
    window.addEventListener("open-auth-modal", handler);
    return () => window.removeEventListener("open-auth-modal", handler);
  }, []);

  function closeAuth() { setAuthModal((prev) => ({ ...prev, open: false })); }
  function closeSellerAuth() { setSellerAuthModal((prev) => ({ ...prev, open: false })); }

  useEffect(() => {
    const handler = (e: Event) => {
      const mode = (e as CustomEvent).detail as "login" | "register";
      setSellerAuthModal({ open: true, mode });
    };
    window.addEventListener("open-seller-auth-modal", handler);
    return () => window.removeEventListener("open-seller-auth-modal", handler);
  }, []);

  return (
    <>
      <header className="w-full sticky top-0 z-30 border-b border-purple-900/50" style={{ backgroundColor: '#4B1D8F' }}>
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center gap-8">

            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0 hover:opacity-85 transition-opacity">
              {(!settings || settings.logo_style === "complete-banner") && (
                <div className={`flex items-center bg-white px-4 py-1.5 rounded-xl shadow-md border border-purple-900/30 overflow-hidden transition-all ${
                  settings?.logo_height === "h-12" ? "h-12" : settings?.logo_height === "h-20" ? "h-20" : "h-16"
                }`}>
                  <img src="/logo.png" alt="Apex Modular Construction" className="h-full w-auto object-contain" />
                </div>
              )}

              {settings?.logo_style === "icon-and-text" && (
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center rounded-xl bg-white p-0.5 shadow-md border border-purple-900/30 overflow-hidden transition-all ${
                    settings.logo_height === "h-12" ? "h-12 w-12" : settings.logo_height === "h-20" ? "h-20 w-20" : "h-16 w-16"
                  }`}>
                    <img src="/logo.jpg" alt="Apex Logo" className="h-full w-full object-contain" />
                  </div>
                  <img src="/logo.svg" alt="Apex Modular Construction" className="h-10 w-auto hidden sm:block" />
                </div>
              )}

              {settings?.logo_style === "text-only" && (
                <img src="/logo.svg" alt="Apex Modular Construction" className="h-12 w-auto animate-fade-in" />
              )}
            </Link>

            {/* Desktop Navigation — LEFT side after logo */}
            <div className="hidden lg:flex items-center">
              <Navigation onOpenSellerAuth={(mode) => setSellerAuthModal({ open: true, mode })} />
              {cmsNav}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right side */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Cart */}
              <CartBadge />

              {/* Auth — Desktop */}
              <div className="hidden lg:flex items-center gap-2">
                <InstallButton />
                <HeaderAuth />
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-purple-200 transition-all hover:bg-white/10 hover:text-white lg:hidden"
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
        onOpenLogin={() => setAuthModal({ open: true, mode: "login" })}
        onOpenRegister={() => setAuthModal({ open: true, mode: "register" })}
        onOpenSellerAuth={(mode) => setSellerAuthModal({ open: true, mode })}
      />

      <AuthModal
        isOpen={authModal.open}
        initialMode={authModal.mode}
        onClose={closeAuth}
      />

      <SellerAuthModal
        isOpen={sellerAuthModal.open}
        initialMode={sellerAuthModal.mode}
        onClose={closeSellerAuth}
      />
    </>
  );
}
