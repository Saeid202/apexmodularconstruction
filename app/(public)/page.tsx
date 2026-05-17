import { HeroSlider } from "@/components/home/HeroSlider";
import { ProductShowcaseWrapper } from "@/components/home/ProductShowcaseWrapper";
import { getHeroSlides } from "@/app/actions/hero-slides";
import { getProducts } from "@/app/actions/products";
import { mockHeroSlides, mockProducts } from "@/lib/mock-data";
import type { HeroSlideData, ProductWithRelations } from "@/types";

// Always fetch fresh data
export const revalidate = 0;

export default async function HomePage() {
  // Try to fetch from Supabase with timeout protection, fall back to mock data
  let heroResult: { data: any[] | null; error: string | null } = { data: null, error: "Using mock data" };
  let productsResult: { data: any[] | null; error: string | null } = { data: null, error: "Using mock data" };
  
  try {
    // Add timeout protection to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Database timeout")), 3000)
    );
    
    const [heroData, productsData] = await Promise.allSettled([
      Promise.race([getHeroSlides(), timeoutPromise]),
      Promise.race([getProducts({ limit: 8 }), timeoutPromise]),
    ]);
    
    if (heroData.status === 'fulfilled') {
      heroResult = heroData.value as { data: any[] | null; error: string | null };
    }
    
    if (productsData.status === 'fulfilled') {
      productsResult = productsData.value as { data: any[] | null; error: string | null };
    }
  } catch (error) {
    console.log("Home page: Using mock data due to database issues");
  }

  // Transform database results to application types or use mock data
  const dbHeroSlides: HeroSlideData[] = heroResult.data?.map((slide) => ({
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle,
    imageUrl: slide.image_url,
    ctaEnabled: (slide as any).cta_enabled ?? false,
    ctaText: slide.cta_text,
    ctaLink: slide.cta_link,
    position: slide.position,
    isActive: slide.is_active,
    // New fields for enhanced hero section
    headline: (slide as any).headline || null,
    subtext: (slide as any).subtext || null,
    benefits: (slide as any).benefits || [],
    ctaSecondaryText: (slide as any).cta_secondary_text || null,
    ctaSecondaryLink: (slide as any).cta_secondary_link || null,
    layoutType: (slide as any).layout_type || 'split',
    backgroundOverlay: (slide as any).background_overlay !== undefined ? (slide as any).background_overlay : true,
    trustLine: (slide as any).trust_line || null,
  })) ?? [];
  const heroSlides: HeroSlideData[] = dbHeroSlides.length > 0 ? dbHeroSlides : mockHeroSlides;

  const dbProducts: ProductWithRelations[] = productsResult.data?.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compare_at_price,
    stockQuantity: product.stock_quantity,
    categoryId: product.category_id,
    sellerId: product.seller_id,
    status: product.status,
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
    category: product.categories ? {
      id: product.categories.id,
      name: product.categories.name,
      slug: product.categories.slug,
      description: product.categories.description,
      imageUrl: product.categories.image_url,
    } : { id: "", name: "Uncategorized", slug: "uncategorized", description: null, imageUrl: null },
    seller: product.sellers ? {
      id: product.sellers.id,
      businessName: product.sellers.business_name,
      businessEmail: product.sellers.business_email,
      logoUrl: product.sellers.logo_url,
      status: product.sellers.status,
    } : { id: "", businessName: "Unknown Seller", businessEmail: "", logoUrl: null, status: "active" as const },
    requireOrderRequest: (product as any).require_order_request ?? false,
    showStock: (product as any).show_stock ?? true,
    youtubeUrl: (product as any).youtube_url ?? null,
    hasCustomization: (product as any).has_customization ?? false,
    documents: [],
  })) ?? [];
  const products: ProductWithRelations[] = dbProducts.length > 0 ? dbProducts : mockProducts;
  console.log("Using products:", dbProducts.length > 0 ? "database" : "mock data", "Count:", products.length);

  return (
    <>
      <HeroSlider slides={heroSlides} />
      <ProductShowcaseWrapper products={products} title="Featured Products" />
    </>
  );
}
