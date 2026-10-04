"use client";

import Link from "next/link";
import { useState } from "react";
import { updateOrderStatus } from "@/app/actions/admin-orders";
import type { AdminOrderRow } from "@/app/actions/admin-orders";

const PURPLE = "#1F2937";
const GOLD = "#D4AF37";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: "#fef9c3", color: "#854d0e" },
  processing: { bg: "#dbeafe", color: "#1e40af" },
  shipped:    { bg: "#d1fae5", color: "#065f46" },
  delivered:  { bg: "#dcfce7", color: "#14532d" },
  cancelled:  { bg: "#fee2e2", color: "#991b1b" },
  refunded:   { bg: "#f3e8ff", color: "#6b21a8" },
  paid:       { bg: "#d1fae5", color: "#065f46" },
  unpaid:     { bg: "#fee2e2", color: "#991b1b" },
};

const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] ?? { bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ ...colors, padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, display: "inline-block" }}>
      {status}
    </span>
  );
}

function StatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setSaving(true);
    setSaved(false);
    await updateOrderStatus(orderId, newStatus);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <select
        value={status}
        onChange={handleChange}
        disabled={saving}
        style={{ padding: "4px 8px", borderRadius: 8, border: `1.5px solid ${PURPLE}44`, fontSize: 13, color: PURPLE, fontWeight: 600, cursor: "pointer" }}
      >
        {VALID_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {saving && <span style={{ fontSize: 11, color: "#9ca3af" }}>Saving…</span>}
      {saved && <span style={{ fontSize: 11, color: "#16a34a" }}>✓ Saved</span>}
    </div>
  );
}

export function OrdersTable({ orders }: { orders: AdminOrderRow[] }) {
  if (orders.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
        No orders yet.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto", borderRadius: 16, border: `1px solid ${PURPLE}22`, background: "#fff" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ background: PURPLE }}>
            {["Order #", "Customer", "Date", "Total (CAD)", "Payment", "Status", "Actions"].map((h) => (
              <th key={h} style={{ padding: "12px 16px", color: "#fff", fontWeight: 700, fontSize: 12, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order, idx) => {
            const address = order.shipping_address as Record<string, string>;
            const email = address?.email ?? "—";
            return (
              <tr key={order.id} style={{ background: idx % 2 === 0 ? "#fff" : "#FFFBEB", borderBottom: `1px solid ${PURPLE}11` }}>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: PURPLE }}>{order.order_number}</td>
                <td style={{ padding: "12px 16px", color: "#374151" }}>{email}</td>
                <td style={{ padding: "12px 16px", color: "#6b7280", whiteSpace: "nowrap" }}>
                  {new Date(order.created_at).toLocaleDateString("en-CA")}
                </td>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: "#1a1a2e" }}>${order.total.toFixed(2)}</td>
                <td style={{ padding: "12px 16px" }}><StatusBadge status={order.payment_status} /></td>
                <td style={{ padding: "12px 16px" }}>
                  <StatusUpdater orderId={order.id} currentStatus={order.status} />
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Link href={`/admin/orders/${order.id}`} style={{ color: PURPLE, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                    View →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
