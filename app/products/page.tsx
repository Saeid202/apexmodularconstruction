import { Metadata } from "next";
import { ProductCatalog } from "./ProductCatalog";
import { getProducts, getCategories } from "@/app/actions/products";
import { mockProducts } from "@/lib/mock-data";
import type { ProductWithRelations, CategoryData } from "@/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Products",
  description: "Browse our catalog of construction materials and industrial robots. Quality products from trusted Chinese suppliers, shipped to Canada.",
};

// Transform database product to application type
function transformProduct(dbProduct: NonNullable<Awaited<ReturnType<typeof getProducts>>["data"]>[number]): ProductWithRelations {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    description: dbProduct.description,
    price: dbProduct.price,
    priceType: (dbProduct as any).price_type || 'unit',
    compareAtPrice: dbProduct.compare_at_price,
    stockQuantity: dbProduct.stock_quantity,
    categoryId: dbProduct.category_id,
    sellerId: dbProduct.seller_id,
    status: dbProduct.status,
    configurator_type: (dbProduct as any).configurator_type || 'none',
    specifications: dbProduct.specifications as Record<string, string>,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
    images: dbProduct.product_images.map((img) => ({
      id: img.id,
      productId: img.product_id,
      url: img.url,
      altText: img.alt_text,
      position: img.position,
      variantCode: (img as any).variant_code ?? null,
      variantPrice: (img as any).variant_price ?? null,
      isMaster: (img as any).is_master ?? false,
    })),
    category: dbProduct.categories ? {
      id: dbProduct.categories.id,
      name: dbProduct.categories.name,
      slug: dbProduct.categories.slug,
      description: dbProduct.categories.description,
      imageUrl: dbProduct.categories.image_url,
    } : { id: "", name: "Uncategorized", slug: "uncategorized", description: null, imageUrl: null },
    seller: dbProduct.sellers ? {
      id: dbProduct.sellers.id,
      businessName: dbProduct.sellers.business_name,
      businessEmail: dbProduct.sellers.business_email,
      logoUrl: dbProduct.sellers.logo_url,
      status: dbProduct.sellers.status,
    } : { id: "", businessName: "Unknown Seller", businessEmail: "", logoUrl: null, status: "active" as const },
    requireOrderRequest: (dbProduct as any).require_order_request ?? false,
    showStock: (dbProduct as any).show_stock ?? true,
    youtubeUrl: (dbProduct as any).youtube_url ?? null,
    hasCustomization: (dbProduct as any).has_customization ?? false,
    documents: [],
  };
}

export default async function ProductsPage() {
  // Try to fetch from Supabase
  const [productsResult, categoriesResult] = await Promise.all([
    getProducts({ limit: 100 }),
    getCategories(),
  ]);

  // Transform database results
  const dbProducts = productsResult.data?.map(transformProduct) ?? [];
  const products: ProductWithRelations[] = dbProducts;

  const dbCategories = categoriesResult.data?.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    imageUrl: cat.image_url,
  })) ?? [];
  const categories: CategoryData[] = dbCategories;

  return <ProductCatalog initialProducts={products} categories={categories} />;
}
