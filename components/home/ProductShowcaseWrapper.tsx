import { ModelCarousel } from './ModelCarousel'
import type { ProductWithRelations } from '@/types'

/**
 * Server pass-through so the page (a server component) can hand Supabase data to
 * the client-side carousel.
 */
export function ProductShowcaseWrapper({
  products,
  title,
  limit,
}: {
  products: ProductWithRelations[]
  title?: string
  limit?: number | null
}) {
  return <ModelCarousel products={products} title={title} limit={limit} />
}
