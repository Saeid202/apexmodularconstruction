import { PrefabHero } from '@/components/home/PrefabHero'
import { ProductShowcaseWrapper } from '@/components/home/ProductShowcaseWrapper'
import { getProducts } from '@/app/actions/products'
import { getHeroSlides } from '@/app/actions/hero-slides'
import { getSiteSettings } from '@/app/actions/cms-settings'
import { mockProducts } from '@/lib/mock-data'
import type { ProductWithRelations } from '@/types'
import type { Metadata } from 'next'

// Always fetch fresh data
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Apex Modular Construction - Prefabricated Modular Homes from China to Canada',
  description:
    'Premium construction materials marketplace. Prefabricated modular homes, light steel structures, and building materials delivered from China to Canada with CSA compliance.',
  alternates: {
    canonical: '/',
  },
}

export default async function HomePage() {
  // Fetch active hero slides and site settings in parallel
  let activeSlides: any[] = []
  let heroAutoplay = false
  let heroAutoplayInterval = 5
  let productsLimit: number | null = null
  try {
    const [slidesResult, siteSettings] = await Promise.all([getHeroSlides(), getSiteSettings()])
    activeSlides = slidesResult.data ?? []
    productsLimit = siteSettings.homepage_products_limit ?? null
    heroAutoplay = siteSettings.hero_autoplay ?? false
    heroAutoplayInterval = siteSettings.hero_autoplay_interval ?? 5
  } catch (error) {
    console.error('Failed to fetch hero slide or settings:', error)
  }

  // Try to fetch from Supabase with timeout protection, fall back to mock data
  let productsResult: { data: any[] | null; error: string | null } = {
    data: null,
    error: 'Using mock data',
  }

  try {
    // Add timeout protection to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database timeout')), 3000)
    )

    const productsData = await Promise.race([getProducts({ limit: 100 }), timeoutPromise])
    productsResult = productsData as { data: any[] | null; error: string | null }
  } catch (error) {
    console.log('Home page: Using mock data due to database issues')
  }

  const dbProducts: ProductWithRelations[] =
    productsResult.data?.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      priceType: (product as any).price_type || 'unit',
      compareAtPrice: product.compare_at_price,
      stockQuantity: product.stock_quantity,
      categoryId: product.category_id,
      sellerId: product.seller_id,
      status: product.status,
      configurator_type: (product as any).configurator_type || 'none',
      specifications: product.specifications as Record<string, string>,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      images: product.product_images.map((img: any) => ({
        id: img.id,
        productId: img.product_id,
        url: img.url,
        altText: img.alt_text,
        position: img.position,
        variantCode: (img as any).variant_code ?? null,
        variantPrice: (img as any).variant_price ?? null,
        isMaster: (img as any).is_master ?? false,
      })),
      category: product.categories
        ? {
            id: product.categories.id,
            name: product.categories.name,
            slug: product.categories.slug,
            description: product.categories.description,
            imageUrl: product.categories.image_url,
            parentId: (product.categories as any).parent_id ?? null,
          }
        : {
            id: '',
            name: 'Uncategorized',
            slug: 'uncategorized',
            description: null,
            imageUrl: null,
          },
      seller: product.sellers
        ? {
            id: product.sellers.id,
            businessName: product.sellers.business_name,
            businessEmail: product.sellers.business_email,
            logoUrl: product.sellers.logo_url,
            status: product.sellers.status,
          }
        : {
            id: '',
            businessName: 'Unknown Seller',
            businessEmail: '',
            logoUrl: null,
            status: 'active' as const,
          },
      requireOrderRequest: (product as any).require_order_request ?? false,
      showStock: (product as any).show_stock ?? true,
      youtubeUrl: (product as any).youtube_url ?? null,
      hasCustomization: (product as any).has_customization ?? false,
      documents: [],
    })) ?? []
  const products: ProductWithRelations[] = dbProducts.length > 0 ? dbProducts : mockProducts
  console.log(
    'Using products:',
    dbProducts.length > 0 ? 'database' : 'mock data',
    'Count:',
    products.length
  )

  return (
    <>
      <PrefabHero
        slides={activeSlides}
        autoplay={heroAutoplay}
        autoplayInterval={heroAutoplayInterval}
      />
      <ProductShowcaseWrapper products={products} title="Projects" limit={productsLimit} />
    </>
  )
}
