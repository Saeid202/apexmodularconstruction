"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import type { ProductWithRelations, CategoryData } from "@/types";

interface ProductCatalogProps {
  initialProducts: ProductWithRelations[];
  categories: CategoryData[];
}

export function ProductCatalog({ initialProducts, categories }: ProductCatalogProps) {
  const virtualCategories = useMemo(() => {
    const prefabCount = initialProducts.filter(
      (p) => p.category?.slug === "pre-fabricated" || p.category?.slug === "prefabricated"
    ).length;
    const robotCount = initialProducts.filter(
      (p) => p.category?.slug === "robots" || p.category?.slug === "robot"
    ).length;
    const otherCount = initialProducts.length - prefabCount - robotCount;

    return [
      {
        name: "Prefabricated",
        slug: "pre-fabricated",
        count: prefabCount,
      },
      {
        name: "Robot",
        slug: "robots",
        count: robotCount,
      },
      {
        name: "Other",
        slug: "other",
        count: otherCount,
      },
    ];
  }, [initialProducts]);

  const [selectedCategory, setSelectedCategory] = useState<string>("pre-fabricated");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      const slug = p.category?.slug;
      if (selectedCategory === "pre-fabricated") {
        if (slug !== "pre-fabricated" && slug !== "prefabricated") return false;
      } else if (selectedCategory === "robots") {
        if (slug !== "robots" && slug !== "robot") return false;
      } else if (selectedCategory === "other") {
        if (slug === "pre-fabricated" || slug === "prefabricated" || slug === "robots" || slug === "robot") return false;
      }
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    });
  }, [selectedCategory, priceRange, initialProducts]);

  const selectedCategoryData = useMemo(() =>
    virtualCategories.find((c) => c.slug === selectedCategory) ?? null,
  [virtualCategories, selectedCategory]);

  const isPriceFiltered = priceRange[0] > 0 || priceRange[1] < 50000;

  return (
    <div>
      {/* Page header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-6 pt-24 pb-8">
          <p className="text-xs uppercase tracking-[0.3em] font-bold mb-2" style={{ color: '#D4AF37' }}>
            Catalog
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] leading-tight">
            Our <span style={{ color: '#4B1D8F' }}>Products</span>
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-0.5 w-6 shrink-0 rounded-full" style={{ background: '#D4AF37' }} />
            <p className="text-sm text-gray-500">
              Quality construction materials shipped directly from China to Canada.
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-[#F5F4F7] min-h-screen">
        <div className="container mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Filters sidebar */}
            <aside className="lg:w-72 shrink-0">
              <ProductFilters
                categories={virtualCategories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
              />
            </aside>

            {/* Product grid */}
            <div className="flex-1">
              {/* Count bar */}
              <div className="flex items-center gap-3 mb-6">
                {selectedCategoryData && (
                  <>
                    <span className="text-sm font-bold px-3 py-1 rounded-full text-white" style={{ background: 'linear-gradient(135deg, #4B1D8F 0%, #3a1570 100%)' }}>
                      {selectedCategoryData.name}
                    </span>
                    <span className="text-gray-300">·</span>
                  </>
                )}
                <span className="text-xl font-extrabold" style={{ color: '#4B1D8F' }}>
                  {filteredProducts.length}
                </span>
                <span className="text-sm text-gray-500">
                  {filteredProducts.length === 1 ? "product" : "products"}
                  {isPriceFiltered && selectedCategoryData && (
                    <span className="text-gray-400"> of {selectedCategoryData.count}</span>
                  )}
                  {isPriceFiltered && !selectedCategoryData && (
                    <span className="text-gray-400"> of {initialProducts.length}</span>
                  )}
                </span>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="h-16 w-16 rounded-full flex items-center justify-center mb-5" style={{ background: 'rgba(75,29,143,0.08)' }}>
                    <svg className="h-7 w-7" style={{ color: '#4B1D8F' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-gray-700 mb-1">No products match your filters</p>
                  <p className="text-sm text-gray-400 mb-6">Try adjusting the category or price range</p>
                  <button
                    onClick={() => { setSelectedCategory("pre-fabricated"); setPriceRange([0, 50000]); }}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
                    style={{ background: '#4B1D8F' }}
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
