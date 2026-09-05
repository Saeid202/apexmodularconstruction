/**
 * Closing media block — the reference site's "Housing Meets Mass Production":
 * eyebrow pill, a plain left-aligned heading, then one large piece of media
 * running nearly the full content width, immediately above the footer.
 *
 * The reference embeds a YouTube player here. This does not, for two reasons:
 * there is no video id to embed, and the obvious destination (/video-centre) is
 * DB-driven and renders "Portfolio Showroom Offline" when no rows are seeded —
 * so a large play button would have been an outright promise of something that
 * may not exist. It is presented as an editorial image instead, linking to the
 * construction-solutions page, which is where the manufacturing and EPC story is
 * actually written.
 */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Band, Container, Display, EyebrowPill } from '@/components/marketing/ui'

/** Used only if the catalogue has no usable image. Stock photography was a poor
 *  fit here — a distribution warehouse or a car plant both misrepresent what the
 *  business makes — so a real building from the catalogue is preferred. */
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?w=1920&h=900&fit=crop&q=80'

export function InsideApex({ image }: { image?: string | null }) {
  return (
    <Band labelledBy="inside-heading">
      <Container>
        <EyebrowPill>Inside Apex</EyebrowPill>
        <Display id="inside-heading" className="mt-5">
          Housing meets mass production.
        </Display>

        <Link
          href="/services/construction-solutions"
          className="group mt-8 block overflow-hidden rounded-2xl bg-neutral-900 focus-visible:ring-2 focus-visible:ring-[#6B35B8] focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <div className="relative aspect-[16/9] sm:aspect-[21/9]">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote host is
                not guaranteed to match next.config images.remotePatterns. */}
            <img
              src={image || FALLBACK_IMAGE}
              alt="A completed Apex modular building"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: 'var(--scrim-card)' }}
            />

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="on-media max-w-xl text-[15px] font-medium text-white sm:text-base">
                Assembly-line manufacturing, engineered procurement and a single
                delivery contract.
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/80 transition-colors group-hover:text-white">
                See how we build
                <ArrowRight
                  aria-hidden
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </div>
        </Link>
      </Container>
    </Band>
  )
}
