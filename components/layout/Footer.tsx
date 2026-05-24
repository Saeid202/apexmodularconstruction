import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, Youtube, Github, Globe } from "lucide-react";
import type { SocialLink } from "@/app/actions/cms-settings";

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

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 1 1 0-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0 0 12.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
    </svg>
  );
}

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  facebook:  Facebook,
  instagram: Instagram,
  linkedin:  Linkedin,
  twitter:   Twitter,
  x:         Twitter,
  youtube:   Youtube,
  github:    Github,
  reddit:    RedditIcon,
  google:    GoogleIcon,
};

function SocialIcon({ platform }: { platform: string }) {
  const Icon = PLATFORM_ICONS[platform.toLowerCase()] ?? Globe;
  return <Icon className="h-4 w-4" />;
}

interface FooterProps {
  socialLinks?: SocialLink[];
}

export function Footer({ socialLinks = [] }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const activeSocialLinks = socialLinks.filter((l) => l.enabled && l.url);

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

            {/* Social Links */}
            {activeSocialLinks.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-semibold text-yellow-400 uppercase tracking-widest mb-3">Follow Us</p>
                <div className="flex flex-wrap gap-2">
                  {activeSocialLinks.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-800/60 border border-purple-700/50 text-purple-200 hover:bg-yellow-400 hover:text-purple-900 hover:border-yellow-400 transition-all duration-200"
                    >
                      <SocialIcon platform={link.platform} />
                    </a>
                  ))}
                </div>
              </div>
            )}
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
