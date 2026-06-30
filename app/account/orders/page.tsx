import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getBuyerOrderRequests } from "@/app/actions/order-requests";
import { Package, Clock, CheckCircle, XCircle, MapPin, MessageSquare } from "lucide-react";
import type { OrderRequestRow } from "@/app/actions/order-requests";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function AccountOrdersPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: requests, error } = await getBuyerOrderRequests();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">My Orders</h1>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">⚠ {error}</div>
      )}

      {(!requests || requests.length === 0) && !error && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm py-20 text-center">
          <div
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-5"
            style={{ backgroundColor: "#EDE9F6" }}
          >
            <Package className="h-8 w-8" style={{ color: PURPLE }} />
          </div>
          <p className="font-semibold text-gray-900 text-lg">No orders yet</p>
          <p className="text-sm text-gray-400 mt-2">Your order requests will appear here once submitted.</p>
        </div>
      )}

      {requests && requests.map((req) => {
        const addr = req.shipping_address as Record<string, string>;
        return (
          <div
            key={req.id}
            className="rounded-2xl border bg-white overflow-hidden shadow-sm"
            style={{ borderColor: `${PURPLE}22` }}
          >
            {/* Header */}
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
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: GOLD }}
                >
                  Request
                </span>
                <StatusBadge status={req.status} />
              </div>
            </div>

            {/* Details */}
            <div className="border-t px-5 py-4 space-y-3 text-sm text-gray-700" style={{ borderColor: `${PURPLE}11`, backgroundColor: "#FAFAFA" }}>
              <div className="flex flex-wrap gap-4">
                <span>Qty: <strong>{req.quantity}</strong></span>
                {req.variant_code && <span>Variant: <strong>{req.variant_code}</strong></span>}
                {req.product_price && <span>Unit price: <strong>${req.product_price.toFixed(2)} CAD</strong></span>}
              </div>

              {req.message && (
                <p className="flex items-start gap-1.5 text-gray-600">
                  <MessageSquare className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                  {req.message}
                </p>
              )}

              <p className="flex items-start gap-1.5 text-gray-600">
                <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                {[addr.addressLine1, addr.city, addr.province, addr.postalCode, addr.country].filter(Boolean).join(", ")}
              </p>

              {req.status === "accepted" && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-green-800 text-xs font-semibold">
                  ✓ Your request has been accepted. The seller will contact you shortly to finalize the order.
                </div>
              )}
              {req.status === "rejected" && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-700 text-xs font-semibold">
                  ✗ This request was not accepted. Please contact us if you have questions.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
