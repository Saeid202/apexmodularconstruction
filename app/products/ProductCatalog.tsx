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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const virtualCategories = useMemo(() => {
    const prefabCount = initialProducts.filter(
      (p) => p.category?.slug === "pre-fabricated" || p.category?.slug === "prefabricated"
    ).length;

    return [
      {
        name: "Prefabricated",
        slug: "pre-fabricated",
        count: prefabCount,
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
      {/* Ultra Compact Header */}
      <div className="bg-white border-b border-gray-100 relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent pointer-events-none"></div>

        <div className="container mx-auto px-4 py-2.5 md:px-6 md:py-4 flex flex-col items-center text-center transition-all duration-300 relative z-10">
          <h1 className="text-xl md:text-3xl font-extrabold text-[#1a1a2e] tracking-tight">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4B1D8F] to-[#7c3aed]">Products</span>
          </h1>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-[#F5F4F7] min-h-screen">
        {/* Sticky Mobile Filter Bar */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-border/50 lg:hidden shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-[#1a1a2e]">{filteredProducts.length}</span>
              <span className="text-xs text-gray-500 font-medium">products</span>
            </div>
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white transition-transform active:scale-95 shadow-md"
              style={{ background: 'linear-gradient(135deg, #4B1D8F 0%, #3A1570 100%)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filter & Sort
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-10">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Desktop Filters sidebar */}
            <aside className="hidden lg:block lg:w-72 shrink-0">
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
              <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                {selectedCategoryData && (
                  <>
                    <span className="text-sm font-bold px-4 py-1.5 rounded-xl text-white shadow-md shadow-purple-900/20" style={{ background: 'linear-gradient(135deg, #4B1D8F 0%, #3A1570 100%)' }}>
                      {selectedCategoryData.name}
                    </span>
                    <span className="text-gray-200 font-black">/</span>
                  </>
                )}
                <span className="text-xl font-extrabold" style={{ color: '#4B1D8F' }}>
                  {filteredProducts.length}
                </span>
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                  {filteredProducts.length === 1 ? "Product" : "Products"}
                  {isPriceFiltered && selectedCategoryData && (
                    <span className="text-gray-400"> of {selectedCategoryData.count}</span>
                  )}
                  {isPriceFiltered && !selectedCategoryData && (
                    <span className="text-gray-400"> of {initialProducts.length}</span>
                  )}
                </span>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
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

      {/* Mobile Filters Bottom Sheet */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-full max-h-[85vh] overflow-y-auto bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1a1a2e]">Filters</h3>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 pb-safe">
              <ProductFilters
                categories={virtualCategories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
              />
              <div className="mt-8 pt-4 border-t sticky bottom-0 bg-white">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-purple-900/20 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #4B1D8F 0%, #3A1570 100%)' }}
                >
                  Show {filteredProducts.length} Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
