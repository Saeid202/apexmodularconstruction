/**
 * Partnership panel.
 *
 * Partnership panel with concept-to-completion messaging beside project-team imagery.
 */

import { Band, Container, Display } from '@/components/marketing/ui'
import { PartnerTabs } from './PartnerTabs'

export function PartnerPanel() {
  return (
    <Band labelledBy="partner-heading">
      <Container>
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white lg:grid lg:grid-cols-[1.15fr_1fr]">
          {/* Left column */}
          <div className="p-8 sm:p-10 lg:p-12">
            <Display id="partner-heading" className="max-w-md">
              From concept to completed building.
            </Display>

            <PartnerTabs />
          </div>

          {/* Right column */}
          <div className="border-t border-neutral-200 bg-[var(--surface-subtle)]/60 p-8 sm:p-10 lg:border-t-0 lg:border-l lg:p-12">
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote host
                  is not guaranteed to match next.config images.remotePatterns. */}
              <img
                src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&h=900&fit=crop&q=80"
                alt="A project team reviewing drawings together"
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>

            <div className="mt-4 rounded-xl border border-[#D4AF37]/35 bg-white p-5">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-[#1F2937] uppercase">
                What we are looking for
              </p>
              <p className="mt-3 text-lg leading-snug font-light text-neutral-900">
                Designers, suppliers and trades who can shorten the path from a drawing
                to a finished building.
              </p>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <dt className="text-[10px] font-semibold tracking-[0.14em] text-neutral-400 uppercase">
                  Priority
                </dt>
                <dd className="mt-1.5 text-[13px] font-medium text-neutral-900">
                  Delivery speed
                </dd>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <dt className="text-[10px] font-semibold tracking-[0.14em] text-neutral-400 uppercase">
                  Reach
                </dt>
                <dd className="mt-1.5 text-[13px] font-medium text-neutral-900">
                  Canada-wide
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Container>
    </Band>
  )
}
