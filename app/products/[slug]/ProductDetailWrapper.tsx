import { ProductDetailClient } from "./ProductDetailClient";
import type { ProductWithRelations } from "@/types";

export function ProductDetailWrapper({ product, configurator }: {
  product: ProductWithRelations;
  configurator?: any | null;
}) {
  return <ProductDetailClient product={product} configurator={configurator ?? null} />;
}
