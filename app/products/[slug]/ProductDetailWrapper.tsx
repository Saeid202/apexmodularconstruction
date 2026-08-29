import { ProductDetailClient } from "./ProductDetailClient";
import type { ProductWithRelations } from "@/types";

export function ProductDetailWrapper({ product }: {
  product: ProductWithRelations;
}) {
  // Keyed on the product so navigating between two slugs remounts the
  // configurator instead of carrying the previous build's selections over.
  return <ProductDetailClient key={product.id} product={product} />;
}
