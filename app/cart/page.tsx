"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight, Package } from "lucide-react";
import { useCartStore, type CartItem } from "@/lib/stores/cartStore";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
} from "@/app/actions/cart";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

function formatCAD(amount: number) {
  return `$${amount.toFixed(2)} CAD`;
}

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore();
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleQuantityChange(newQty: number) {
    if (newQty < 1 || isUpdating) return;
    setIsUpdating(true);
    // Optimistic update
    updateQuantity(item.productId, item.variantCode, newQty, item.customizations, item.configurationId);
    // Sync to server (best-effort, no rollback for now)
    await updateCartItemQuantity(item.productId, item.variantCode, newQty, item.customizations, item.configurationId);
    setIsUpdating(false);
  }

  async function handleRemove() {
    if (isUpdating) return;
    setIsUpdating(true);
    // Optimistic update
    removeItem(item.productId, item.variantCode, item.customizations, item.configurationId);
    // Sync to server
    await removeCartItem(item.productId, item.variantCode, item.customizations, item.configurationId);
    setIsUpdating(false);
  }

  const lineTotal = Math.round(item.productPrice * item.quantity * 100) / 100;

  return (
    <div
      className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm"
      style={{ border: `1px solid ${PURPLE}22` }}
    >
      {/* Image */}
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50"
        style={{ border: `1.5px solid ${PURPLE}33` }}
      >
        {item.variantImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.variantImageUrl}
            alt={item.productName}
            className="h-full w-full object-contain"
          />
        ) : (
          <Package className="h-8 w-8 text-gray-300" />
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <p className="truncate font-bold text-gray-900 text-sm">{item.productName}</p>
        
        {item.configurationId && (
          <span
            className="inline-flex self-start rounded-full px-2.5 py-0.5 text-[10px] font-extrabold mt-0.5 bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider"
          >
            Custom Configured Build
          </span>
        )}

        {item.variantCode && (
          <span
            className="inline-flex self-start rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ backgroundColor: `${PURPLE}18`, color: PURPLE }}
          >
            {item.variantCode}
          </span>
        )}
        {item.customizations && Object.entries(item.customizations).length > 0 && (
          <div className="mt-0.5 space-y-0.5">
            {Object.entries(item.customizations).map(([groupId, cust]) => (
              <p key={groupId} className="text-[10px] text-gray-500 leading-tight">
                <span className="font-bold">{cust.groupName}:</span> {cust.optionName}
              </p>
            ))}
          </div>
        )}
        <p className="text-sm font-semibold" style={{ color: PURPLE }}>
          {formatCAD(item.productPrice)}
        </p>
      </div>

      {/* Quantity stepper + line total + remove */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        {/* Qty stepper */}
        <div
          className="flex items-center gap-1 rounded-xl overflow-hidden"
          style={{ border: `1.5px solid ${PURPLE}44` }}
        >
          <button
            type="button"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1 || isUpdating}
            className="flex h-8 w-8 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[2rem] text-center text-sm font-bold text-gray-900">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isUpdating}
            className="flex h-8 w-8 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Line total */}
        <p className="text-sm font-bold" style={{ color: GOLD }}>
          {formatCAD(lineTotal)}
        </p>

        {/* Remove */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={isUpdating}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50 disabled:opacity-40"
          aria-label="Remove item"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal } = useCartStore();
  const [isSyncing, setIsSyncing] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // On mount: sync from Supabase if logged in
  useEffect(() => {
    async function syncCart() {
      try {
        const supabase = createBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await getCartItems();
          if (data && data.length > 0) {
            // Populate store from server data
            const { clearCart, addItem } = useCartStore.getState();
            clearCart();
            for (const row of data) {
              if (!row.products) continue;

              // If the product is configurator-customized, use the saved configuration total price
              const customPrice = row.house_configurations 
                ? Number(row.house_configurations.total_price) 
                : (row as any).product_price ?? row.products.price;

              addItem(
                {
                  productId: row.product_id,
                  variantCode: row.variant_code,
                  variantImageUrl: row.variant_image_url,
                  productName: row.products.name,
                  productPrice: customPrice,
                  customizations: (row as any).customizations ?? undefined,
                  configurationId: row.configuration_id,
                },
                row.quantity
              );
            }
          }
        }
      } catch {
        // ignore sync errors — local state is still valid
      } finally {
        setIsSyncing(false);
      }
    }
    syncCart();
  }, []);

  async function handleProceedToCheckout() {
    if (isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login?returnUrl=/checkout");
      } else {
        router.push("/checkout");
      }
    } catch {
      router.push("/auth/login?returnUrl=/checkout");
    } finally {
      setIsCheckingOut(false);
    }
  }

  const cartSubtotal = subtotal();

  // Loading skeleton
  if (isSyncing) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200 mb-8" />
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-200" />
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-2xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: `${PURPLE}18` }}
          >
            <ShoppingCart className="h-12 w-12" style={{ color: PURPLE }} />
          </div>
          <h1 className="mb-2 text-2xl font-extrabold text-gray-900">Your cart is empty</h1>
          <p className="mb-8 text-gray-500">
            Looks like you haven&apos;t added anything yet. Browse our products to get started.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-bold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: PURPLE, border: `2px solid ${GOLD}` }}
          >
            Browse Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Page title */}
        <h1 className="mb-8 text-2xl font-extrabold text-gray-900">
          Shopping Cart{" "}
          <span className="text-base font-semibold text-gray-400">
            ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
        </h1>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px] items-start">
          {/* Cart items */}
          <div className="space-y-4">
            {items.map((item) => (
              <CartItemRow
                key={`${item.productId}-${item.variantCode ?? "null"}-${JSON.stringify(item.customizations ?? {})}`}
                item={item}
              />
            ))}

            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline"
              style={{ color: PURPLE }}
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Order summary — sticky on desktop */}
          <div className="lg:sticky lg:top-24">
            <div
              className="rounded-2xl bg-white p-6 shadow-sm"
              style={{ border: `1px solid ${PURPLE}22` }}
            >
              <h2 className="mb-5 text-lg font-extrabold text-gray-900">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatCAD(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="italic">To be confirmed</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span>
                  <span className="italic">Calculated at checkout</span>
                </div>
              </div>

              {/* Divider */}
              <div className="my-4 border-t" style={{ borderColor: `${PURPLE}22` }} />

              <div className="flex justify-between text-base font-extrabold text-gray-900 mb-6">
                <span>Estimated Total</span>
                <span style={{ color: PURPLE }}>{formatCAD(cartSubtotal)}</span>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={isCheckingOut || items.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: PURPLE, border: `2px solid ${GOLD}` }}
              >
                {isCheckingOut ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Redirecting…
                  </>
                ) : (
                  <>
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs text-gray-400">
                Secure checkout · Prices in CAD
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
