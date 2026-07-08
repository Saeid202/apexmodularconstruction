import { ProductDetailClient } from "./ProductDetailClient";
import type { ProductWithRelations } from "@/types";

export function ProductDetailWrapper({ product }: {
  product: ProductWithRelations;
}) {
  return <ProductDetailClient product={product} />;
}
