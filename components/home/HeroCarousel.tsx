'use client'

/**
 * Hero.
 *
 * Follows the reference site: a full-bleed photographic carousel with the
 * headline centred over it in light-weight white type, a small qualifying line
 * beneath, and two pill CTAs. Arrows sit on the sides, dots at the bottom.
 *
 * Content is still driven by the `hero_slides` CMS table, so editors keep the
 * control they had. Each slide contributes its own image, headline, subtext and
 * CTAs rather than only the text changing.
 */

import { Carousel } from '@/components/marketing/Carousel'
import { Display, MediaCard, PillLink } from '@/components/marketing/ui'

type SlideData = {
  title?: string
  subtitle?: string | null
  image_url?: string
  cta_text?: string | null
  cta_link?: string | null
  cta_enabled?: boolean
  headline?: string | null
  subtext?: string | null
  benefits?: string[] | null
  cta_secondary_text?: string | null
  cta_secondary_link?: string | null
  trust_line?: string | null
}

interface HeroCarouselProps {
  slides?: SlideData[]
  autoplay?: boolean
  autoplayInterval?: number
  slide?: SlideData | null
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=1080&fit=crop&q=80'

const DEFAULT_SLIDE: SlideData = {
  headline: 'Design it online. Built in the factory. Delivered to your site.',
  subtext: 'Prefabricated homes and modular buildings, CSA-aligned for Canada.',
  image_url: FALLBACK_IMAGE,
}

export function HeroCarousel({
  slides = [],
  autoplay = false,
  autoplayInterval = 6,
  slide,
}: HeroCarouselProps) {
  const source = slides.length > 0 ? slides : slide ? [slide] : [DEFAULT_SLIDE]

  return (
    <section aria-label="Featured" data-ai-context="hero-section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Offer',
            name: source[0]?.headline || source[0]?.title || DEFAULT_SLIDE.headline,
            description: source[0]?.subtext || source[0]?.subtitle || DEFAULT_SLIDE.subtext,
            category: 'Construction Materials',
            offeredBy: {
              '@type': 'Organization',
              name: 'Apex Modular Construction',
              url: 'https://apexmodularconstruction.com',
            },
            areaServed: { '@type': 'Country', name: 'Canada' },
          }),
        }}
      />

      <Carousel
        label="Featured buildings"
        dots="overlay"
        autoplay={autoplay}
        interval={autoplayInterval}
      >
        {source.map((item, index) => (
          <HeroSlide
            key={index}
            slide={item}
            priority={index === 0}
            // Only the first slide supplies the page's h1. Every slide used to
            // render one, so adding a second hero slide in the CMS silently gave
            // the page three h1 elements.
            isPrimary={index === 0}
          />
        ))}
      </Carousel>
    </section>
  )
}

function HeroSlide({
  slide,
  priority,
  isPrimary,
}: {
  slide: SlideData
  priority: boolean
  isPrimary: boolean
}) {
  const headline = slide.headline || slide.title || DEFAULT_SLIDE.headline!
  const subtext = slide.subtext || slide.subtitle || slide.trust_line || DEFAULT_SLIDE.subtext

  // A slide can switch its own CTA off in the CMS. The reference hero always
  // carries two pills, so rather than dropping to a single button we promote the
  // secondary action and fall back to a contact route for the second slot.
  const ctaEnabled = slide.cta_enabled ?? true
  const primary = ctaEnabled
    ? { label: slide.cta_text || 'Explore Models', href: slide.cta_link || '/products' }
    : {
        label: slide.cta_secondary_text || 'Explore Models',
        href: slide.cta_secondary_link || '/products',
      }
  const secondary = ctaEnabled
    ? {
        label: slide.cta_secondary_text || 'Explore Models',
        href: slide.cta_secondary_link || '/products',
      }
    : { label: 'Talk to a Specialist', href: '/contact' }

  return (
    <MediaCard
      src={slide.image_url || FALLBACK_IMAGE}
      alt={slide.title || 'Apex Modular Construction prefabricated building'}
      overlay="centred"
      rounded="none"
      priority={priority}
      className="h-[520px] sm:h-[600px] lg:h-[660px]"
    >
      <div className="flex h-full items-center justify-center px-6 text-center sm:px-16">
        <div className="max-w-3xl">
          <Display as={isPrimary ? 'h1' : 'p'} size="xl" invert>
            {headline}
          </Display>

          {subtext && (
            <p className="on-media mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-white/90 md:text-base">
              {subtext}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <PillLink href={primary.href} variant="gold" size="md" data-ai-cta="primary">
              {primary.label}
            </PillLink>
            <PillLink href={secondary.href} variant="light" size="md">
              {secondary.label}
            </PillLink>
          </div>
        </div>
      </div>
    </MediaCard>
  )
}
