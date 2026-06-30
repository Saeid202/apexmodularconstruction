"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Eye, Download, Loader2, ClipboardList, FileText, Calendar, User, Tag } from "lucide-react";
import { getAllOrdersForAgent, type AgentOrder } from "@/app/actions/agent";

const STATUS_CONFIG: Record<string, { label: string; pill: string; dot: string }> = {
  pending:     { label: "Pending",     pill: "bg-amber-100 text-amber-800 border border-amber-300",    dot: "bg-amber-400" },
  in_progress: { label: "In Progress", pill: "bg-blue-100 text-blue-800 border border-blue-300",       dot: "bg-blue-500" },
  quoted:      { label: "Quoted",      pill: "bg-violet-100 text-violet-800 border border-violet-300", dot: "bg-violet-500" },
  completed:   { label: "Completed",   pill: "bg-emerald-100 text-emerald-800 border border-emerald-300", dot: "bg-emerald-500" },
};

const FILTER_TABS = [
  { key: "all",         label: "All" },
  { key: "pending",     label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "quoted",      label: "Quoted" },
  { key: "completed",   label: "Completed" },
];

async function exportOrderPDF(order: AgentOrder) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  doc.setFontSize(16); doc.text(order.order_name, 14, 16);
  doc.setFontSize(9); doc.text(`Buyer: ${order.buyer_name ?? "—"} | ${order.buyer_email ?? "—"}`, 14, 23);
  doc.text(`Status: ${order.status} | Submitted: ${new Date(order.created_at).toLocaleDateString()}`, 14, 29);
  let y = 38;
  order.items.forEach((item, i) => {
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text(`${i + 1}. ${item.product_name}`, 14, y); y += 6;
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(`Category: ${item.category} | Qty: ${item.quantity} ${item.unit} | Priority: ${item.priority}`, 14, y); y += 5;
    if (item.target_price) { doc.text(`Target: ${item.target_price}/unit`, 14, y); y += 5; }
    if (item.specification) { doc.text(`Spec: ${item.specification}`, 14, y); y += 5; }
    if (item.reference_link) { doc.text(`Ref: ${item.reference_link}`, 14, y); y += 5; }
    y += 3;
    if (y > 270) { doc.addPage(); y = 16; }
  });
  doc.save(`rfq-${order.order_name.replace(/\s+/g, "-")}.pdf`);
}

export default function AgentOrdersPage() {
  const [orders, setOrders] = useState<AgentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAllOrdersForAgent();
    setOrders(result.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">RFQ Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {orders.length} total submission{orders.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 self-start sm:self-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === tab.key
                  ? "bg-white text-[#4B1D8F] shadow-sm font-bold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-[#4B1D8F]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-center py-24">
          <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-medium text-gray-400">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
            const highCount = order.items.filter((i) => i.priority === "high").length;
            const medCount  = order.items.filter((i) => i.priority === "medium").length;
            const lowCount  = order.items.filter((i) => i.priority === "low").length;

            return (
              <div
                key={order.id}
                className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm hover:border-[#4B1D8F]/40 hover:shadow-md transition-all"
              >
                {/* Top accent bar */}
                <div className="h-1 w-full rounded-t-2xl bg-[#4B1D8F]" />

                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">

                  {/* Left: icon + order info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="shrink-0 h-14 w-14 rounded-xl bg-[#4B1D8F] flex items-center justify-center shadow-sm">
                      <ClipboardList className="h-7 w-7 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Order name + badges */}
                      <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                        <h3 className="text-xl font-bold text-gray-900 truncate">{order.order_name}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${status.pill}`}>
                          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                        {order.has_unread_response && (
                          <span className="px-3 py-1 rounded-full text-sm font-bold bg-[#4B1D8F] text-white">
                            New Reply
                          </span>
                        )}
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-3">
                        <span className="flex items-center gap-2 text-base text-gray-700 font-semibold">
                          <User className="h-4 w-4 text-gray-400 shrink-0" />
                          {order.buyer_name ?? "Unknown"}
                        </span>
                        <span className="text-base text-gray-500">{order.buyer_email ?? "—"}</span>
                        <span className="flex items-center gap-2 text-base text-gray-500">
                          <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                          {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                      </div>

                      {/* Items + priority chips */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-2 text-base font-semibold text-gray-700">
                          <Tag className="h-4 w-4 text-gray-400 shrink-0" />
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </span>
                        {order.items.slice(0, 3).map((item, i) => (
                          <span key={i} className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            {item.product_name}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 border border-gray-200">
                            +{order.items.length - 3} more
                          </span>
                        )}
                        {highCount > 0 && (
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                            <span className="h-2 w-2 rounded-full bg-red-500" />{highCount} high
                          </span>
                        )}
                        {medCount > 0 && (
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />{medCount} medium
                          </span>
                        )}
                        {lowCount > 0 && (
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />{lowCount} low
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: action buttons */}
                  <div className="flex items-center gap-3 shrink-0 sm:pl-5 sm:border-l sm:border-gray-100">
                    <Link
                      href={`/agent/orders/${order.id}`}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-base font-bold text-white bg-[#4B1D8F] hover:bg-[#3a1570] shadow-md transition-colors whitespace-nowrap"
                    >
                      <Eye className="h-5 w-5" />
                      View & Reply
                    </Link>
                    <button
                      onClick={() => exportOrderPDF(order)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl text-base font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 transition-colors whitespace-nowrap"
                    >
                      <Download className="h-5 w-5" />
                      PDF
                    </button>
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
