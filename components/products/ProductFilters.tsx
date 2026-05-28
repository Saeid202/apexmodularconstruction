"use client";

import { Slider } from "@/components/ui/slider";

interface Category {
  name: string;
  slug: string;
  count: number;
}

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
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
}: ProductFiltersProps) {
  const isFiltered = selectedCategory !== null || priceRange[0] > 0 || priceRange[1] < 50000;

  return (
    <div className="bg-white rounded-2xl border border-border shadow-soft p-6 sticky top-24 space-y-7">

      {/* Categories */}
      <div>
        <FilterHeading>Categories</FilterHeading>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onCategoryChange(null)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === null
                  ? "text-white shadow-soft"
                  : "text-foreground/70 hover:text-primary hover:bg-primary/5"
              }`}
              style={selectedCategory === null ? { background: 'linear-gradient(135deg, #4B1D8F 0%, #3a1570 100%)' } : {}}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <button
                onClick={() => onCategoryChange(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex justify-between items-center gap-2 ${
                  selectedCategory === cat.slug
                    ? "text-white shadow-soft"
                    : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                }`}
                style={selectedCategory === cat.slug ? { background: 'linear-gradient(135deg, #4B1D8F 0%, #3a1570 100%)' } : {}}
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
          onClick={() => { onCategoryChange(null); onPriceChange([0, 50000]); }}
          className="w-full text-sm font-semibold py-2.5 rounded-xl border transition-all hover:bg-[#D4AF37]/5"
          style={{ borderColor: 'rgba(212,175,55,0.5)', color: '#D4AF37' }}
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
