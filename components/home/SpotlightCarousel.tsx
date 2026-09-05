'use client'

/**
 * Spotlight carousel.
 *
 * The reference site runs three of these full-width photographic blocks in a row
 * (Developments / Baby Box / Public Sector): centred light-weight heading, one
 * line of description, a single pill, arrows and dots.
 *
 * Apex's equivalents are the three offers that sit alongside the model
 * catalogue. All three link to routes that already exist.
 */

import { Carousel } from '@/components/marketing/Carousel'
import { Band, Display, MediaCard, PillLink } from '@/components/marketing/ui'

/**
 * The three things Apex offers alongside the model catalogue. All three point at
 * substantial existing pages.
 *
 * Two earlier entries were wrong and have been replaced:
 *  - "Design Studio" linked to /kitchen-studio, which is a kitchen-branded AR
 *    room scanner that hands off to an iOS LiDAR device via QR code. It is not a
 *    general building design tool, and a desktop visitor only ever sees a waiting
 *    state, so the card promised something the destination cannot deliver.
 *  - The materials link used `?category=materials`, a slug that exists in no
 *    migration. /products treats any non-prefab value as "materials mode" and
 *    silently falls back to all-materials, so it happened to work by accident.
 *    `all-materials` is the identifier the catalogue itself uses for that state.
 *
 * Descriptions are one short sentence: the reference's spotlight blocks carry two
 * lines at most, and longer copy over photography loses legibility however strong
 * the scrim is.
 */
const SPOTLIGHTS = [
  {
    title: 'Building Systems & Materials',
    body: 'Structural steel, wall and roof systems, doors, windows and finishes.',
    cta: { label: 'Browse Materials', href: '/products?category=all-materials' },
    image:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&h=1080&fit=crop&q=80',
  },
  {
    title: 'Construction Solutions',
    body: 'Full EPC delivery for commercial and multi-unit projects.',
    cta: { label: 'See Capabilities', href: '/services/construction-solutions' },
    image:
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&h=1080&fit=crop&q=80',
  },
  {
    title: 'CSA Compliance',
    body: 'A277 and Z240 guidance, plus the documentation your permit office needs.',
    cta: { label: 'Read the Guide', href: '/services/csa-certification' },
    image:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1920&h=1080&fit=crop&q=80',
  },
]

export function SpotlightCarousel() {
  return (
    <Band labelledBy="spotlight-heading">
      <h2 id="spotlight-heading" className="sr-only">
        What else we do
      </h2>

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-10">
        <Carousel label="Other Apex offerings" dots="below" autoplay interval={8}>
          {SPOTLIGHTS.map((item) => (
            <MediaCard
              key={item.title}
              src={item.image}
              alt={item.title}
              overlay="centred"
              className="h-[420px] sm:h-[500px] lg:h-[560px]"
            >
              <div className="flex h-full items-center justify-center px-8 text-center sm:px-20">
                <div className="max-w-2xl">
                  <Display as="h3" size="lg" invert>
                    {item.title}
                  </Display>
                  <p className="on-media mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/90">
                    {item.body}
                  </p>
                  <div className="mt-7">
                    <PillLink href={item.cta.href} variant="gold" size="md">
                      {item.cta.label}
                    </PillLink>
                  </div>
                </div>
              </div>
            </MediaCard>
          ))}
        </Carousel>
      </div>
    </Band>
  )
}
