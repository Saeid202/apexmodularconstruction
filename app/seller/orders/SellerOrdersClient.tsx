"use client";

import { useState } from "react";
import { Package, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, MapPin, Phone, Mail, MessageSquare } from "lucide-react";
import { updateOrderRequestStatus, type OrderRequestRow } from "@/app/actions/order-requests";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

const STATUS_CONFIG = {
  pending:  { label: "Pending",  bg: "#FEF9C3", color: "#854D0E", icon: Clock },
  accepted: { label: "Accepted", bg: "#DCFCE7", color: "#166534", icon: CheckCircle },
  rejected: { label: "Rejected", bg: "#FEE2E2", color: "#991B1B", icon: XCircle },
} as const;

function StatusBadge({ status }: { status: OrderRequestRow["status"] }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function RequestCard({ req }: { req: OrderRequestRow }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(req.status);
  const [loading, setLoading] = useState(false);
  const addr = req.shipping_address as Record<string, string>;

  async function handleStatus(newStatus: "accepted" | "rejected") {
    setLoading(true);
    const result = await updateOrderRequestStatus(req.id, newStatus);
    if (!result.error) setStatus(newStatus);
    setLoading(false);
  }

  return (
    <div
      className="rounded-2xl border bg-white overflow-hidden transition-shadow hover:shadow-md"
      style={{ borderColor: `${PURPLE}22` }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: "#EDE9F6" }}
          >
            <Package className="h-5 w-5" style={{ color: PURPLE }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{req.product_name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              <span className="font-semibold" style={{ color: PURPLE }}>{req.request_number}</span>
              {" · "}
              {new Date(req.created_at).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Type tag */}
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: GOLD }}
          >
            Request
          </span>
          <StatusBadge status={status} />
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Quick summary row */}
      <div className="flex items-center gap-4 px-5 pb-3 text-xs text-gray-500 flex-wrap">
        <span>Qty: <strong className="text-gray-800">{req.quantity}</strong></span>
        {req.variant_code && <span>Variant: <strong className="text-gray-800">{req.variant_code}</strong></span>}
        {req.product_price && <span>Unit price: <strong className="text-gray-800">${req.product_price.toFixed(2)} CAD</strong></span>}
        <span>From: <strong className="text-gray-800">{req.contact_name}</strong></span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t px-5 py-4 space-y-4" style={{ borderColor: `${PURPLE}11`, backgroundColor: "#FAFAFA" }}>

          {/* Contact */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: PURPLE }}>Contact</p>
            <div className="flex flex-wrap gap-3 text-sm text-gray-700">
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-gray-400" />{req.contact_email}</span>
              {req.contact_phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gray-400" />{req.contact_phone}</span>}
            </div>
          </div>

          {/* Shipping address */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: PURPLE }}>Shipping Address</p>
            <p className="flex items-start gap-1.5 text-sm text-gray-700">
              <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
              {[addr.addressLine1, addr.city, addr.province, addr.postalCode, addr.country].filter(Boolean).join(", ")}
            </p>
          </div>

          {/* Message */}
          {req.message && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: PURPLE }}>Message</p>
              <p className="flex items-start gap-1.5 text-sm text-gray-700">
                <MessageSquare className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                {req.message}
              </p>
            </div>
          )}

          {/* Actions */}
          {status === "pending" && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleStatus("accepted")}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#16a34a" }}
              >
                <CheckCircle className="h-4 w-4" /> Accept
              </button>
              <button
                onClick={() => handleStatus("rejected")}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#dc2626" }}
              >
                <XCircle className="h-4 w-4" /> Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface Props {
  requests: OrderRequestRow[];
  fetchError: string | null;
}

export function SellerOrdersClient({ requests, fetchError }: Props) {
  const pending  = requests.filter((r) => r.status === "pending");
  const accepted = requests.filter((r) => r.status === "accepted");
  const rejected = requests.filter((r) => r.status === "rejected");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-gray-900">Orders</h1>
        {pending.length > 0 && (
          <span
            className="rounded-full px-3 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: PURPLE }}
          >
            {pending.length} pending
          </span>
        )}
      </div>

      {fetchError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠ {fetchError}
        </div>
      )}

      {requests.length === 0 && !fetchError && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <div
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-5"
            style={{ backgroundColor: "#EDE9F6" }}
          >
            <Package className="h-8 w-8" style={{ color: PURPLE }} />
          </div>
          <p className="font-semibold text-gray-900 text-lg">No orders yet</p>
          <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
            When customers place orders or submit order requests for your products, they will appear here.
          </p>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: PURPLE }}>
            Pending ({pending.length})
          </h2>
          {pending.map((r) => <RequestCard key={r.id} req={r} />)}
        </section>
      )}

      {/* Accepted */}
      {accepted.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-green-700">
            Accepted ({accepted.length})
          </h2>
          {accepted.map((r) => <RequestCard key={r.id} req={r} />)}
        </section>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-red-600">
            Rejected ({rejected.length})
          </h2>
          {rejected.map((r) => <RequestCard key={r.id} req={r} />)}
        </section>
      )}
    </div>
  );
}
