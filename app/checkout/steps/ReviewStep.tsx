"use client";

import { calculateTax } from "@/lib/tax/calculator";
import type { TaxBreakdown } from "@/lib/tax/calculator";
import type { CartItem } from "@/lib/stores/cartStore";
import type { ShippingFormData } from "./ShippingStep";

const PURPLE = "#1F2937";
const GOLD = "#D4AF37";

interface Props {
  shippingData: ShippingFormData;
  items: CartItem[];
  onBack: () => void;
  onContinue: (taxBreakdown: TaxBreakdown) => void;
}

function fmt(amount: number): string {
  return amount.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  });
}

export function ReviewStep({ shippingData, items, onBack, onContinue }: Props) {
  const subtotal = Math.round(
    items.reduce((sum, item) => sum + item.productPrice * item.quantity, 0) * 100
  ) / 100;

  const taxBreakdown = calculateTax(subtotal, shippingData.province);
  const orderTotal = taxBreakdown.total;

  function handleContinue() {
    onContinue(taxBreakdown);
  }

  return (
    <div style={{ width: "100%" }}>
      <h2 style={styles.heading}>Order Review</h2>

      {/* ── Shipping Address ─────────────────────────────────────────── */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Shipping Address</h3>
        <div style={styles.addressBox}>
          <p style={styles.addressLine}>{shippingData.fullName}</p>
          <p style={styles.addressLine}>{shippingData.addressLine1}</p>
          <p style={styles.addressLine}>
            {shippingData.city}, {shippingData.province} {shippingData.postalCode}
          </p>
          <p style={styles.addressLine}>{shippingData.email}</p>
          <p style={styles.addressLine}>{shippingData.phone}</p>
        </div>
      </section>

      {/* ── Items Table ──────────────────────────────────────────────── */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Items</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, textAlign: "left" }}>Product</th>
                <th style={styles.th}>Variant</th>
                <th style={styles.th}>Unit Price</th>
                <th style={styles.th}>Qty</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const lineTotal =
                  Math.round(item.productPrice * item.quantity * 100) / 100;
                return (
                  <tr
                    key={`${item.productId}-${item.variantCode ?? "base"}`}
                    style={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}
                  >
                    <td style={{ ...styles.td, textAlign: "left" }}>
                      {item.productName}
                    </td>
                    <td style={styles.td}>
                      {item.variantCode ?? <span style={{ color: "#9ca3af" }}>—</span>}
                    </td>
                    <td style={styles.td}>{fmt(item.productPrice)}</td>
                    <td style={styles.td}>{item.quantity}</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 600 }}>
                      {fmt(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Order Totals ─────────────────────────────────────────────── */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Order Totals</h3>
        <div style={styles.totalsBox}>
          <TotalRow label="Subtotal" value={fmt(subtotal)} />
          <TotalRow
            label={taxBreakdown.taxLabel}
            value={fmt(taxBreakdown.taxAmount)}
          />
          <TotalRow
            label="Shipping"
            value={<em style={{ color: "#6b7280" }}>To be confirmed</em>}
          />
          <div style={styles.divider} />
          <TotalRow
            label="Total"
            value={fmt(orderTotal)}
            bold
            highlight
          />
        </div>
      </section>

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <div style={styles.actions}>
        <button onClick={onBack} style={styles.backButton}>
          Back
        </button>
        <button onClick={handleContinue} style={styles.continueButton}>
          Continue to Payment
        </button>
      </div>
    </div>
  );
}

// ── TotalRow helper ───────────────────────────────────────────────────────────

interface TotalRowProps {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
  highlight?: boolean;
}

function TotalRow({ label, value, bold, highlight }: TotalRowProps) {
  return (
    <div style={styles.totalRow}>
      <span
        style={{
          ...styles.totalLabel,
          ...(bold ? { fontWeight: 700 } : {}),
          ...(highlight ? { color: PURPLE } : {}),
        }}
      >
        {label}
      </span>
      <span
        style={{
          ...styles.totalValue,
          ...(bold ? { fontWeight: 700, fontSize: "1.0625rem" } : {}),
          ...(highlight ? { color: PURPLE } : {}),
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  heading: {
    color: PURPLE,
    fontSize: "1.25rem",
    fontWeight: 700,
    marginBottom: "1.75rem",
  },
  section: {
    marginBottom: "2rem",
  },
  sectionTitle: {
    fontSize: "0.875rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: GOLD,
    marginBottom: "0.75rem",
    borderBottom: `1px solid ${GOLD}33`,
    paddingBottom: "0.375rem",
  },
  addressBox: {
    background: "#FFFBEB",
    border: `1px solid ${PURPLE}22`,
    borderRadius: "0.5rem",
    padding: "1rem 1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  addressLine: {
    margin: 0,
    fontSize: "0.9375rem",
    color: "#1a1a2e",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "0.5rem",
    border: `1px solid #e5e7eb`,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.9rem",
  },
  th: {
    padding: "0.625rem 0.875rem",
    background: PURPLE,
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.8125rem",
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "0.625rem 0.875rem",
    color: "#1a1a2e",
    textAlign: "center",
    verticalAlign: "middle",
  },
  rowEven: {
    background: "#fff",
  },
  rowOdd: {
    background: "#FFFBEB",
  },
  totalsBox: {
    background: "#FFFBEB",
    border: `1px solid ${PURPLE}22`,
    borderRadius: "0.5rem",
    padding: "1rem 1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.625rem",
    maxWidth: "360px",
    marginLeft: "auto",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
  },
  totalLabel: {
    fontSize: "0.9375rem",
    color: "#374151",
  },
  totalValue: {
    fontSize: "0.9375rem",
    color: "#1a1a2e",
  },
  divider: {
    height: "1px",
    background: `${PURPLE}22`,
    margin: "0.25rem 0",
  },
  actions: {
    display: "flex",
    gap: "1rem",
    marginTop: "2rem",
  },
  backButton: {
    flex: "0 0 auto",
    padding: "0.875rem 1.5rem",
    borderRadius: "0.5rem",
    border: `2px solid ${PURPLE}`,
    background: "transparent",
    color: PURPLE,
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
  },
  continueButton: {
    flex: 1,
    padding: "0.875rem 1.5rem",
    borderRadius: "0.5rem",
    border: "none",
    background: PURPLE,
    color: "#fff",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.01em",
    boxShadow: `0 2px 8px rgba(31,41,55,0.18)`,
    transition: "background 0.15s, box-shadow 0.15s",
  },
};
