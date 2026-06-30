"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
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

  const filtered = all.slice(0, visibleCount);
  const hasMore = visibleCount < all.length;

  return (
    <section id="products" className="relative pt-16 pb-28 bg-secondary/10">
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
              <p className="text-base text-gray-500">
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
                const priceLabel = product.requireOrderRequest
                  ? "Request a quote"
                  : `From $${product.price.toLocaleString("en-CA", { minimumFractionDigits: 0 })} CAD`;

                return (
                  <a
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group relative aspect-[4/3] overflow-hidden rounded-3xl shadow-soft hover:shadow-elegant transition-shadow duration-500 block"
                  >
                    {/* Image */}
                    {image?.url ? (
                      <img
                        src={image.url}
                        alt={product.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{ transform: 'none', transition: 'none' }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                        No image
                      </div>
                    )}

                    {/* Dark gradient scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Category chip */}
                    <div className="absolute top-5 left-5">
                      <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 text-[10px] uppercase tracking-wider text-white font-medium">
                        {product.category.name}
                      </span>
                    </div>

                    {/* Bottom row */}
                    <div className="absolute inset-x-0 bottom-0 p-6 flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-xl font-semibold text-white leading-snug line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-white/70 mt-1">{priceLabel}</p>
                      </div>
                      <div className="h-11 w-11 shrink-0 rounded-full bg-white/10 backdrop-blur-md border border-white/20 grid place-items-center text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <ArrowUpRight className="h-4 w-4" />
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
