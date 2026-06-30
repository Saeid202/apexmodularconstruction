import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getProductBySlug } from '@/app/actions/products'
import { getHouseConfigurator, ensureHouseConfigurator } from '@/app/actions/configurator'
import { mockProducts } from '@/lib/mock-data'
import type { ProductWithRelations } from '@/types'
import { ProductDetailWrapper } from './ProductDetailWrapper'

interface Props {
  params: Promise<{ slug: string }>
}

type ProductDetailDbProduct = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>['data']> & {
  configurator_type?: ProductWithRelations['configurator_type']
  require_order_request?: boolean | null
  show_stock?: boolean | null
  youtube_url?: string | null
  product_images: Array<{
    id: string
    product_id: string
    url: string
    alt_text: string | null
    position: number
    variant_code?: string | null
    variant_price?: number | null
    is_master?: boolean | null
  }>
  product_customization_groups?: Array<{
    id: string
    product_id: string
    name: string
    description: string | null
    is_required: boolean
    display_order: number
    target_anchor_id?: string | null
    visual_type?: 'door' | 'window' | 'wall-color' | 'generic' | null
    created_at: string
    updated_at: string
    options?: Array<{
      id: string
      group_id: string
      name: string
      description: string | null
      price_modifier: number
      image_url: string | null
      color_hex?: string | null
      additional_images: string[] | null
      stock_quantity: number | null
      track_inventory: boolean
      display_order: number
      created_at: string
      updated_at: string
    }>
  }>
  product_documents?: Array<{
    id: string
    name: string
    url: string
    file_type: 'pdf' | 'excel' | 'word' | 'other'
    position: number
  }>
  what_is_included?: string[] | null
  certificates_standards?: Array<{
    id: string
    title: string
    description: string
    file_url?: string
  }> | null
}

function transformProduct(
  dbProduct: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>['data']>
): ProductWithRelations {
  const detailProduct = dbProduct as ProductDetailDbProduct

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    description: dbProduct.description,
    price: dbProduct.price,
    priceType: dbProduct.price_type ?? 'unit',
    compareAtPrice: dbProduct.compare_at_price,
    stockQuantity: dbProduct.stock_quantity,
    categoryId: dbProduct.category_id,
    sellerId: dbProduct.seller_id,
    status: dbProduct.status,
    configurator_type: detailProduct.configurator_type ?? 'none',
    specifications: detailProduct.specifications as Record<string, string>,
    requireOrderRequest: detailProduct.require_order_request ?? false,
    showStock: detailProduct.show_stock ?? true,
    youtubeUrl: detailProduct.youtube_url ?? null,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
    images: detailProduct.product_images.map((img) => ({
      id: img.id,
      productId: img.product_id,
      url: img.url,
      altText: img.alt_text,
      position: img.position,
      variantCode: img.variant_code ?? null,
      variantPrice: img.variant_price ?? null,
      isMaster: img.is_master ?? false,
    })),
    category: dbProduct.categories
      ? {
          id: dbProduct.categories.id,
          name: dbProduct.categories.name,
          slug: dbProduct.categories.slug,
          description: dbProduct.categories.description,
          imageUrl: dbProduct.categories.image_url,
        }
      : { id: '', name: 'Uncategorized', slug: 'uncategorized', description: null, imageUrl: null },
    seller: dbProduct.sellers
      ? {
          id: dbProduct.sellers.id,
          businessName: dbProduct.sellers.business_name,
          businessEmail: dbProduct.sellers.business_email,
          logoUrl: dbProduct.sellers.logo_url,
          status: dbProduct.sellers.status,
        }
      : {
          id: '',
          businessName: 'Unknown Seller',
          businessEmail: '',
          logoUrl: null,
          status: 'active' as const,
        },
    hasCustomization: detailProduct.has_customization ?? false,
    customizationGroups: (detailProduct.product_customization_groups ?? [])
      .sort((a, b) => a.display_order - b.display_order)
      .map((g) => ({
        id: g.id,
        product_id: g.product_id,
        name: g.name,
        description: g.description,
        is_required: g.is_required,
        display_order: g.display_order,
        target_anchor_id: g.target_anchor_id ?? null,
        visual_type: g.visual_type ?? 'generic',
        created_at: g.created_at,
        updated_at: g.updated_at,
        options: (g.options ?? [])
          .sort((a, b) => a.display_order - b.display_order)
          .map((o) => ({
            id: o.id,
            group_id: o.group_id,
            name: o.name,
            description: o.description,
            price_modifier: o.price_modifier,
            image_url: o.image_url,
            color_hex: o.color_hex ?? null,
            additional_images: o.additional_images ?? null,
            stock_quantity: o.stock_quantity ?? null,
            track_inventory: o.track_inventory ?? false,
            display_order: o.display_order,
            created_at: o.created_at,
            updated_at: o.updated_at,
          })),
      })),
    documents: (detailProduct.product_documents ?? [])
      .sort((a, b) => a.position - b.position)
      .map((d) => ({
        id: d.id,
        name: d.name,
        url: d.url,
        fileType: d.file_type,
        position: d.position,
      })),
    whatIsIncluded: detailProduct.what_is_included ?? null,
    certificatesStandards: detailProduct.certificates_standards ?? null,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getProductBySlug(slug)
  if (result.data) {
    return {
      title: result.data.name,
      description: result.data.description ?? `${result.data.name} - ${result.data.price} CAD`,
    }
  }
  return { title: 'Product Not Found' }
}

export async function generateStaticParams() {
  return []
}
export const dynamic = 'force-dynamic'

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const result = await getProductBySlug(slug)
  let product: ProductWithRelations | null = null

  if (result.data) {
    product = transformProduct(result.data)
  } else if (result.error === 'timeout' || !result.data) {
    // Fallback to mock data during development/latency
    console.warn(`Product not found in DB or timed out (slug: ${slug}). Checking mock data...`)
    const mock = mockProducts.find((p) => p.slug === slug)
    if (mock) {
      product = mock
    }
  }

  if (!product) {
    if (result.error?.includes('Product is')) {
      console.error(
        `Product visibility issue: ${slug} is currently ${result.error.split(' ').pop()}`
      )
    } else {
      console.error(`Product not found: ${slug}`)
    }
    notFound()
  }

  let { data: configurator } = await getHouseConfigurator(product.id)

  if (!configurator && product.configurator_type === 'house') {
    const baseImageUrl = product.images?.[0]?.url ?? null
    if (baseImageUrl) {
      const { data: ensured, error: ensureError } = await ensureHouseConfigurator(
        product.id,
        baseImageUrl
      )
      if (ensureError) {
        console.error('Unable to ensure house configurator:', ensureError)
      }
      configurator = ensured ?? null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>
      <ProductDetailWrapper product={product} configurator={configurator ?? null} />
    </div>
  )
}
