import { ProductShowcase } from "./ProductShowcase";
import type { ProductWithRelations } from "@/types";

export function ProductShowcaseWrapper({
  products,
  title,
  limit,
}: {
  products: ProductWithRelations[];
  title?: string;
  limit?: number | null;
}) {
  return <ProductShowcase products={products} title={title} limit={limit} />;
}
