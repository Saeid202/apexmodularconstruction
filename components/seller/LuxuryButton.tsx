import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Luxury gold-framed button for the Seller Centre.
 * Variants:
 *   "solid"   — deep purple fill, gold border + shimmer (primary CTA)
 *   "outline" — transparent fill, gold border (secondary)
 *   "ghost"   — no border, subtle hover (tertiary / text actions)
 */

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

type ButtonProps = BaseProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof BaseProps>;

type LinkProps = BaseProps & {
  href: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, keyof BaseProps | "href">;

const sizeMap: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-xs gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-sm gap-2",
};

function buildClasses(variant: Variant, size: Size, disabled?: boolean, extra?: string) {
  const base =
    "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 select-none overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2";

  const variants: Record<Variant, string> = {
    solid: [
      "text-white",
      "border border-[#D4AF37]",
      "shadow-[0_0_0_1px_rgba(212,175,55,0.25),0_2px_8px_rgba(31,41,55,0.35)]",
      "hover:shadow-[0_0_0_1px_rgba(212,175,55,0.6),0_4px_16px_rgba(31,41,55,0.45)]",
      "hover:brightness-110",
      "active:scale-[0.98]",
      disabled ? "opacity-50 cursor-not-allowed" : "",
    ].join(" "),

    outline: [
      "bg-transparent",
      "border border-[#D4AF37]",
      "text-[#1F2937]",
      "shadow-[0_0_0_1px_rgba(212,175,55,0.15)]",
      "hover:bg-[#D4AF37]/10",
      "hover:shadow-[0_0_0_1px_rgba(212,175,55,0.5)]",
      "active:scale-[0.98]",
      disabled ? "opacity-50 cursor-not-allowed" : "",
    ].join(" "),

    ghost: [
      "bg-transparent border-transparent text-[#1F2937]",
      "hover:bg-[#FEF3C7]",
      "active:scale-[0.98]",
      disabled ? "opacity-50 cursor-not-allowed" : "",
    ].join(" "),
  };

  return `${base} ${sizeMap[size]} ${variants[variant]} ${extra ?? ""}`.trim();
}

/** Shimmer overlay for solid variant */
function Shimmer() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent"
      style={{ animationDelay: "1s" }}
    />
  );
}

export function LuxuryButton({
  variant = "solid",
  size = "md",
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={buildClasses(variant, size, disabled || loading, className)}
      style={variant === "solid" ? { backgroundColor: "#1F2937" } : undefined}
    >
      {variant === "solid" && <Shimmer />}
      {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
      {children}
    </button>
  );
}

export function LuxuryLinkButton({
  variant = "solid",
  size = "md",
  loading,
  children,
  className,
  href,
  ...props
}: LinkProps) {
  return (
    <Link
      {...props}
      href={href}
      className={buildClasses(variant, size, false, className)}
      style={variant === "solid" ? { backgroundColor: "#1F2937" } : undefined}
    >
      {variant === "solid" && <Shimmer />}
      {children}
    </Link>
  );
}
