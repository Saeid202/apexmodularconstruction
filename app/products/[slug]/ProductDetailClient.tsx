"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Check, MessageSquare, Tag, Zap, X, ZoomIn, ChevronLeft, ChevronRight, Send, FileText, FileSpreadsheet, File, ExternalLink, Settings, Layers } from "lucide-react";
import { useCartStore } from "@/lib/stores/cartStore";
import { OrderRequestModal } from "@/components/product/OrderRequestModal";
import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import { RichTextRenderer } from "@/components/product/RichTextRenderer";
import type { ProductWithRelations, ProductImageData, CustomizationOption } from "@/types";
import { extractYouTubeId, getYouTubeEmbedUrl } from "@/lib/youtube";
import { ProductCustomizer } from "@/components/product/ProductCustomizer";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

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

export function ProductDetailClient({ product }: { product: ProductWithRelations }) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const masterImage = product.images.find((img) => img.isMaster) ?? product.images[0] ?? null;
  const variantImages = product.images.filter((img) => img.id !== masterImage?.id);
  const allImages = masterImage ? [masterImage, ...variantImages] : variantImages;

  const [activeId, setActiveId] = useState<string | null>(masterImage?.id ?? null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ready" | "custom">("ready");
  const [customSelections, setCustomSelections] = useState<Record<string, CustomizationOption>>({});

  const openLightbox = useCallback(() => {
    const idx = allImages.findIndex((img) => img.id === activeId);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  }, [activeId, allImages]);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const lightboxPrev = useCallback(() => {
    setLightboxIndex((i) => (i - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  const lightboxNext = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % allImages.length);
  }, [allImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lightboxPrev();
      if (e.key === "ArrowRight") lightboxNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, closeLightbox, lightboxPrev, lightboxNext]);

  const activeImage = allImages.find((img) => img.id === activeId) ?? masterImage;
  const activePrice = activeImage?.variantPrice != null ? activeImage.variantPrice : product.price;
  const activeCode = activeImage?.variantCode ?? null;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const inStock = product.stockQuantity > 0;
  const hasVariants = variantImages.length > 0;

  const totalCustomPrice = product.price + Object.values(customSelections).reduce((acc, opt) => acc + opt.price_modifier, 0);
  const displayPrice = activeTab === "custom" ? totalCustomPrice : activePrice;

  function buildCartItem() {
    const isCustom = activeTab === "custom";
    
    // Convert custom selections to cart metadata
    const customizations: Record<string, { groupName: string; optionName: string; priceModifier: number }> = {};
    if (isCustom) {
      Object.entries(customSelections).forEach(([groupId, opt]) => {
        const group = product.customizationGroups?.find(g => g.id === groupId);
        if (group) {
          customizations[groupId] = {
            groupName: group.name,
            optionName: opt.name,
            priceModifier: opt.price_modifier
          };
        }
      });
    }

    return {
      productId: product.id,
      variantCode: isCustom ? "Custom Build" : activeCode,
      variantImageUrl: isCustom ? (Object.values(customSelections)[0]?.image_url ?? activeImage?.url ?? null) : (activeImage?.url ?? null),
      productName: product.name,
      productPrice: displayPrice,
      customizations: isCustom ? customizations : undefined
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
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-14 w-full max-w-full">

      {/* LEFT col */}
      <div className="flex flex-col gap-3">

        {/* Name + price — mobile only, one row */}
        <div className="md:hidden flex items-baseline justify-between gap-2 flex-wrap">
          <h1 className="text-2xl font-extrabold text-gray-900 break-words">{product.name}</h1>
          {product.requireOrderRequest ? (
            <span className="text-lg font-bold" style={{ color: GOLD }}>Request for a quote</span>
          ) : (
            <div className="flex flex-col items-end">
              <span className="text-xl font-bold shrink-0" style={{ color: PURPLE }}>${displayPrice.toFixed(2)} CAD</span>
              <span className="text-sm font-bold" style={{ color: GOLD, backgroundColor: `${GOLD}15`, padding: '2px 6px', borderRadius: '4px' }}>{getPriceTypeLabel(product.priceType)}</span>
            </div>
          )}
        </div>

        {/* Image area: vertical thumbnail strip + main image side by side */}
        <div className="flex flex-col-reverse md:flex-row items-stretch gap-3 h-auto md:h-[480px]">

          {/* Thumbnail strip — horizontal on mobile, vertical on desktop */}
          {allImages.length > 1 && (
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 pr-0 md:pr-0.5 w-full md:w-[144px]" style={{ scrollbarWidth: "thin" }}>
              {allImages.map((img, idx) => {
                const isActive = img.id === activeId;
                const label = img.variantCode ? img.variantCode : `#${idx + 1}`;
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveId(img.id)}
                    className="flex shrink-0 flex-col items-center gap-1"
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    aria-label={`Select image ${label}`}
                  >
                    <div
                      className="h-20 w-20 md:h-32 md:w-32 shrink-0 overflow-hidden rounded-xl"
                      style={{
                        border: isActive ? `2.5px solid ${GOLD}` : `2px solid ${PURPLE}44`,
                        boxShadow: isActive ? `0 0 0 2px ${PURPLE}` : "none",
                        transform: isActive ? "scale(1.06)" : "scale(1)",
                        transition: "all 0.15s",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={label} className="h-full w-full object-cover bg-white" />
                    </div>
                    <span
                      className="max-w-[76px] md:max-w-[110px] truncate rounded-full px-2 py-0.5 text-[9px] md:text-[10px] font-bold text-center"
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

          {/* Main image */}
          <div
            className="relative flex-1 overflow-hidden rounded-2xl bg-white cursor-zoom-in group w-full aspect-[4/3] md:aspect-auto"
            style={{
              boxShadow: `0 0 0 1px ${PURPLE}, 0 0 0 4px ${GOLD}, 0 0 0 5px ${PURPLE}`,
              minHeight: 0,
            }}
            onClick={openLightbox}
            role="button"
            aria-label="Enlarge image"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openLightbox()}
          >
            {activeImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImage.url}
                alt={activeImage.altText ?? product.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            {/* Zoom hint overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="rounded-full p-3" style={{ backgroundColor: "rgba(75,29,143,0.7)" }}>
                <ZoomIn className="h-7 w-7 text-white" />
              </div>
            </div>
            {activeCode && (
              <span className="absolute bottom-3 right-3 rounded-lg px-2.5 py-1 text-xs font-bold text-white" style={{ backgroundColor: "rgba(75,29,143,0.85)" }}>
                {activeCode}
              </span>
            )}
          </div>

        </div>

        {/* YouTube video — shown below image gallery if present */}
        {product.youtubeUrl && (() => {
          const videoId = extractYouTubeId(product.youtubeUrl);
          if (!videoId) return null;
          return (
            <div className="mt-1">
              <div className="flex items-center gap-2 mb-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="#FF0000" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="text-sm font-bold text-gray-700">Product Video</span>
              </div>
              <div
                className="relative w-full overflow-hidden rounded-2xl"
                style={{
                  paddingBottom: "56.25%",
                  boxShadow: `0 0 0 1.5px ${PURPLE}44`,
                }}
              >
                <iframe
                  src={getYouTubeEmbedUrl(videoId)}
                  title="Product video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full rounded-2xl"
                  loading="lazy"
                />
              </div>
            </div>
          );
        })()}
      </div>

      {/* RIGHT col */}
      <div className="flex flex-col">

        {/* Name + price — desktop only */}
        <div className="hidden md:block mb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{product.name}</h1>
          <div className="flex items-baseline gap-2">
            {product.requireOrderRequest ? (
              <span className="text-2xl font-bold" style={{ color: GOLD }}>Request for a quote</span>
            ) : (
              <>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold" style={{ color: PURPLE }}>${displayPrice.toFixed(2)} CAD</span>
                  <span className="text-sm font-bold" style={{ color: GOLD, backgroundColor: `${GOLD}15`, padding: '2px 6px', borderRadius: '4px' }}>{getPriceTypeLabel(product.priceType)}</span>
                </div>
                {hasDiscount && activeTab === "ready" && activeImage?.variantPrice == null && (
                  <span className="text-base text-gray-400 line-through">${product.compareAtPrice!.toFixed(2)}</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Seller — no box, sits above category */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sold by</span>
          <span className="text-sm font-bold" style={{ color: PURPLE }}>{product.seller.businessName}</span>
        </div>

        {/* Category + Stock — same row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Category</span>
          <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: `${PURPLE}18`, color: PURPLE, border: `1px solid ${PURPLE}33` }}>
            {product.category.name}
          </span>
          {product.showStock && (
            <>
              <span className="mx-1 text-gray-300">·</span>
              {inStock
                ? <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600"><Check className="h-3.5 w-3.5" /> In Stock ({product.stockQuantity} available)</span>
                : <span className="text-xs font-medium text-red-500">Out of Stock</span>
              }
            </>
          )}
        </div>

        {/* TABS Switcher */}
        {product.hasCustomization && (
          <div className="flex p-1 bg-gray-100 rounded-2xl mb-8 border-2 border-gray-100 shadow-inner">
            <button
              onClick={() => setActiveTab("ready")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === "ready" 
                ? "bg-white text-[#4B1D8F] shadow-lg scale-100" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50 scale-95 opacity-70"
              }`}
            >
              <Zap className={`h-4 w-4 ${activeTab === "ready" ? "text-[#D4AF37]" : ""}`} />
              Ready to Buy
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === "custom" 
                ? "bg-white text-[#4B1D8F] shadow-lg scale-100" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50 scale-95 opacity-70"
              }`}
            >
              <Settings className={`h-4 w-4 ${activeTab === "custom" ? "text-[#D4AF37]" : ""}`} />
              Customize Your Build
            </button>
          </div>
        )}

        {activeTab === "ready" ? (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Description */}
            {product.description && (
              <div className="mb-5">
                <h2 className="mb-3 font-bold text-gray-900">Description</h2>
                <RichTextRenderer html={product.description} />
              </div>
            )}
          </div>
        ) : (
          <ProductCustomizer 
            groups={product.customizationGroups ?? []} 
            onSelectionChange={setCustomSelections} 
          />
        )}

        {/* Parameters / Documents bar */}
        {product.documents && product.documents.length > 0 && (
          <div className="mb-5 flex flex-col gap-2">
            {product.documents.map((doc) => {
              const Icon =
                doc.fileType === "excel" ? FileSpreadsheet
                : doc.fileType === "other" ? File
                : FileText;
              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = doc.url;
                    link.download = doc.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 text-base font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: PURPLE, border: `2px solid ${GOLD}` }}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1 truncate text-left">{doc.name}</span>
                  <div className="flex items-center gap-1 text-xs">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3M7 21l10-5M7 13l10 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-xs">Download</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Specifications */}
        {Object.entries(product.specifications as Record<string, string>).filter(([, v]) => v).length > 0 && (
          <div className="mb-5">
            <h2 className="mb-3 font-bold text-gray-900">Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 overflow-hidden rounded-xl border-2" style={{ borderColor: `${PURPLE}33` }}>
              {Object.entries(product.specifications as Record<string, string>).filter(([, v]) => v).map(([key, value], idx) => (
                <div key={key} className="flex items-center border-b last:border-b-0 sm:border-b-0 sm:even:border-l" style={{ borderColor: `${PURPLE}15` }}>
                  <div className="flex w-full items-center justify-between gap-3 px-4 py-3 min-w-0" style={{ backgroundColor: idx % 4 === 0 || idx % 4 === 3 ? "#F0EBF9" : "white" }}>
                    <span className="text-[10px] font-black uppercase tracking-widest shrink-0" style={{ color: PURPLE }}>{key.replace(/_/g, " ")}</span>
                    <span className="text-sm font-black text-right break-words" style={{ color: GOLD }}>{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Variants table */}
        {hasVariants && (
          <div className="mb-5">
            <h2 className="mb-3 font-bold text-gray-900">Product Variants</h2>
            <div className="overflow-x-auto rounded-2xl border max-w-full" style={{ borderColor: `${GOLD}55` }}>
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

        {/* CTAs */}
        <div className="mt-auto space-y-3">
          {product.requireOrderRequest ? (
            /* ── Order-request mode ── */
            <>
              {requestSuccess ? (
                <div className="flex items-center gap-3 rounded-xl p-4 text-sm font-semibold text-green-700 bg-green-50 border border-green-200">
                  <Check className="h-5 w-5 shrink-0" />
                  <span>Request <span className="font-bold">{requestSuccess}</span> submitted! The seller will be in touch.</span>
                </div>
              ) : (
                <button
                  onClick={() => setRequestModalOpen(true)}
                  disabled={!inStock}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl text-base font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: PURPLE, border: `2px solid ${GOLD}` }}
                >
                  <Send className="h-5 w-5" />
                  {inStock ? "Submit Order Request" : "Out of Stock"}
                </button>
              )}

              <WhatsAppLink
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl text-base font-bold transition-all hover:opacity-90"
                style={{ backgroundColor: "#25D366", color: "#fff", border: "2px solid #128C7E" }}
              >
                {/* WhatsApp icon */}
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </WhatsAppLink>
            </>
          ) : (
            /* ── Direct purchase mode ── */
            <>
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

              {product.configurator_type === 'house' && (
                <Link
                  href={`/products/${product.slug}/configure`}
                  className="flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl text-lg font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  style={{ 
                    background: `linear-gradient(135deg, ${PURPLE} 0%, #3a1570 100%)`, 
                    color: "white", 
                    border: `2px solid ${GOLD}` 
                  }}
                >
                  <Layers className="h-6 w-6 text-[#D4AF37] animate-pulse" />
                  Interactive Configurator
                </Link>
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
            </>
          )}
        </div>
      </div>
    </div>

      {/* Order Request Modal */}
      {requestModalOpen && (
        <OrderRequestModal
          productId={product.id}
          sellerId={product.sellerId}
          productName={product.name}
          productPrice={displayPrice}
          variantCode={activeTab === "custom" ? "Custom Build" : activeCode}
          customizations={activeTab === "custom" ? buildCartItem().customizations : undefined}
          onClose={() => setRequestModalOpen(false)}
          onSuccess={(rn) => {
            setRequestModalOpen(false);
            setRequestSuccess(rn);
          }}
        />
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.88)" }}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 rounded-full p-2 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <X className="h-7 w-7" />
          </button>

          {/* Prev button */}
          {allImages.length > 1 && (
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-9 w-9" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative flex items-center justify-center"
            style={{ width: "min(92vw, 1100px)", height: "min(88vh, 800px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={allImages[lightboxIndex]?.url}
              alt={allImages[lightboxIndex]?.altText ?? product.name}
              className="rounded-2xl object-contain shadow-2xl"
              style={{
                border: `3px solid ${GOLD}`,
                width: "min(92vw, 1100px)",
                height: "min(88vh, 800px)",
                maxWidth: "92vw",
                maxHeight: "88vh",
              }}
            />
            {/* Variant code badge */}
            {allImages[lightboxIndex]?.variantCode && (
              <span
                className="absolute bottom-3 right-3 rounded-lg px-3 py-1 text-sm font-bold text-white"
                style={{ backgroundColor: "rgba(75,29,143,0.9)" }}
              >
                {allImages[lightboxIndex].variantCode}
              </span>
            )}
          </div>

          {/* Next button */}
          {allImages.length > 1 && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
              aria-label="Next image"
            >
              <ChevronRight className="h-9 w-9" />
            </button>
          )}

          {/* Dot indicators */}
          {allImages.length > 1 && (
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  className="h-2.5 w-2.5 rounded-full transition-all focus:outline-none"
                  style={{
                    backgroundColor: idx === lightboxIndex ? GOLD : "rgba(255,255,255,0.45)",
                    transform: idx === lightboxIndex ? "scale(1.3)" : "scale(1)",
                  }}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
