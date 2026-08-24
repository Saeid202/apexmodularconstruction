"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface Category {
  name: string;
  slug: string;
  count: number;
  subcategories?: {
    name: string;
    slug: string;
    count: number;
  }[];
}

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  defaultCategory?: string;
}

function FilterHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#D4AF37' }}>
        {children}
      </p>
      <div className="h-px w-8 rounded-full" style={{ background: 'rgba(212,175,55,0.4)' }} />
    </div>
  );
}

export function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  defaultCategory = "pre-fabricated",
}: ProductFiltersProps) {
  const isFiltered = selectedCategory !== defaultCategory || priceRange[0] > 0 || priceRange[1] < 50000;

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Auto-expand category if one of its subcategories is selected
  useEffect(() => {
    categories.forEach((cat) => {
      if (cat.subcategories) {
        const hasActiveSub = cat.subcategories.some((sub) => sub.slug === selectedCategory);
        if (hasActiveSub) {
          setExpandedCategories((prev) => ({ ...prev, [cat.slug]: true }));
        }
      }
    });
  }, [selectedCategory, categories]);

  const toggleExpand = (slug: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-soft p-6 sticky top-24 space-y-7">

      {/* Categories */}
      <div>
        <FilterHeading>Categories</FilterHeading>
        <ul className="space-y-1">
          {categories.map((cat) => (
            <li key={cat.slug} className="space-y-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    onCategoryChange(cat.slug);
                    if (cat.subcategories) {
                      toggleExpand(cat.slug);
                    }
                  }}
                  className={`flex-1 text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex justify-between items-center gap-2 ${
                    selectedCategory === cat.slug
                      ? "text-white shadow-soft"
                      : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                  }`}
                  style={selectedCategory === cat.slug ? { background: 'linear-gradient(135deg, #4B1D8F 0%, #3A1570 100%)' } : {}}
                >
                  <span className="truncate">{cat.name}</span>
                  <span
                    className="shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                    style={
                      selectedCategory === cat.slug
                        ? { background: 'rgba(255,255,255,0.2)', color: 'white' }
                        : { background: 'rgba(75,29,143,0.08)', color: '#4B1D8F' }
                    }
                  >
                    {cat.count}
                  </span>
                </button>

                {cat.subcategories && cat.subcategories.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(cat.slug);
                    }}
                    className={`p-2 rounded-xl transition-all ${
                      selectedCategory === cat.slug
                        ? "text-white hover:bg-white/10"
                        : "text-foreground/50 hover:text-primary hover:bg-primary/5"
                    }`}
                    style={selectedCategory === cat.slug ? { background: '#3A1570' } : {}}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        expandedCategories[cat.slug] ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Nested Subcategories */}
              {cat.subcategories && cat.subcategories.length > 0 && expandedCategories[cat.slug] && (
                <ul className="pl-4 mt-1 space-y-1 border-l border-gray-200 ml-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  {cat.subcategories.map((sub) => (
                    <li key={sub.slug}>
                      <button
                        onClick={() => onCategoryChange(sub.slug)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex justify-between items-center gap-2 ${
                          selectedCategory === sub.slug
                            ? "text-blue-600 bg-blue-50/50 font-semibold"
                            : "text-foreground/60 hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        <span className="truncate">{sub.name}</span>
                        <span
                          className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full"
                          style={
                            selectedCategory === sub.slug
                              ? { background: 'rgba(59,130,246,0.1)', color: '#2563eb' }
                              : { background: 'rgba(75,29,143,0.05)', color: '#4B1D8F' }
                          }
                        >
                          {sub.count}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <FilterHeading>Price Range</FilterHeading>
        <div className="px-1">
          <Slider
            min={0}
            max={50000}
            step={100}
            value={[priceRange[0], priceRange[1]]}
            onValueChange={(vals) => onPriceChange([vals[0], vals[1]])}
          />
          <div className="flex justify-between mt-3">
            <span className="text-sm font-semibold" style={{ color: '#4B1D8F' }}>
              ${priceRange[0].toLocaleString()} CAD
            </span>
            <span className="text-sm font-semibold" style={{ color: '#4B1D8F' }}>
              ${priceRange[1].toLocaleString()} CAD
            </span>
          </div>
        </div>
      </div>

      {/* Clear filters */}
      {isFiltered && (
        <button
          onClick={() => { onCategoryChange(defaultCategory); onPriceChange([0, 50000]); }}
          className="w-full text-sm font-semibold py-2.5 rounded-xl border transition-all hover:bg-[#D4AF37]/5"
          style={{ borderColor: 'rgba(212,175,55,0.5)', color: '#D4AF37' }}
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
