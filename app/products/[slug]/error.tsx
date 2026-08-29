"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Product detail page error:", error);
  }, [error]);

  // The configurator route hides the site header and footer, so this state is
  // centred in the viewport and carries its own navigation.
  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center px-6 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6">
        We couldn&apos;t load this product. Please try again.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
        <button
          onClick={reset}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/80"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/products"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </div>
    </div>
  );
}
