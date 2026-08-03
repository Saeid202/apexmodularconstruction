"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cartStore";
import { clearCartAfterOrder } from "@/lib/cart/cartManager";
import { ShippingStep, type ShippingFormData } from "./steps/ShippingStep";
import { ReviewStep } from "./steps/ReviewStep";
import { PaymentStep } from "./steps/PaymentStep";
import { createOrder } from "@/app/actions/orders";
import type { TaxBreakdown } from "@/lib/tax/calculator";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

interface Props {
  userEmail?: string;
  userName?: string;
}

const STEPS = ["Shipping", "Review", "Payment"] as const;

export function CheckoutFlow({ userEmail, userName }: Props) {
  const router = useRouter();
  const { items } = useCartStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdown | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  async function handlePaymentSuccess(paymentIntentId: string) {
    if (!shippingData || !taxBreakdown) return;
    setIsCreatingOrder(true);
    setOrderError(null);
    try {
      const result = await createOrder({
        cartItems: items,
        shippingAddress: shippingData,
        taxBreakdown,
        paymentId: paymentIntentId,
      });
      if (result.error || !result.orderNumber) {
        setOrderError(result.error ?? "Failed to create order. Please contact support.");
        setIsCreatingOrder(false);
        return;
      }
      // createOrder already deleted the server rows; this drops the local mirror.
      clearCartAfterOrder();
      router.push(`/checkout/success?order=${result.orderNumber}`);
    } catch {
      setOrderError("An unexpected error occurred. Please contact support with your payment reference.");
      setIsCreatingOrder(false);
    }
  }

  const totalCents = taxBreakdown ? Math.round(taxBreakdown.total * 100) : 0;
  const totalDisplay = taxBreakdown ? `$${taxBreakdown.total.toFixed(2)} CAD` : "";

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
      {/* Progress indicator */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "2.5rem", gap: 0 }}>
        {STEPS.map((label, idx) => {
          const num = idx + 1;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", flex: idx < 2 ? 1 : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 14,
                  backgroundColor: isDone ? GOLD : isActive ? PURPLE : "#e5e7eb",
                  color: isDone || isActive ? "#fff" : "#9ca3af",
                  border: isActive ? `2px solid ${GOLD}` : "none",
                  transition: "all 0.2s",
                }}>
                  {isDone ? "✓" : num}
                </div>
                <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? PURPLE : "#6b7280", whiteSpace: "nowrap" }}>
                  {label}
                </span>
              </div>
              {idx < 2 && (
                <div style={{ flex: 1, height: 2, backgroundColor: isDone ? GOLD : "#e5e7eb", margin: "0 8px", marginBottom: 18, transition: "background 0.2s" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", boxShadow: "0 2px 16px rgba(75,29,143,0.08)", border: `1px solid ${PURPLE}18` }}>
        {step === 1 && (
          <ShippingStep
            initialData={shippingData ?? (userEmail || userName ? {
              fullName: userName ?? "",
              email: userEmail ?? "",
              phone: "",
              addressLine1: "",
              city: "",
              province: "ON",
              postalCode: "",
            } : undefined)}
            onComplete={(data) => { setShippingData(data); setStep(2); }}
          />
        )}

        {step === 2 && shippingData && (
          <ReviewStep
            shippingData={shippingData}
            items={items}
            onBack={() => setStep(1)}
            onContinue={(tb) => { setTaxBreakdown(tb); setStep(3); }}
          />
        )}

        {step === 3 && taxBreakdown && (
          <>
            {orderError && (
              <div style={{ padding: "0.875rem 1rem", borderRadius: 8, background: "#fef2f2", border: "1.5px solid #fca5a5", color: "#b91c1c", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
                {orderError}
              </div>
            )}
            {isCreatingOrder ? (
              <div style={{ textAlign: "center", padding: "3rem 0", color: PURPLE, fontWeight: 600 }}>
                <div style={{ width: 32, height: 32, border: `3px solid ${PURPLE}33`, borderTopColor: PURPLE, borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 1rem" }} />
                Creating your order…
              </div>
            ) : (
              <PaymentStep
                totalCents={totalCents}
                totalDisplay={totalDisplay}
                onBack={() => setStep(2)}
                onSuccess={handlePaymentSuccess}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
