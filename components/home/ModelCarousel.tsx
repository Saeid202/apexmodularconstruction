'use client'

/**
 * Model row.
 *
 * Mirrors the reference site's Casita carousel: large photographic cards with the
 * model name overlaid at the bottom-left, two pill CTAs per card, and the next
 * card peeking in from the right to signal that the row scrolls.
 *
 * This replaces the previous uniform grid. Two behaviours are carried over from
 * that version because they were bug fixes, not styling:
 *  - Building categories are ordered first and no category is ever filtered out.
 *    The original code hardcoded a "Prefab" filter that silently dropped every
 *    other category from the homepage.
 *  - A missing or zero price renders as "Request a quote" rather than "$0".
 */

import { useMemo } from 'react'
import type { ProductWithRelations } from '@/types'
import { Carousel } from '@/components/marketing/Carousel'
import { ArrowLink, Band, Container, Display, Lede, MediaCard, PillLink } from '@/components/marketing/ui'

interface ModelCarouselProps {
  products: ProductWithRelations[]
  title?: string
  limit?: number | null
}

/** Slug fragments that mark a category as a building rather than a material or a
 *  piece of equipment. Used only for ordering — nothing is excluded. */
const BUILDING_HINTS = [
  'pre-fabricated',
  'prefab',
  'modular',
  'steel',
  'building',
  'house',
  'home',
  'cabin',
  'adu',
]

const isBuilding = (product: ProductWithRelations) => {
  const slug = product.category?.slug?.toLowerCase() ?? ''
  return BUILDING_HINTS.some((hint) => slug.includes(hint))
}

/** Hard cap regardless of the CMS `homepage_products_limit`. Past six slides the
 *  dot row stops being a usable control and the section reads as a dump. */
const MAX_SLIDES = 6

export function ModelCarousel({ products, title = 'Models', limit }: ModelCarouselProps) {
  // Buildings lead, everything else follows. The homepage should open on what the
  // business actually sells without hiding the rest of the catalogue.
  const ordered = useMemo(() => {
    const buildings = products.filter(isBuilding)
    const rest = products.filter((p) => !isBuilding(p))
    const cap = Math.min(limit && limit > 0 ? limit : MAX_SLIDES, MAX_SLIDES)
    return [...buildings, ...rest].slice(0, cap)
  }, [products, limit])

  if (ordered.length === 0) return null

  return (
    <Band id="products" labelledBy="models-heading">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Display id="models-heading" size="md">
              Our {title}
            </Display>
            <Lede className="mt-3 max-w-xl">
              Configure a building online, then let us manufacture and deliver it to spec.
            </Lede>
          </div>
          <ArrowLink href="/products">View full catalogue</ArrowLink>
        </div>
      </Container>

      {/* The track is inset with the container but allowed to run to the right
       * edge, so the peeking card reads as "more to come" rather than as a
       * clipped layout. */}
      <div className="mx-auto w-full max-w-[1360px] pl-5 sm:pl-8 lg:pl-10">
        <Carousel label={`Our ${title.toLowerCase()}`} peek dots="below">
          {ordered.map((product) => (
            <ModelCard key={product.id} product={product} />
          ))}
        </Carousel>
      </div>
    </Band>
  )
}

function ModelCard({ product }: { product: ProductWithRelations }) {
  const image = product.images.find((img) => img.isMaster) ?? product.images[0]

  // A zero or absent price previously rendered as "From $0 CAD", which reads as a
  // data bug on the page whose whole job is looking credible. Quote-only products
  // show "By quote" instead — the same wording the product detail page uses, so
  // the card still signals the pricing model now that the CTA is a neutral
  // "Learn More".
  const needsQuote = product.requireOrderRequest || !(product.price > 0)
  const priceLabel = needsQuote
    ? 'By quote'
    : `From $${product.price.toLocaleString('en-CA', { minimumFractionDigits: 0 })} CAD`

  const specs = [
    product.specifications?.Beds && `${product.specifications.Beds} bed`,
    product.specifications?.Baths && `${product.specifications.Baths} bath`,
    product.specifications?.Area && `${product.specifications.Area} sq ft`,
  ].filter(Boolean) as string[]

  return (
    <MediaCard
      src={image?.url || '/logo.png'}
      alt={product.name}
      overlay="bottom"
      className="h-[380px] sm:h-[440px] lg:h-[470px]"
    >
      <div className="flex h-full flex-col justify-end p-6 sm:p-8">
        <p className="on-media text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase">
          {product.category?.name}
        </p>

        <Display as="h3" size="sm" invert className="on-media mt-1.5 line-clamp-2">
          {product.name}
        </Display>

        {/* Specs and price share one line — stacking them read as clutter against
         * the photograph. The price is omitted for quote-only products, because
         * the CTA below already says "Request a Quote" and repeating it put the
         * same three words twice on one card. */}
        {(specs.length > 0 || priceLabel) && (
          <p className="on-media mt-2.5 text-[13px] text-white/85">
            {specs.length > 0 && <span>{specs.join('  ·  ')}</span>}
            {specs.length > 0 && priceLabel && (
              <span aria-hidden className="mx-2 text-white/35">
                |
              </span>
            )}
            {priceLabel && <span className="font-semibold text-[#D4AF37]">{priceLabel}</span>}
          </p>
        )}

        {/* One CTA, not two.
         *
         * The reference site pairs "Order Now" with "Learn More", but this app has
         * no universal order entry point — ordering is product-scoped and branches
         * on `require_order_request` (Add to Cart / Buy Now, or an order-request
         * modal that needs a login). An earlier second pill pointed at /get-quote,
         * which is an AI floor-plan estimator that cannot receive a product at all,
         * so the model you clicked was silently discarded.
         *
         * "Learn More" is used for every card regardless of pricing model: it is
         * accurate for all of them, and the product page is where the real action
         * lives. The pricing model is communicated by the meta line above instead. */}
        <div className="mt-5">
          <PillLink href={`/products/${product.slug}`} variant="gold" size="sm">
            Learn More
          </PillLink>
        </div>
      </div>
    </MediaCard>
  )
}
