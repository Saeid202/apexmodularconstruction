"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Eye, Loader2, Truck, Train, Ship, Plane, FileText, MessageSquare } from "lucide-react";
import { getAllShippingRequestsForAgent, type ShippingAgentRequest } from "@/app/actions/shipping-agent";
import { SHIPPING_METHODS } from "@/lib/shipping-constants";

const STATUS_CONFIG: Record<string, { label: string; pill: string; dot: string }> = {
  pending:     { label: "Pending",     pill: "bg-amber-100 text-amber-800 border border-amber-300",    dot: "bg-amber-400" },
  in_progress: { label: "In Progress", pill: "bg-blue-100 text-blue-800 border border-blue-300",       dot: "bg-blue-500" },
  completed:   { label: "Completed",   pill: "bg-emerald-100 text-emerald-800 border border-emerald-300", dot: "bg-emerald-500" },
};

const METHOD_ICONS: Record<string, React.ReactNode> = {
  rail: <Train className="h-4 w-4" />,
  sea:  <Ship className="h-4 w-4" />,
  air:  <Plane className="h-4 w-4" />,
};

const FILTER_TABS = [
  { key: "all",         label: "All" },
  { key: "pending",     label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed",   label: "Completed" },
];

export default function ShippingAgentRequestsPage() {
  const [requests, setRequests] = useState<ShippingAgentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAllShippingRequestsForAgent();
    setRequests(result.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Shipping Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">{requests.length} total request{requests.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 self-start sm:self-auto">
          {FILTER_TABS.map((tab) => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === tab.key ? "bg-white text-[#4B1D8F] shadow-sm font-bold" : "text-gray-500 hover:text-gray-700"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#4B1D8F" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-center py-24">
          <Truck className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-medium text-gray-400">No requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const status = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
            const methodLabel = SHIPPING_METHODS.find((m) => m.value === req.shipping_method);
            return (
              <div key={req.id}
                className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm hover:border-[#4B1D8F]/40 hover:shadow-md transition-all">
                <div className="h-1 w-full rounded-t-2xl bg-[#4B1D8F]" />
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Left */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="shrink-0 h-14 w-14 rounded-xl bg-[#4B1D8F] flex items-center justify-center shadow-sm">
                      <Truck className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Reference + status */}
                      <div className="flex flex-wrap items-center gap-2.5 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 truncate">{req.order_reference}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${status.pill}`}>
                          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                        {req.unread_count > 0 && (
                          <span className="px-2.5 py-1 rounded-full text-sm font-bold bg-[#4B1D8F] text-white">
                            {req.unread_count} new message{req.unread_count !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-2">
                        <span className="text-base font-semibold text-gray-700">
                          {req.buyer_name ?? "Unknown"} · {req.buyer_email ?? "—"}
                        </span>
                        <span className="flex items-center gap-1.5 text-base text-gray-600 font-medium">
                          {METHOD_ICONS[req.shipping_method]}
                          {methodLabel?.label ?? req.shipping_method}
                        </span>
                        <span className="text-base text-gray-500">
                          {req.origin_city} → {req.destination_city}
                        </span>
                      </div>
                      {/* Docs + date */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {req.documents.length > 0 && (
                          <span className="flex items-center gap-1 font-semibold" style={{ color: "#4B1D8F" }}>
                            <FileText className="h-4 w-4" />
                            {req.documents.length} document{req.documents.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        <span>{new Date(req.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0 sm:pl-5 sm:border-l sm:border-gray-100">
                    <Link href={`/shipping-agent/requests/${req.id}`}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-base font-bold text-white bg-[#4B1D8F] hover:bg-[#3a1570] shadow-md transition-colors whitespace-nowrap">
                      <Eye className="h-5 w-5" /> View & Reply
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
