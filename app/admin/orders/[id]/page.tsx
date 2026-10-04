import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { getOrderDetail } from "@/app/actions/admin-orders";

export const dynamic = "force-dynamic";

const PURPLE = "#1F2937";
const GOLD = "#D4AF37";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data: order, error } = await getOrderDetail(id);
  if (error || !order) notFound();

  const address = order.shipping_address as Record<string, string>;

  return (
    <div style={{ padding: "2rem", maxWidth: 800 }}>
      <Link href="/admin/orders" style={{ color: PURPLE, fontWeight: 600, fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: "1.5rem" }}>
        ← Back to Orders
      </Link>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <h1 style={{ color: PURPLE, fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>{order.order_number}</h1>
        <span style={{ fontSize: 13, color: "#6b7280" }}>{new Date(order.created_at).toLocaleString("en-CA")}</span>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Status", value: order.status },
          { label: "Payment", value: order.payment_status },
          { label: "Total", value: `$${order.total.toFixed(2)} CAD` },
          { label: "Stripe ID", value: order.payment_id ?? "—" },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "#fff", borderRadius: 12, padding: "1rem", border: `1px solid ${PURPLE}22` }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
            <p style={{ margin: 0, fontWeight: 700, color: PURPLE, fontSize: 15, wordBreak: "break-all" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Line items */}
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${PURPLE}22`, marginBottom: "1.5rem", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${PURPLE}11` }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.06em" }}>Line Items</h2>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#FFFBEB" }}>
              {["Product", "Variant", "Price", "Qty", "Line Total"].map((h) => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, fontSize: 12, color: PURPLE }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(order.order_items ?? []).map((item) => (
              <tr key={item.id} style={{ borderTop: `1px solid ${PURPLE}11` }}>
                <td style={{ padding: "10px 16px", fontWeight: 600 }}>{item.product_name}</td>
                <td style={{ padding: "10px 16px", color: "#6b7280" }}>{item.variant_code ?? "—"}</td>
                <td style={{ padding: "10px 16px" }}>${item.product_price.toFixed(2)}</td>
                <td style={{ padding: "10px 16px" }}>{item.quantity}</td>
                <td style={{ padding: "10px 16px", fontWeight: 700 }}>${item.line_total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "1rem 1.25rem", borderTop: `1px solid ${PURPLE}11`, display: "flex", justifyContent: "flex-end", gap: "2rem" }}>
          <span style={{ color: "#6b7280" }}>Subtotal: <strong>${order.subtotal.toFixed(2)}</strong></span>
          <span style={{ color: "#6b7280" }}>Tax: <strong>${order.tax_amount.toFixed(2)}</strong></span>
          <span style={{ color: PURPLE, fontWeight: 800 }}>Total: ${order.total.toFixed(2)} CAD</span>
        </div>
      </div>

      {/* Shipping address */}
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${PURPLE}22`, padding: "1.25rem" }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: 14, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.06em" }}>Shipping Address</h2>
        <p style={{ margin: 0, color: "#374151", lineHeight: 1.8 }}>
          {address.fullName}<br />
          {address.email} · {address.phone}<br />
          {address.addressLine1}<br />
          {address.city}, {address.province} {address.postalCode}<br />
          {address.country}
        </p>
      </div>
    </div>
  );
}
