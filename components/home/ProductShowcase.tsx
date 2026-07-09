"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ProductWithRelations } from "@/types";
import { Section, SectionHeader } from "@/components/ui/Section";

interface ProductShowcaseProps {
  products: ProductWithRelations[];
  title?: string;
  limit?: number | null;
}

function filterProducts(products: ProductWithRelations[]) {
  return products.filter((p) => {
    const slug = p.category.slug.toLowerCase();
    return slug.includes("pre-fabricated") || slug.includes("prefab") || slug.includes("steel");
  });
}

const LOAD_MORE_STEP = 6;

export function ProductShowcase({ products, title = "Projects", limit }: ProductShowcaseProps) {
  if (!products.length) return null;

  const all = filterProducts(products);
  const initialCount = limit && limit > 0 ? limit : Math.min(LOAD_MORE_STEP, all.length);
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const filtered = all.slice(0, visibleCount);
  const hasMore = visibleCount < all.length;

  return (
    <Section background="muted" padding="lg">
      <SectionHeader
        eyebrow="Catalog"
        heading={<>Our <span className="text-primary">{title}</span></>}
        subheading="Browse our curated selection of prefabricated structures and industrial solutions."
      >
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
        >
          View all <ArrowUpRight className="h-4 w-4" />
        </Link>
      </SectionHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-20 text-muted-foreground text-sm">
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
                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted shadow-elevation-low hover:shadow-elevation-high transition-all duration-500"
              >
                {image?.url ? (
                  <img
                    src={image.url}
                    alt={product.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                    No image
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                <div className="absolute top-4 left-4">
                  <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white font-medium">
                    {product.category.name}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-lg font-semibold text-white leading-snug line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-white/60 mt-1">{priceLabel}</p>
                </div>

                <div className="absolute bottom-5 right-5 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 grid place-items-center text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </a>
            );
          })
        )}
      </div>

      {/* Load more / View all */}
      <div className="mt-10 flex flex-col items-center gap-4">
        {hasMore && (
          <button
            onClick={() => setVisibleCount((v) => v + LOAD_MORE_STEP)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-primary text-primary text-sm font-semibold transition-all duration-300 hover:bg-primary hover:text-white active:scale-[0.98]"
          >
            Load more projects ({all.length - visibleCount} remaining)
          </button>
        )}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          View full catalogue <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}