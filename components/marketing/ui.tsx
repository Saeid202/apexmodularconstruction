/**
 * Shared primitives for the public marketing pages.
 *
 * The visual language follows the reference site (boxabl.com): a white canvas,
 * full-bleed photographic cards with centred light-weight type, and small
 * rounded-full pill buttons. Where the reference uses amber on black, we use
 * Apex's purple on deep ink purple, so the landing page reads as the same family
 * as the rest of the application instead of as a separate microsite.
 *
 * Colour rules encoded here:
 *  - Display type is LIGHT weight (300/400). The reference never uses black
 *    weights, and heavy headings were what made the old page feel shouty.
 *  - Gold (#D4AF37) is decorative or sits on dark only. Gold text on white is
 *    ~2.2:1 and fails WCAG AA.
 *  - Brand hexes are the canonical values from scripts/palettes.mjs so
 *    `node scripts/apply-palette.mjs <palette>` keeps working.
 */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Layout ─────────────────────────────────────────────────────────────── */

/**
 * Wide container. The reference insets its cards only ~55px at 1440px, so the
 * content is much closer to full-bleed than a typical 1280px marketing column.
 */
export function Container({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-10', className)}>
      {children}
    </div>
  )
}

/**
 * Vertical rhythm between bands. The reference stacks generously spaced blocks
 * on plain white rather than alternating background colours, so `tone` is
 * intentionally limited — white by default, with a tinted option for the one or
 * two panels that need separating.
 */
export function Band({
  id,
  tone = 'white',
  labelledBy,
  size = 'md',
  className,
  children,
}: {
  id?: string
  tone?: 'white' | 'tint'
  labelledBy?: string
  size?: 'sm' | 'md' | 'none'
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'relative',
        size === 'md' && 'py-14 md:py-20',
        size === 'sm' && 'py-8 md:py-12',
        tone === 'tint' ? 'bg-[var(--surface-subtle)]' : 'bg-white',
        className
      )}
    >
      {children}
    </section>
  )
}

/* ─── Type ───────────────────────────────────────────────────────────────── */

/**
 * Small bordered uppercase label. The reference uses these as section eyebrows
 * ("MERGERS & ACQUISITIONS", "INSIDE BOXABL"). On light surfaces the text is
 * brand purple with a gold hairline border; on dark it inverts.
 */
export function EyebrowPill({
  children,
  invert = false,
  className,
}: {
  children: React.ReactNode
  invert?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase',
        invert
          ? 'border-white/25 text-white/80'
          : 'border-[#D4AF37]/45 bg-[var(--surface-subtle)] text-[#4B1D8F]',
        className
      )}
    >
      {children}
    </span>
  )
}

type DisplaySize = 'xl' | 'lg' | 'md' | 'sm'

const DISPLAY_SIZE: Record<DisplaySize, string> = {
  // Hero. Light weight at large size, matching the reference's centred headline.
  xl: 'text-[2rem] leading-[1.12] sm:text-5xl lg:text-[3.75rem] lg:leading-[1.06]',
  // Overlaid card headings ("Developments", "Baby Box").
  lg: 'text-[1.75rem] leading-[1.15] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]',
  // Standard on-white section headings.
  md: 'text-[1.6rem] leading-[1.2] sm:text-3xl lg:text-[2.25rem] lg:leading-[1.15]',
  // Card titles.
  sm: 'text-xl leading-snug sm:text-2xl',
}

/**
 * Display heading. Deliberately `font-light` at the two largest sizes: the
 * reference's hero and card headings are thin, and that single choice does more
 * to match its feel than any other property.
 */
export function Display({
  as: Tag = 'h2',
  size = 'md',
  id,
  invert = false,
  className,
  children,
}: {
  as?: 'h1' | 'h2' | 'h3' | 'p'
  size?: DisplaySize
  id?: string
  invert?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <Tag
      id={id}
      className={cn(
        'text-balance tracking-[-0.02em]',
        size === 'xl' || size === 'lg' ? 'font-light' : 'font-normal',
        DISPLAY_SIZE[size],
        invert ? 'text-white' : 'text-neutral-900',
        className
      )}
    >
      {children}
    </Tag>
  )
}

