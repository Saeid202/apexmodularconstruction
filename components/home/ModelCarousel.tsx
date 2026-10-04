'use client'

/** Landing-page product grid with building categories ordered first. */

import { useMemo } from 'react'
import type { ProductWithRelations } from '@/types'
import { ProductCard } from '@/components/products/ProductCard'
import { ArrowLink, Band, Container, Display, Lede } from '@/components/marketing/ui'

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

const isCabinet = (product: ProductWithRelations) => {
  const category = `${product.category?.slug ?? ''} ${product.category?.name ?? ''}`.toLowerCase()
  return category.includes('cabinet') || product.name.toLowerCase().includes('cabinet')
}

/** Keep the landing-page listing concise even if the CMS limit is higher. */
const MAX_PRODUCTS = 8

export function ModelCarousel({ products, title = 'Models', limit }: ModelCarouselProps) {
  const ordered = useMemo(() => {
    const buildings = products.filter((product) => isBuilding(product) && !isCabinet(product))
    const cap = Math.min(limit && limit > 0 ? limit : MAX_PRODUCTS, MAX_PRODUCTS)
    return buildings.slice(0, cap)
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

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {ordered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </Band>
  )
}
