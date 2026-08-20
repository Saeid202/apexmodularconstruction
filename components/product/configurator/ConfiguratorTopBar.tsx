'use client'

/**
 * The slim chrome bar for the immersive product configurator.
 *
 * The site Header is suppressed on this route (see ConditionalShell), so this
 * bar carries the only way back out: brand home, the catalogue, and the cart.
 */

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CartBadge } from '@/components/layout/CartBadge'

const GOLD = '#D4AF37'

interface Props {
  productName: string
  categoryName: string
  /** Already formatted, e.g. "$248,000.00 CAD" or "Request for a quote". */
  priceLabel: string
  /** Small qualifier under the price, e.g. "per SQM". */
  priceCaption?: string | null
}

export function ConfiguratorTopBar({
  productName,
  categoryName,
  priceLabel,
  priceCaption,
}: Props) {
  return (
    <header
      className="relative z-30 flex h-14 shrink-0 items-center gap-3 px-3 sm:gap-4 sm:px-5"
      style={{
        background:
          'linear-gradient(135deg, var(--brand-chrome-from) 0%, var(--brand-chrome-to) 100%)',
        borderBottom: `1px solid ${GOLD}55`,
      }}
    >
      {/* Back to catalogue */}
      <Link
        href="/products"
        className="flex h-9 shrink-0 items-center gap-2 rounded-xl px-2.5 text-xs font-bold uppercase tracking-widest text-purple-100 transition-colors hover:bg-white/10 hover:text-white sm:px-3"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">All Products</span>
      </Link>

      <span className="hidden h-6 w-px shrink-0 bg-white/15 sm:block" />

      {/* Brand */}
      <Link
        href="/"
        aria-label="Apex Modular Construction home"
        className="hidden h-9 shrink-0 items-center overflow-hidden rounded-lg bg-white px-2 transition-opacity hover:opacity-85 sm:flex"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Apex Modular Construction"
          className="h-full w-auto object-contain"
        />
      </Link>

      {/* Product identity */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <h1 className="truncate text-sm font-black tracking-tight text-white sm:text-base">
          {productName}
        </h1>
        <span
          className="truncate text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ color: GOLD }}
        >
          {categoryName}
        </span>
      </div>

      {/* Live price */}
      <div className="hidden shrink-0 flex-col items-end md:flex">
        <span className="text-sm font-black text-white">{priceLabel}</span>
        {priceCaption && (
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-purple-200">
            {priceCaption}
          </span>
        )}
      </div>

      {/* Cart — same badge the site header uses, already styled for this
          purple chrome. */}
      <div className="shrink-0">
        <CartBadge />
      </div>
    </header>
  )
}
