/**
 * Two-up promo cards followed by two compact resource rows.
 *
 * This is the reference site's Investors/Projects pair and its Gallery/Financing
 * rows, in the same order and at the same relative weight: image-led cards with a
 * pill, then a lighter pair of thumbnail rows with text links.
 */

import { ArrowLink, Band, Container, Display, PillLink } from '@/components/marketing/ui'

const PROMOS = [
  {
    title: 'Property Feasibility',
    body: 'Check zoning, permit requirements and modular feasibility for a specific address before you choose a model.',
    cta: { label: 'Check a Property', href: '/property-feasibility' },
    image:
      'https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=1200&h=800&fit=crop&q=80',
  },
  {
    title: 'Installer Network',
    body: 'Find Canadian contractors for site prep, foundation, utility hookups and final inspection.',
    cta: { label: 'Find Installers', href: '/hire-installers' },
    image:
      'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=1200&h=800&fit=crop&q=80',
  },
]

/**
 * The Video Centre row that used to sit here has been removed: that page is
 * DB-driven and renders "Portfolio Showroom Offline" when no rows exist, so it
 * was a coin-flip whether a visitor landed on an empty shell. The AI assistant is
 * always available and needs no content to be seeded.
 */
const RESOURCES = [
  {
    title: 'Ask the AI Assistant',
    body: 'Questions about products, pricing, shipping or timelines, answered instantly.',
    cta: { label: 'Start a Chat', href: '/ai-assistant' },
    image:
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop&q=80',
  },
  {
    title: 'Guides & Insights',
    body: 'Cost breakdowns, compliance explainers and project write-ups.',
    cta: { label: 'Read the Blog', href: '/blog' },
    image:
      'https://images.unsplash.com/photo-1503387837-b154d5074bd2?w=400&h=300&fit=crop&q=80',
  },
]

export function PromoPair() {
  return (
    <Band labelledBy="explore-heading">
      <h2 id="explore-heading" className="sr-only">
        Explore Apex
      </h2>

      <Container>
        <div className="grid gap-6 md:grid-cols-2">
          {PROMOS.map((promo) => (
            <article key={promo.title}>
              <div className="overflow-hidden rounded-2xl bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote host
                    is not guaranteed to match next.config images.remotePatterns. */}
                <img
                  src={promo.image}
                  alt={promo.title}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
              <Display as="h3" size="sm" className="mt-5">
                {promo.title}
              </Display>
              <p className="mt-2 max-w-md text-[14px] leading-relaxed text-neutral-600">
                {promo.body}
              </p>
              <div className="mt-5">
                <PillLink href={promo.cta.href} variant="primary" size="sm">
                  {promo.cta.label}
                </PillLink>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 grid gap-x-6 gap-y-8 border-t border-neutral-200 pt-10 md:grid-cols-2">
          {RESOURCES.map((resource) => (
            <article key={resource.title} className="flex items-start gap-4">
              <div className="w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:w-32">
                {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
                <img
                  src={resource.image}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-medium text-neutral-900">{resource.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
                  {resource.body}
                </p>
                <div className="mt-3">
                  <ArrowLink href={resource.cta.href}>{resource.cta.label}</ArrowLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Band>
  )
}
