"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Wrench, ShieldCheck } from "lucide-react";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

interface NavigationProps {
  className?: string;
  onLinkClick?: () => void;
  onOpenSellerAuth?: (mode: "login" | "register") => void;
}

const services = [
  {
    href: "/services/construction-solutions",
    label: "Construction Solutions",
    icon: Wrench,
    description: "Prefab buildings, steel structures & more",
  },
  {
    href: "/services/csa-certification",
    label: "CSA Certification Guide",
    icon: ShieldCheck,
    description: "Compliance for prefab buildings in Canada",
  },
];

export function Navigation({ className, onLinkClick }: NavigationProps) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const linkClass =
    "relative text-sm font-semibold text-purple-100 transition-all hover:text-yellow-300 min-h-[44px] flex items-center px-4 py-2 rounded-xl hover:bg-white/10 group";

  return (
    <nav className={className}>
      <ul className="flex items-center gap-1">
        {/* About Us */}
        <li>
          <Link href="/about" onClick={() => onLinkClick?.()} className={linkClass}>
            About Us
            <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-yellow-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
          </Link>
        </li>

        {/* Products */}
        <li>
          <Link href="/products" onClick={() => onLinkClick?.()} className={linkClass}>
            Products
            <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-yellow-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
          </Link>
        </li>

        {/* Blog */}
        <li>
          <Link href="/blog" onClick={() => onLinkClick?.()} className={linkClass}>
            Blog
            <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-yellow-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
          </Link>
        </li>

        {/* Services dropdown */}
        <li ref={dropdownRef} className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
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
              style={{ transform: servicesOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
            <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-yellow-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
          </button>

          {/* Dropdown panel */}
          {servicesOpen && (
            <div
              className="absolute left-0 top-full mt-1 w-64 rounded-2xl overflow-hidden shadow-xl z-50"
              style={{
                border: `1px solid ${GOLD}44`,
                background: "white",
                boxShadow: `0 8px 32px rgba(75,29,143,0.15), 0 0 0 1px ${PURPLE}22`,
              }}
            >
              {/* Header */}
              <div
                className="px-4 py-2.5"
                style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #3a1570 100%)` }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-purple-200">
                  Our Services
                </p>
              </div>

              {/* Items */}
              <div className="p-2">
                {services.map((s) => {
                  const Icon = s.icon;
                  return (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={() => { setServicesOpen(false); onLinkClick?.(); }}
                      className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#EDE9F6] group/item"
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5"
                        style={{ backgroundColor: `${PURPLE}18` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: PURPLE }} />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-gray-900 group-hover/item:text-[#4B1D8F]">
                          {s.label}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{s.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </li>

        {/* Contact Us */}
        <li>
          <Link href="/contact" onClick={() => onLinkClick?.()} className={linkClass}>
            Contact Us
            <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-yellow-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
          </Link>
        </li>
      </ul>
    </nav>
  );
}
