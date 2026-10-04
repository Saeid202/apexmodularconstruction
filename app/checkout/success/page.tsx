import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrderByNumber } from "@/app/actions/orders";

export const dynamic = "force-dynamic";

const PURPLE = "#1F2937";
const GOLD = "#D4AF37";

interface Props {
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order: orderNumber } = await searchParams;

  if (!orderNumber) redirect("/");

  const { data: order, error } = await getOrderByNumber(orderNumber);
  if (error || !order) redirect("/");

  const address = order.shipping_address as Record<string, string>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFBEB", padding: "3rem 1rem" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        {/* Success header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            backgroundColor: "#d1fae5", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 1.25rem", fontSize: 36,
          }}>
            ✓
          </div>
          <h1 style={{ color: PURPLE, fontSize: "1.75rem", fontWeight: 800, margin: "0 0 0.5rem" }}>
            Order Confirmed!
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem", margin: 0 }}>
            Thank you for your purchase. Your order has been received.
          </p>
        </div>

        {/* Order number */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", marginBottom: "1.25rem", border: `1px solid ${PURPLE}22`, boxShadow: "0 2px 12px rgba(31,41,55,0.06)" }}>
          <p style={{ margin: "0 0 0.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>Order Number</p>
          <p style={{ margin: 0, fontSize: "1.375rem", fontWeight: 800, color: PURPLE }}>{order.order_number}</p>
        </div>

        {/* Items */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", marginBottom: "1.25rem", border: `1px solid ${PURPLE}22`, boxShadow: "0 2px 12px rgba(31,41,55,0.06)" }}>
          <h2 style={{ margin: "0 0 1rem", fontSize: "0.875rem", fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.06em" }}>Items Ordered</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {(order.order_items ?? []).map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: "#1a1a2e", fontSize: "0.9375rem" }}>{item.product_name}</p>
                  {item.variant_code && (
                    <span style={{ fontSize: "0.8125rem", color: PURPLE, fontWeight: 600 }}>{item.variant_code}</span>
                  )}
                  <p style={{ margin: 0, fontSize: "0.8125rem", color: "#6b7280" }}>Qty: {item.quantity}</p>
                </div>
                <p style={{ margin: 0, fontWeight: 700, color: "#1a1a2e", whiteSpace: "nowrap" }}>
                  ${item.line_total.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${PURPLE}18`, marginTop: "1rem", paddingTop: "1rem", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, color: "#1a1a2e" }}>Total Charged</span>
            <span style={{ fontWeight: 800, fontSize: "1.125rem", color: PURPLE }}>${order.total.toFixed(2)} CAD</span>
          </div>
        </div>

        {/* Shipping address */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", marginBottom: "2rem", border: `1px solid ${PURPLE}22`, boxShadow: "0 2px 12px rgba(31,41,55,0.06)" }}>
          <h2 style={{ margin: "0 0 0.75rem", fontSize: "0.875rem", fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.06em" }}>Shipping To</h2>
          <p style={{ margin: 0, color: "#374151", lineHeight: 1.7 }}>
            {address.fullName}<br />
            {address.addressLine1}<br />
            {address.city}, {address.province} {address.postalCode}<br />
            {address.country}
          </p>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <Link
            href="/products"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "0.875rem 2rem", borderRadius: 12,
              backgroundColor: PURPLE, color: "#fff",
              fontWeight: 700, fontSize: "1rem", textDecoration: "none",
              border: `2px solid ${GOLD}`,
            }}
          >
            Continue Shopping
          </Link>
          <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#9ca3af" }}>
            A confirmation has been sent to {address.email}
          </p>
        </div>

      </div>
    </div>
  );
}
