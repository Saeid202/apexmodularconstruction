"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, ChevronDown, Heart } from "lucide-react";
import type { ProductWithRelations } from "@/types";

interface ProductShowcaseProps {
  products: ProductWithRelations[];
  title?: string;
  limit?: number | null;
}

type Tab = "Prefab" | "Robot";

function filterProducts(products: ProductWithRelations[], tab: Tab) {
  return products.filter((p) => {
    const slug = p.category.slug.toLowerCase();
    if (tab === "Robot") return slug.includes("robot");
    return slug.includes("pre-fabricated") || slug.includes("prefab") || slug.includes("steel");
  });
}

const LOAD_MORE_STEP = 6;

export function ProductShowcase({ products, title = "Projects", limit }: ProductShowcaseProps) {
  const activeTab: Tab = "Prefab";

  if (!products.length) return null;

  const all = filterProducts(products, activeTab);
  const initialCount = limit && limit > 0 ? limit : Math.min(LOAD_MORE_STEP, all.length);
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());

  const filtered = all.slice(0, visibleCount);
  const hasMore = visibleCount < all.length;

  return (
    <section id="products" className="relative pt-24 pb-32 bg-[#FDFBF7]">
      <div className="container mx-auto px-6">

        {/* Header row */}
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] font-bold mb-3" style={{ color: '#D4AF37' }}>
              Catalog
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1a1a2e] leading-tight max-w-2xl">
              Our <span style={{ color: '#4B1D8F' }}>{title}</span>
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-0.5 w-6 shrink-0 rounded-full" style={{ background: '#D4AF37' }} />
              <p className="text-base text-gray-500 font-light">
                Browse our curated selection of prefabricated structures and industrial solutions.
              </p>
            </div>
          </div>
          <Link
            href="/products"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all duration-200"
            style={{ color: '#4B1D8F' }}
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>


        {/* Uniform 3-col grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {filtered.length === 0 ? (
              <div className="col-span-1 md:col-span-3 flex items-center justify-center py-20 text-muted-foreground text-sm">
                No products in this category yet.
              </div>
            ) : (
              filtered.map((product) => {
                const image = product.images.find((img) => img.isMaster) ?? product.images[0];
                const hoverImage = product.images.find((img) => img.id !== image?.id) ?? null;
                const isSaved = savedItems.has(product.id);
                const priceLabel = product.requireOrderRequest
                  ? "Request a quote"
                  : `From $${product.price.toLocaleString("en-CA", { minimumFractionDigits: 0 })} CAD`;

                return (
                  <a
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100 hover:shadow-elegant transition-all duration-500 h-full"
                  >
                    {/* Image Section */}
                    <div className="relative block aspect-[4/3] overflow-hidden bg-gray-50">
                      {image?.url ? (
                        <img
                          src={image.url}
                          alt={product.name}
                          loading="lazy"
                          className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${hoverImage ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'}`}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                          No image
                        </div>
                      )}
                      {hoverImage?.url && (
                        <img
                          src={hoverImage.url}
                          alt={hoverImage.altText ?? product.name}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover opacity-0 scale-100 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                        />
                      )}

                      {/* Category chip */}
                      <div className="absolute top-4 left-4 z-10">
                        <span className="rounded-full bg-white px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-800 font-bold shadow-sm">
                          {product.category.name}
                        </span>
                      </div>

                      {/* Wishlist Button top-right */}
                      <button
                        onClick={(e) => { 
                          e.preventDefault(); 
                          e.stopPropagation(); 
                          setSavedItems(prev => {
                            const next = new Set(prev);
                            if (next.has(product.id)) next.delete(product.id);
                            else next.add(product.id);
                            return next;
                          });
                        }}
                        className="absolute top-4 right-4 h-9 w-9 rounded-full flex items-center justify-center bg-white shadow-sm transition-all duration-300 z-20 hover:scale-110 active:scale-95"
                      >
                        <Heart className={`h-4.5 w-4.5 transition-colors duration-300 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                      </button>
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col flex-1 p-6">
                      <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 hover:text-[#4B1D8F] transition-colors mb-3">
                        {product.name}
                      </h3>

                      {/* House Specs Row */}
                      {(product.specifications?.Beds || product.specifications?.Baths || product.specifications?.Area) && (
                        <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] text-gray-600 font-medium">
                          {product.specifications?.Beds && <span className="flex items-center gap-1"><span className="text-sm">🛏️</span> {product.specifications.Beds} Beds</span>}
                          {product.specifications?.Beds && (product.specifications?.Baths || product.specifications?.Area) && <span className="text-gray-300">•</span>}
                          {product.specifications?.Baths && <span className="flex items-center gap-1"><span className="text-sm">🛁</span> {product.specifications.Baths} Baths</span>}
                          {product.specifications?.Baths && product.specifications?.Area && <span className="text-gray-300">•</span>}
                          {product.specifications?.Area && <span className="flex items-center gap-1"><span className="text-sm">📐</span> {product.specifications.Area} sqft</span>}
                        </div>
                      )}

                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                        <p className="text-lg font-black" style={{ color: '#4B1D8F' }}>
                          {priceLabel}
                        </p>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all group-hover:shadow-md" style={{ background: 'linear-gradient(135deg, #4B1D8F 0%, #3A1570 100%)' }}>
                          View Details <ArrowUpRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>

        {/* Load more / View all */}
        <div className="mt-12 flex flex-col items-center gap-4">
          {hasMore && (
            <motion.button
              onClick={() => setVisibleCount((v) => v + LOAD_MORE_STEP)}
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full border-2 text-sm font-semibold transition-all duration-300 hover:text-white"
              style={{ borderColor: '#4B1D8F', color: '#4B1D8F' }}
              whileHover={{ scale: 1.03, backgroundColor: '#4B1D8F' }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              Load more projects ({all.length - visibleCount} remaining)
            </motion.button>
          )}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            View full catalogue <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
