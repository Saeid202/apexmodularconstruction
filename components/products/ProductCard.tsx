"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, ArrowUpRight, Heart, ShieldCheck } from "lucide-react";
import type { ProductWithRelations } from "@/types";
import { OUT_OF_STOCK } from "@/lib/cart/errors";

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
  const hoverImage = product.images.find((img) => img.id !== image?.id) ?? null;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const [added, setAdded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const inStock = product.stockQuantity > 0;

  const priceLabel = product.requireOrderRequest
    ? "Request a quote"
    : `From $${product.price.toLocaleString("en-CA", { minimumFractionDigits: 0 })} CAD`;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (isAdding) return;

    // Cheap local guard so guests get the same rejection as authenticated users,
    // who are additionally checked against live stock by the server action.
    if (!inStock) {
      setCartError(OUT_OF_STOCK);
      setTimeout(() => setCartError(null), 2400);
      return;
    }

    setIsAdding(true);
    setCartError(null);

    const { addToCart } = await import("@/lib/cart/cartManager");
    const { error } = await addToCart({
      productId: product.id,
      variantCode: image?.variantCode ?? null,
      variantImageUrl: image?.url ?? null,
      productName: product.name,
      productPrice: product.price,
    }, 1);

    setIsAdding(false);

    if (error) {
      setCartError(error);
      setTimeout(() => setCartError(null), 2400);
      return;
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-elegant transition-all duration-500 h-full">

      {/* Image Section */}
      <div className="relative block aspect-[4/3] overflow-hidden bg-gray-50">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          {image?.url ? (
            <img
              src={image.url}
              alt={image.altText ?? product.name}
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${hoverImage ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'}`}
            />
          ) : (
            <div className="absolute inset-0 bg-muted" />
          )}
          {hoverImage?.url && (
            <img
              src={hoverImage.url}
              alt={hoverImage.altText ?? product.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-0 scale-100 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
            />
          )}
        </Link>

        {/* Badges top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          <span className="rounded-full bg-white px-2.5 py-1 text-[9px] uppercase tracking-wider text-gray-800 font-bold shadow-sm">
            {product.category.name}
          </span>
          {hasDiscount && (
            <span className="rounded-full px-2.5 py-1 text-[9px] font-bold uppercase shadow-sm" style={{ background: '#D4AF37', color: '#1a1a2e' }}>
              Sale
            </span>
          )}
        </div>

        {/* Wishlist Button top-right */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsSaved(!isSaved); }}
          className="absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center bg-white shadow-sm transition-all duration-300 z-20 hover:scale-110 active:scale-95"
        >
          <Heart className={`h-4 w-4 transition-colors duration-300 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
        </button>
      </div>

      {/* Details Section */}
      <div className="flex flex-col flex-1 p-4">
        <Link href={`/products/${product.slug}`} className="block flex-1">
          <h3 className="text-[13px] md:text-sm font-bold text-gray-900 leading-snug line-clamp-2 hover:text-[#4B1D8F] transition-colors mb-2">
            {product.name}
          </h3>

          {/* House Specs Row */}
          {(product.specifications?.Beds || product.specifications?.Baths || product.specifications?.Area) && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-[10px] md:text-xs text-gray-600 font-medium">
              {product.specifications?.Beds && <span className="flex items-center gap-1"><span className="text-sm">🛏️</span> {product.specifications.Beds} Beds</span>}
              {product.specifications?.Beds && (product.specifications?.Baths || product.specifications?.Area) && <span className="text-gray-300">•</span>}
              {product.specifications?.Baths && <span className="flex items-center gap-1"><span className="text-sm">🛁</span> {product.specifications.Baths} Baths</span>}
              {product.specifications?.Baths && product.specifications?.Area && <span className="text-gray-300">•</span>}
              {product.specifications?.Area && <span className="flex items-center gap-1"><span className="text-sm">📐</span> {product.specifications.Area} sqft</span>}
            </div>
          )}

          {/* Certificates Row */}
          {product.certificatesStandards && product.certificatesStandards.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mb-2.5">
              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                <ShieldCheck className="h-3 w-3" />
                Certified
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-1.5 mt-auto">
            <span className="text-base md:text-lg font-black" style={{ color: '#4B1D8F' }}>
              {priceLabel}
            </span>
            {!product.requireOrderRequest && (
              <span className="text-[10px] md:text-xs font-semibold text-gray-400">
                {getPriceTypeLabel(product.priceType)}
              </span>
            )}
          </div>
        </Link>
        
        {/* Action buttons strip */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-100">
          {product.requireOrderRequest ? (
            <Link
              href={`/products/${product.slug}`}
              className="flex flex-1 min-h-[36px] items-center justify-center gap-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:brightness-110 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #4B1D8F 0%, #3A1570 100%)' }}
            >
              Request a Quote
            </Link>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!inStock || isAdding}
              aria-label={`Add ${product.name} to cart`}
              className="flex flex-1 min-h-[36px] items-center justify-center gap-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: cartError
                  ? '#dc2626'
                  : added
                  ? '#16a34a'
                  : 'linear-gradient(135deg, #4B1D8F 0%, #3A1570 100%)',
              }}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {cartError
                ? cartError
                : added
                ? "Added!"
                : !inStock
                ? "Out of Stock"
                : isAdding
                ? "Adding…"
                : "Add to Cart"}
            </button>
          )}
          <Link
            href={`/products/${product.slug}`}
            className="flex min-h-[36px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 active:scale-95"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
