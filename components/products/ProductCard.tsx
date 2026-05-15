"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { ProductWithRelations } from "@/types";

interface ProductCardProps {
  product: ProductWithRelations;
}

function getPriceTypeLabel(priceType: string): string {
  switch (priceType) {
    case 'sqm':
      return 'per SQM';
    case 'sqf':
      return 'per SQF';
    default:
      return 'per Unit';
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images.find((img) => img.isMaster) ?? product.images[0];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const [added, setAdded] = useState(false);

  // Debug logging for Tiles & Flooring product
  if (product.category?.name === 'Tiles & Flooring') {
    console.log('Tiles & Flooring Product Debug:', {
      productName: product.name,
      images: product.images,
      selectedImage: image,
      imageUrl: image?.url,
      hasImage: !!image?.url
    });
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    // Lazy-import the store to avoid hydration mismatch
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
    <div className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        {image?.url ? (
          <>
            {/* Debug info for Tiles & Flooring */}
            {product.category?.name === 'Tiles & Flooring' && (
              <div style={{position: 'absolute', top: '0', left: '0', background: 'red', color: 'white', fontSize: '10px', zIndex: 1000}}>
                DEBUG: Has URL
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.altText ?? product.name}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              onLoad={() => {
                if (product.category?.name === 'Tiles & Flooring') {
                  console.log('Tiles & Flooring image loaded successfully');
                }
              }}
              onError={(e) => {
                if (product.category?.name === 'Tiles & Flooring') {
                  console.error('Tiles & Flooring image failed to load:', {
                    url: image.url,
                    error: e
                  });
                }
              }}
              style={{border: product.category?.name === 'Tiles & Flooring' ? '2px solid blue' : 'none'}}
            />
          </>
        ) : (
          <>
            {/* Debug info for Tiles & Flooring */}
            {product.category?.name === 'Tiles & Flooring' && (
              <div style={{position: 'absolute', top: '0', left: '0', background: 'red', color: 'white', fontSize: '10px', zIndex: 1000}}>
                DEBUG: No URL
              </div>
            )}
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          </>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
            Sale
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3">
        <p className="text-xs text-muted-foreground mb-0.5">{product.category.name}</p>
        <Link
          href={`/products/${product.slug}`}
          className="font-medium text-sm leading-snug hover:text-primary transition-colors line-clamp-2 mb-2"
        >
          {product.name}
        </Link>


        {/* Price */}
        <div className="mt-auto">
          {product.requireOrderRequest ? (
            <span className="text-sm font-bold text-secondary">Request for a quote</span>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary">
                  ${product.price.toFixed(2)} CAD
                </span>
                {hasDiscount && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${product.compareAtPrice!.toFixed(2)}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{getPriceTypeLabel(product.priceType)}</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-2 flex gap-1.5">
          <button
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            className="flex flex-1 min-h-[36px] items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-medium text-white transition-colors"
            style={{ backgroundColor: added ? "#16a34a" : "#4B1D8F" }}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {added ? "Added!" : "Add to Cart"}
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="flex min-h-[36px] items-center justify-center rounded-lg border border-border px-2 text-xs font-medium transition-colors hover:bg-muted"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
