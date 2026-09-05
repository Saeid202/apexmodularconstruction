/**
 * Partnership panel.
 *
 * Structurally this is the reference site's "Join forces with BOXABL" block: a
 * large rounded two-column card, an eyebrow pill, a light-weight heading, a
 * primary pill plus a quiet text link, a 2x2 grid of small bordered boxes, and a
 * tinted highlight box carrying chips.
 *
 * The content maps onto partner programmes that already exist in the app — the
 * architect portal, the affiliate programme, seller onboarding and the contractor
 * directory — so this section is navigation into real features rather than
 * decoration. The architect and affiliate entries open the same auth modals the
 * footer already dispatches.
 */

import { Band, Container, Display, EyebrowPill, Lede, PillLink } from '@/components/marketing/ui'
import { PartnerModalLinks } from './PartnerModalLinks'

const ROLES = [
  {
    label: 'Architects',
    body: 'Publish your designs on a branded subdomain and sell them through our catalogue.',
  },
  {
    label: 'Affiliates',
    body: 'Earn commission on referred projects with coupon tracking and a payout dashboard.',
  },
  {
    label: 'Suppliers',
    body: 'List materials and building systems to Canadian buyers with compliance support.',
  },
  {
    label: 'Installers',
    body: 'Take on site prep, foundation and hookup work from buyers in your province.',
  },
]

const CHIPS = ['Revenue share', 'Branded storefronts', 'Referral tracking']

export function PartnerPanel() {
  return (
    <Band labelledBy="partner-heading">
      <Container>
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white lg:grid lg:grid-cols-[1.15fr_1fr]">
          {/* Left column */}
          <div className="p-8 sm:p-10 lg:p-12">
            <EyebrowPill>Partner programmes</EyebrowPill>

            <Display id="partner-heading" className="mt-6 max-w-md">
              Build with Apex.
            </Display>

            <Lede className="mt-5 max-w-md">
              We work with the people who design, specify, sell and install modular
              buildings. If you do any of those, there is a place for you on the platform.
            </Lede>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              {/* Plain /contact: that page has no form and never reads
               * searchParams, so a ?subject= param was silently discarded. */}
              <PillLink href="/contact" variant="primary" size="md">
                Contact Partnerships
              </PillLink>
              <PartnerModalLinks />
            </div>

            <ul className="mt-9 grid gap-3 sm:grid-cols-2">
              {ROLES.map((role) => (
                <li key={role.label} className="rounded-xl border border-neutral-200 p-4">
                  <p className="text-[13px] font-semibold text-neutral-900">{role.label}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-neutral-500">
                    {role.body}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-3 rounded-xl border border-[#D4AF37]/35 bg-[var(--surface-subtle)] p-4">
              <p className="text-[13px] font-semibold text-neutral-900">
                Flexible commercial terms.
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-neutral-500">
                Commission, wholesale and white-label arrangements are all on the table.
                There is no minimum volume to start a conversation.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {CHIPS.map((chip) => (
                  <li
                    key={chip}
                    className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-neutral-600 uppercase"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            </div>
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
              <p className="text-[10px] font-semibold tracking-[0.16em] text-[#4B1D8F] uppercase">
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
