"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/stores/cartStore";

export function CartBadge() {
  const count = useCartStore((s) => s.itemCount());
  // Avoid hydration mismatch — only show badge after client hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const displayCount = mounted ? count : 0;

  return (
    <Link
      href="/cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#1F2937]/30 bg-[#1F2937]/10 text-[#1F2937] shadow-sm transition-colors hover:bg-[#1F2937] hover:text-white"
      aria-label={displayCount > 0 ? `Shopping cart, ${displayCount} item${displayCount !== 1 ? "s" : ""}` : "Shopping cart"}
    >
      <ShoppingCart className="h-5 w-5" strokeWidth={2.25} />
      {displayCount > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white px-1 text-[10px] font-bold"
          style={{ backgroundColor: "#F59E0B", color: "#1F2937" }}
        >
          {displayCount > 99 ? "99+" : displayCount}
        </span>
      )}
    </Link>
  );
}
