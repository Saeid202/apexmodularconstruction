import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProductBySlug } from "@/app/actions/products";
import { mockProducts } from "@/lib/mock-data";
import type { ProductWithRelations } from "@/types";
import { ProductDetailWrapper } from "./ProductDetailWrapper";

interface Props {
  params: Promise<{ slug: string }>;
}

function transformProduct(
  dbProduct: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>["data"]>
): ProductWithRelations {
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
    configurator_type: (dbProduct as any).configurator_type ?? 'none',
    specifications: dbProduct.specifications as Record<string, string>,
    requireOrderRequest: (dbProduct as any).require_order_request ?? false,
    showStock: (dbProduct as any).show_stock ?? true,
    youtubeUrl: (dbProduct as any).youtube_url ?? null,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
    images: dbProduct.product_images.map((img: any) => ({
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
      : { id: "", name: "Uncategorized", slug: "uncategorized", description: null, imageUrl: null },
    seller: dbProduct.sellers
      ? {
          id: dbProduct.sellers.id,
          businessName: dbProduct.sellers.business_name,
          businessEmail: dbProduct.sellers.business_email,
          logoUrl: dbProduct.sellers.logo_url,
          status: dbProduct.sellers.status,
        }
      : { id: "", businessName: "Unknown Seller", businessEmail: "", logoUrl: null, status: "active" as const },
    hasCustomization: dbProduct.has_customization ?? false,
    customizationGroups: ((dbProduct as any).product_customization_groups ?? [])
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((g: any) => ({
        id: g.id,
        product_id: g.product_id,
        name: g.name,
        description: g.description,
        is_required: g.is_required,
        display_order: g.display_order,
        created_at: g.created_at,
        updated_at: g.updated_at,
        options: (g.options ?? [])
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((o: any) => ({
            id: o.id,
            group_id: o.group_id,
            name: o.name,
            description: o.description,
            price_modifier: o.price_modifier,
            image_url: o.image_url,
            display_order: o.display_order,
            created_at: o.created_at,
            updated_at: o.updated_at,
          })),
      })),
    documents: ((dbProduct as any).product_documents ?? [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((d: any) => ({
        id: d.id,
        name: d.name,
        url: d.url,
        fileType: d.file_type,
        position: d.position,
      })),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductBySlug(slug);
  if (result.data) {
    return { title: result.data.name, description: result.data.description ?? `${result.data.name} - ${result.data.price} CAD` };
  }
  return { title: "Product Not Found" };
}

export async function generateStaticParams() { return []; }
export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await getProductBySlug(slug);
  let product: ProductWithRelations | null = null;

  if (result.data) {
    product = transformProduct(result.data);
  } else if (result.error === "timeout" || !result.data) {
    // Fallback to mock data during development/latency
    console.warn(`Product not found in DB or timed out (slug: ${slug}). Checking mock data...`);
    const mock = mockProducts.find(p => p.slug === slug);
    if (mock) {
      product = mock;
    }
  }

  if (!product) {
    if (result.error?.includes("Product is")) {
      console.error(`Product visibility issue: ${slug} is currently ${result.error.split(' ').pop()}`);
    } else {
      console.error(`Product not found: ${slug}`);
    }
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>
      <ProductDetailWrapper product={product} />
    </div>
  );
}
