"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const quickLinks = [
  { href: "/about",    label: "About Us" },
  { href: "/products", label: "Products" },
  { href: "/services/construction-solutions", label: "Construction Solutions" },
  { href: "/contact",  label: "Contact Us" },
];

const customerServiceLinks = [
  { href: "/shipping", label: "Shipping Policy" },
  { href: "/contact",  label: "FAQ" },
  { href: "/contact",  label: "Support" },
];

const legalLinks = [
  { href: "/terms",   label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: '#3a1570' }} className="border-t border-purple-800/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-0.5 shadow-sm border border-purple-900/30 overflow-hidden">
                <img src="/logo.jpg" alt="Apex Logo" className="h-full w-full object-contain" />
              </div>
              <img src="/logo.svg" alt="Apex Modular Construction" className="h-6 w-auto" />
            </Link>
            <p className="text-sm text-purple-200 max-w-xs leading-relaxed">
              Your trusted marketplace for quality construction materials and robots from China to Canada.
            </p>
            <div className="space-y-2 text-sm text-purple-200">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-yellow-400 shrink-0" />
                <span>9131 Keele Street, Vaughan, Ontario, L4K 0G7</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-yellow-400 shrink-0" />
                <a href="tel:+14168825015" className="hover:text-yellow-300 transition-colors">+1 416 882 5015</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-yellow-400 shrink-0" />
                <a href="mailto:info@cargoplus.site" className="hover:text-yellow-300 transition-colors">info@cargoplus.site</a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-yellow-400 mb-4 text-sm uppercase tracking-widest">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-purple-200 hover:text-yellow-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-yellow-400 mb-4 text-sm uppercase tracking-widest">Customer Service</h3>
            <ul className="space-y-2">
              {customerServiceLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-purple-200 hover:text-yellow-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-yellow-400 mb-4 text-sm uppercase tracking-widest">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-purple-200 hover:text-yellow-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-purple-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-purple-300">
            <p>© {currentYear} Apex Modular Construction. All rights reserved.</p>
            <p>Prices in CAD. HST/GST calculated at checkout.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
