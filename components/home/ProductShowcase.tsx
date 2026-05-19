"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import type { ProductWithRelations } from "@/types";

interface ProductShowcaseProps {
  products: ProductWithRelations[];
  title?: string;
}

export function ProductShowcase({ products, title = "Projects" }: ProductShowcaseProps) {
  const [activeTab, setActiveTab] = useState<"Prefab" | "Robot">("Prefab");

  if (!products.length) return null;

  // Filter products based on tab
  const filteredProducts = products.filter((product) => {
    const categorySlug = product.category.slug.toLowerCase();
    if (activeTab === "Robot") {
      return categorySlug.includes("robot");
    } else {
      return categorySlug.includes("pre-fabricated") || categorySlug.includes("prefab") || categorySlug.includes("steel");
    }
  });

  const displayProducts = filteredProducts;

  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <span className="inline-block mb-2 rounded-full border border-purple-300 bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-purple-700">
              Catalog
            </span>
            <h2 className="text-3xl font-extrabold text-[#1a1a2e] md:text-4xl">{title}</h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-[#4B1D8F] hover:underline whitespace-nowrap"
          >
            View all →
          </Link>
        </div>

        {/* Horizontal Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("Prefab")}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "Prefab"
                  ? "text-[#4B1D8F] border-b-2 border-[#4B1D8F]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Prefab
            </button>
            <button
              onClick={() => setActiveTab("Robot")}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "Robot"
                  ? "text-[#4B1D8F] border-b-2 border-[#4B1D8F]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Robot
            </button>
          </div>
        </div>

        {/* Grid — 4 columns, fixed card height */}
        <div
          data-testid="product-grid"
          className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
        >
          {displayProducts.map((product) => (
            <div key={product.id} className="flex flex-col h-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
