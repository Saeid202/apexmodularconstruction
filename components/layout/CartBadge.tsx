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
      className="relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 transition-all hover:bg-gray-100 hover:text-gray-900"
      aria-label={displayCount > 0 ? `Shopping cart, ${displayCount} item${displayCount !== 1 ? "s" : ""}` : "Shopping cart"}
    >
      <ShoppingCart className="h-5 w-5" />
      {displayCount > 0 && (
        <span
          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: "#D4AF37" }}
        >
          {displayCount > 99 ? "99+" : displayCount}
        </span>
      )}
    </Link>
  );
}
