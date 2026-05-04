"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check, MessageSquare, Tag, Zap } from "lucide-react";
import { useCartStore } from "@/lib/stores/cartStore";
import type { ProductWithRelations, ProductImageData } from "@/types";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

export function ProductDetailClient({ product }: { product: ProductWithRelations }) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const masterImage = product.images.find((img) => img.isMaster) ?? product.images[0] ?? null;
  const variantImages = product.images.filter((img) => img.id !== masterImage?.id);
  const allImages = masterImage ? [masterImage, ...variantImages] : variantImages;

  const [activeId, setActiveId] = useState<string | null>(masterImage?.id ?? null);
  const [addedToCart, setAddedToCart] = useState(false);

  const activeImage = allImages.find((img) => img.id === activeId) ?? masterImage;
  const activePrice = activeImage?.variantPrice != null ? activeImage.variantPrice : product.price;
  const activeCode = activeImage?.variantCode ?? null;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const inStock = product.stockQuantity > 0;
  const hasVariants = variantImages.length > 0;

  function buildCartItem() {
    return {
      productId: product.id,
      variantCode: activeCode,
      variantImageUrl: activeImage?.url ?? null,
      productName: product.name,
      productPrice: activePrice,
    };
  }

  function handleAddToCart() {
    if (!inStock) return;
    addItem(buildCartItem(), 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleBuyNow() {
    if (!inStock) return;
    addItem(buildCartItem(), 1);
    router.push("/checkout");
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 lg:gap-14">

      {/* LEFT col */}
      <div className="flex flex-col gap-3">

        {/* Name + price — mobile only, one row */}
        <div className="md:hidden flex items-baseline justify-between gap-2 flex-wrap">
          <h1 className="text-2xl font-extrabold text-gray-900">{product.name}</h1>
          <span className="text-xl font-bold shrink-0" style={{ color: PURPLE }}>${activePrice.toFixed(2)} CAD</span>
        </div>

        {/* Main image */}
        <div
          className="relative overflow-hidden rounded-2xl bg-white"
          style={{ boxShadow: `0 0 0 1px ${PURPLE}, 0 0 0 4px ${GOLD}, 0 0 0 5px ${PURPLE}`, height: 480 }}
        >
          {activeImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeImage.url}
              alt={activeImage.altText ?? product.name}
              className="w-full h-full object-cover"
              style={{ minHeight: 280, maxHeight: 520 }}
            />
          )}
          {activeCode && (
            <span className="absolute bottom-3 right-3 rounded-lg px-2.5 py-1 text-xs font-bold text-white" style={{ backgroundColor: "rgba(75,29,143,0.85)" }}>
              {activeCode}
            </span>
          )}
        </div>

        {/* Thumbnail strip */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allImages.map((img, idx) => {
              const isActive = img.id === activeId;
              const label = img.variantCode ? `#${idx + 1} ${img.variantCode}` : `#${idx + 1}`;
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveId(img.id)}
                  className="flex shrink-0 flex-col items-center gap-1"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  <div
                    className="h-16 w-16 overflow-hidden rounded-xl"
                    style={{
                      border: isActive ? `2.5px solid ${GOLD}` : `2px solid ${PURPLE}44`,
                      boxShadow: isActive ? `0 0 0 2px ${PURPLE}` : "none",
                      transform: isActive ? "scale(1.06)" : "scale(1)",
                      transition: "all 0.15s",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={label} className="h-full w-full object-contain bg-white" />
                  </div>
                  <span
                    className="max-w-[80px] truncate rounded-full px-1.5 py-0.5 text-[10px] font-bold text-center"
                    style={{
                      backgroundColor: isActive ? PURPLE : "#EDE9F6",
                      color: isActive ? "white" : PURPLE,
                    }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT col */}
      <div className="flex flex-col">

        {/* Name + price — desktop only */}
        <div className="hidden md:block mb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{product.name}</h1>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold" style={{ color: PURPLE }}>${activePrice.toFixed(2)} CAD</span>
            {hasDiscount && activeImage?.variantPrice == null && (
              <span className="text-base text-gray-400 line-through">${product.compareAtPrice!.toFixed(2)}</span>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Category</span>
          <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: `${PURPLE}18`, color: PURPLE, border: `1px solid ${PURPLE}33` }}>
            {product.category.name}
          </span>
        </div>

        {/* Selected variant */}
        {hasVariants && activeCode && (
          <div className="mb-4 inline-flex items-center gap-2 self-start rounded-xl px-3 py-1.5 text-sm font-semibold" style={{ backgroundColor: "#EDE9F6", color: PURPLE }}>
            <Tag className="h-3.5 w-3.5" />
            Selected: <span style={{ color: GOLD }}>{activeCode}</span>
          </div>
        )}

        {/* Stock */}
        <div className="mb-5">
          {inStock
            ? <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600"><Check className="h-4 w-4" /> In Stock ({product.stockQuantity} available)</span>
            : <span className="text-sm font-medium text-red-500">Out of Stock</span>
          }
        </div>

        {/* Description */}
        {product.description && (
          <div className="mb-5">
            <h2 className="mb-2 font-bold text-gray-900">Description</h2>
            <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>
          </div>
        )}

        {/* Specifications */}
        {Object.entries(product.specifications as Record<string, string>).filter(([, v]) => v).length > 0 && (
          <div className="mb-5">
            <h2 className="mb-3 font-bold text-gray-900">Specifications</h2>
            <div className="flex w-full overflow-hidden rounded-xl border-2" style={{ borderColor: `${PURPLE}33` }}>
              {Object.entries(product.specifications as Record<string, string>).filter(([, v]) => v).map(([key, value], idx, arr) => (
                <div key={key} className="flex flex-1 items-center">
                  <div className="flex w-full items-center gap-3 px-4 py-2" style={{ backgroundColor: idx % 2 === 0 ? "#F0EBF9" : "white" }}>
                    <span className="whitespace-nowrap text-xs font-extrabold uppercase tracking-widest" style={{ color: PURPLE }}>{key.replace(/_/g, " ")}</span>
                    <span className="whitespace-nowrap text-base font-extrabold" style={{ color: GOLD }}>{value}</span>
                  </div>
                  {idx < arr.length - 1 && <span className="w-0.5 flex-shrink-0 self-stretch" style={{ backgroundColor: `${PURPLE}33` }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Variants table */}
        {hasVariants && (
          <div className="mb-5">
            <h2 className="mb-3 font-bold text-gray-900">Product Variants</h2>
            <div className="overflow-hidden rounded-2xl border" style={{ borderColor: `${GOLD}55` }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #3a1570 100%)` }}>
                    <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-white">Code</th>
                    <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-white">Price (CAD)</th>
                    <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-white">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allImages.map((img, idx) => (
                    <tr key={img.id} className="cursor-pointer" style={{ backgroundColor: img.id === activeId ? "#EDE9F6" : "white" }} onClick={() => setActiveId(img.id)}>
                      <td className="px-4 py-2.5 font-bold" style={{ color: idx === 0 ? GOLD : PURPLE }}>{img.variantCode ?? (idx === 0 ? "Main" : `Image ${idx + 1}`)}</td>
                      <td className="px-4 py-2.5 text-gray-700">${(img.variantPrice ?? product.price).toFixed(2)}{img.variantPrice == null && idx > 0 && <span className="ml-1 text-xs text-gray-400">(same as master)</span>}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: idx === 0 ? GOLD : PURPLE }}>{idx === 0 ? "★ Master" : "Variant"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Seller */}
        <div className="mb-5 rounded-xl p-4" style={{ backgroundColor: "#EDE9F6" }}>
          <p className="text-xs text-gray-500">Sold by</p>
          <p className="text-sm font-bold" style={{ color: PURPLE }}>{product.seller.businessName}</p>
        </div>

        {/* CTAs */}
        <div className="mt-auto space-y-3">
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl text-base font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: addedToCart ? "#16a34a" : PURPLE, border: `2px solid ${GOLD}` }}
          >
            {addedToCart ? (
              <><Check className="h-5 w-5" /> Added to Cart!</>
            ) : (
              <><ShoppingCart className="h-5 w-5" />{inStock ? "Add to Cart" : "Out of Stock"}</>
            )}
          </button>

          {inStock && (
            <button
              onClick={handleBuyNow}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl text-base font-bold transition-all hover:opacity-90"
              style={{ backgroundColor: GOLD, color: "#1a1a2e", border: `2px solid ${PURPLE}` }}
            >
              <Zap className="h-5 w-5" />
              Buy Now
            </button>
          )}

          {hasVariants && activeCode && (
            <a
              href={`/contact?subject=Quote request for ${activeCode}`}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border-2 text-sm font-bold transition-all hover:bg-[#EDE9F6]"
              style={{ borderColor: GOLD, color: PURPLE }}
            >
              <MessageSquare className="h-4 w-4" />
              Request Quote for <span style={{ color: GOLD }}>{activeCode}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
