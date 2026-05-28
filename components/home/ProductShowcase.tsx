"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { ProductWithRelations } from "@/types";

interface ProductShowcaseProps {
  products: ProductWithRelations[];
  title?: string;
}

type Tab = "Prefab" | "Robot";
type CardSize = "large" | "wide" | "default";

const SIZES: CardSize[] = ["large", "default", "default", "wide"];
const EASE = [0.22, 1, 0.36, 1] as const;

function filterProducts(products: ProductWithRelations[], tab: Tab) {
  return products.filter((p) => {
    const slug = p.category.slug.toLowerCase();
    if (tab === "Robot") return slug.includes("robot");
    return slug.includes("pre-fabricated") || slug.includes("prefab") || slug.includes("steel");
  });
}

export function ProductShowcase({ products }: ProductShowcaseProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Prefab");

  if (!products.length) return null;

  const filtered = filterProducts(products, activeTab).slice(0, 4);

  return (
    <section id="products" className="relative py-32 bg-secondary/10">
      <div className="container mx-auto px-6">

        {/* Header row */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium mb-4">
              Featured catalog
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold max-w-2xl leading-tight">
              Quality materials, built for{" "}
              <span className="text-gradient">Canadian projects</span>
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all duration-200"
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-10">
          {(["Prefab", "Robot"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === tab
                  ? "text-white"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {activeTab === tab && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>

        {/* Bento grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[280px]"
          >
            {filtered.length === 0 ? (
              <div className="md:col-span-3 flex items-center justify-center py-20 text-muted-foreground text-sm">
                No products in this category yet.
              </div>
            ) : (
              filtered.map((product, i) => {
                const size = SIZES[i] ?? "default";
                const image = product.images.find((img) => img.isMaster) ?? product.images[0];
                const priceLabel = product.requireOrderRequest
                  ? "Request a quote"
                  : `From $${product.price.toLocaleString("en-CA", { minimumFractionDigits: 0 })} CAD`;

                const spanClass =
                  size === "large" ? "md:row-span-2" :
                  size === "wide"  ? "md:col-span-2" : "";

                return (
                  <motion.a
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className={`group relative overflow-hidden rounded-3xl shadow-soft hover:shadow-elegant transition-all duration-500 block ${spanClass}`}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
                  >
                    {/* Product image */}
                    {image?.url ? (
                      <img
                        src={image.url}
                        alt={product.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                        No image
                      </div>
                    )}

                    {/* Dark gradient scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Category tag chip */}
                    <div className="absolute top-5 left-5">
                      <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 text-[10px] uppercase tracking-wider text-white font-medium">
                        {product.category.name}
                      </span>
                    </div>

                    {/* Bottom content row */}
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
                  </motion.a>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>

        {/* Mobile "View all" link */}
        <div className="mt-10 text-center md:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            View all products <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
