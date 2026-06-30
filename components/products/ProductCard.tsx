"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, ArrowUpRight } from "lucide-react";
import type { ProductWithRelations } from "@/types";

interface ProductCardProps {
  product: ProductWithRelations;
}

function getPriceTypeLabel(priceType: string): string {
  switch (priceType) {
    case 'sqm': return 'per SQM';
    case 'sqf': return 'per SQF';
    default:    return 'per Unit';
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images.find((img) => img.isMaster) ?? product.images[0];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const [added, setAdded] = useState(false);

  const priceLabel = product.requireOrderRequest
    ? "Request a quote"
    : `From $${product.price.toLocaleString("en-CA", { minimumFractionDigits: 0 })} CAD`;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    import("@/lib/stores/cartStore").then(({ useCartStore }) => {
      useCartStore.getState().addItem({
        productId: product.id,
        variantCode: image?.variantCode ?? null,
        variantImageUrl: image?.url ?? null,
        productName: product.name,
        productPrice: product.price,
      }, 1);
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl shadow-soft hover:shadow-elegant transition-all duration-500">

      {/* Image overlay */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        {image?.url ? (
          <img
            src={image.url}
            alt={image.altText ?? product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}

        {/* Dark gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Badges top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-white font-medium">
            {product.category.name}
          </span>
          {hasDiscount && (
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" style={{ background: '#D4AF37', color: '#3a1570' }}>
              Sale
            </span>
          )}
        </div>

        {/* Hover arrow */}
        <div className="absolute top-3 right-3 h-8 w-8 rounded-full grid place-items-center opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-white/10 backdrop-blur-md border border-white/20 text-white">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>

        {/* Bottom: title + price */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(212,175,55,0.9)' }}>
            {priceLabel}
            {!product.requireOrderRequest && (
              <span className="ml-1 text-white/50">· {getPriceTypeLabel(product.priceType)}</span>
            )}
          </p>
        </div>
      </Link>

      {/* Action buttons strip */}
      <div className="flex gap-2 p-3 bg-white border-t border-border">
        {product.requireOrderRequest ? (
          <Link
            href={`/products/${product.slug}`}
            className="flex flex-1 min-h-[36px] items-center justify-center gap-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #4B1D8F 0%, #3a1570 100%)' }}
          >
            Request a Quote
          </Link>
        ) : (
          <button
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            className="flex flex-1 min-h-[36px] items-center justify-center gap-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:brightness-110"
            style={{ background: added ? '#16a34a' : 'linear-gradient(135deg, #4B1D8F 0%, #3a1570 100%)' }}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {added ? "Added!" : "Add to Cart"}
          </button>
        )}
        <Link
          href={`/products/${product.slug}`}
          className="flex min-h-[36px] items-center justify-center rounded-xl border border-border px-3 text-xs font-semibold transition-colors hover:bg-muted"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