export function Lede({
  invert = false,
  className,
  children,
}: {
  invert?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <p
      className={cn(
        'text-[15px] leading-relaxed md:text-base',
        invert ? 'text-white/80' : 'text-neutral-600',
        className
      )}
    >
      {children}
    </p>
  )
}

/* ─── Pills ──────────────────────────────────────────────────────────────── */

type PillVariant = 'primary' | 'secondary' | 'light' | 'outlineLight' | 'gold'
type PillSize = 'sm' | 'md'

const PILL_BASE =
  'group inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B35B8] focus-visible:ring-offset-2 active:translate-y-px'

const PILL_VARIANT: Record<PillVariant, string> = {
  // Takes the role the reference gives amber: the single obvious next step.
  primary: 'bg-[#4B1D8F] text-white hover:bg-[#3A1570]',
  secondary:
    'border border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900 hover:bg-neutral-50',
  // The reference's white "Learn More" pill, for use on top of photography.
  light: 'bg-white/95 text-neutral-900 backdrop-blur-sm hover:bg-white',
  outlineLight:
    'border border-white/60 text-white backdrop-blur-sm hover:border-white hover:bg-white/15',
  gold: 'bg-[#D4AF37] text-[#1a0a33] hover:bg-[#b8960f]',
}

const PILL_SIZE: Record<PillSize, string> = {
  sm: 'h-8 px-4 text-[12.5px]',
  md: 'h-10 px-5 text-[13.5px]',
}

interface PillLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  variant?: PillVariant
  size?: PillSize
  external?: boolean
  withArrow?: boolean
  className?: string
  children: React.ReactNode
}

export function PillLink({
  href,
  variant = 'primary',
  size = 'md',
  external = false,
  withArrow = false,
  className,
  children,
  ...rest
}: PillLinkProps) {
  const classes = cn(PILL_BASE, PILL_VARIANT[variant], PILL_SIZE[size], className)
  const body = (
    <>
      {children}
      {withArrow && (
        <ArrowRight
          aria-hidden
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      )}
    </>
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...rest}>
        {body}
      </a>
    )
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {body}
    </Link>
  )
}

/** Quiet inline link with a nudging arrow, as used under the reference's
 *  compact resource rows ("Open Gallery →"). */
export function ArrowLink({
  href,
  invert = false,
  className,
  children,
}: {
  href: string
  invert?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        // min-h keeps the touch target at 24px without needing a bigger font.
        'group inline-flex min-h-6 items-center gap-1.5 py-1 text-[13px] font-semibold underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current focus-visible:ring-2 focus-visible:ring-[#6B35B8] focus-visible:ring-offset-2 focus-visible:outline-none',
        invert ? 'text-white/85 hover:text-white' : 'text-neutral-900 hover:text-[#4B1D8F]',
        className
      )}
    >
      {children}
      <ArrowRight
        aria-hidden
        className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </Link>
  )
}

/* ─── Media ──────────────────────────────────────────────────────────────── */

/**
 * Photographic card with a darkening scrim, the workhorse of the reference
 * layout. `overlay` controls how the type sits on it: `centred` for the hero and
 * spotlight blocks, `bottom` for the model cards.
 *
 * Plain <img> is used throughout rather than next/image because slide and
 * product URLs are admin- and seller-entered and are not guaranteed to match
 * next.config images.remotePatterns, which would hard-error the page.
 */
export function MediaCard({
  src,
  alt,
  overlay = 'centred',
  rounded = 'xl',
  priority = false,
  className,
  children,
}: {
  src: string
  alt: string
  overlay?: 'centred' | 'bottom' | 'none'
  rounded?: 'xl' | 'none'
  priority?: boolean
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'relative isolate overflow-hidden bg-neutral-900',
        rounded === 'xl' && 'rounded-2xl',
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- see note above */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />

      {overlay !== 'none' && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: overlay === 'centred' ? 'var(--scrim-centred)' : 'var(--scrim-card)',
          }}
        />
      )}

      {children ? <div className="relative z-10 h-full">{children}</div> : null}
    </div>
  )
}
