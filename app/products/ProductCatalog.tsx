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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);

  const categoriesWithCount = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      count: initialProducts.filter((p) => p.category.slug === cat.slug).length,
    }));
  }, [categories, initialProducts]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      if (selectedCategory && p.category.slug !== selectedCategory) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    });
  }, [selectedCategory, priceRange, initialProducts]);

  return (
    <div>
      {/* Page header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-6 py-10">
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
                categories={categoriesWithCount}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
              />
            </aside>

            {/* Product grid */}
            <div className="flex-1">
              {/* Count bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold" style={{ color: '#4B1D8F' }}>
                    {filteredProducts.length}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    {filteredProducts.length === 1 ? "product" : "products"} found
                    {selectedCategory && (
                      <span className="ml-1 text-gray-400">
                        · filtered from {initialProducts.length}
                      </span>
                    )}
                  </span>
                </div>
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
                    onClick={() => { setSelectedCategory(null); setPriceRange([0, 50000]); }}
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
