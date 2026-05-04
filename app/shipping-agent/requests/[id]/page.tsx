"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Truck, Train, Ship, Plane, FileText,
  Download, Send, MessageSquare, CheckCircle, User, Mail, X,
} from "lucide-react";
import {
  getShippingRequestDetail, updateShippingRequestStatus,
  sendShippingAgentMessage, markShippingMessagesRead,
  type ShippingAgentRequest, type ShippingMessage,
} from "@/app/actions/shipping-agent";
import { SHIPPING_METHODS, DOC_TYPES } from "@/lib/shipping-constants";
import type { ShippingStatus } from "@/lib/shipping-constants";

const STATUS_OPTIONS: { value: ShippingStatus; label: string }[] = [
  { value: "pending",     label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed",   label: "Completed" },
];

const STATUS_CONFIG: Record<string, { pill: string; dot: string }> = {
  pending:     { pill: "bg-amber-100 text-amber-800 border border-amber-300",    dot: "bg-amber-400" },
  in_progress: { pill: "bg-blue-100 text-blue-800 border border-blue-300",       dot: "bg-blue-500" },
  completed:   { pill: "bg-emerald-100 text-emerald-800 border border-emerald-300", dot: "bg-emerald-500" },
};

const METHOD_ICONS: Record<string, React.ReactNode> = {
  rail: <Train className="h-5 w-5" />,
  sea:  <Ship className="h-5 w-5" />,
  air:  <Plane className="h-5 w-5" />,
};

export default function ShippingAgentRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<ShippingAgentRequest | null>(null);
  const [messages, setMessages] = useState<ShippingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const [statusValue, setStatusValue] = useState<ShippingStatus>("pending");
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusSaved, setStatusSaved] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const result = await getShippingRequestDetail(id);
    if (result.request) {
      setRequest(result.request);
      setStatusValue(result.request.status);
    }
    setMessages(result.messages);
    void markShippingMessagesRead(id, "shipping_agent");
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleSendMessage() {
    if (!msgText.trim()) return;
    setSending(true);
    await sendShippingAgentMessage(id, msgText.trim());
    setMsgText("");
    setSending(false);
    load();
  }

  async function handleStatusSave() {
    setSavingStatus(true);
    await updateShippingRequestStatus(id, statusValue);
    setSavingStatus(false);
    setStatusSaved(true);
    setTimeout(() => setStatusSaved(false), 2000);
    load();
  }

  if (loading) return (
    <div className="flex justify-center py-32">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#4B1D8F" }} />
    </div>
  );
  if (!request) return <div className="text-center py-20 text-gray-400 text-lg">Request not found.</div>;

  const status = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.pending;
  const methodLabel = SHIPPING_METHODS.find((m) => m.value === request.shipping_method);

  return (
    <div className="space-y-6 pb-12">
      {/* Back */}
      <Link href="/shipping-agent/requests"
        className="inline-flex items-center gap-2 text-base font-semibold text-gray-500 hover:text-[#4B1D8F] transition-colors">
        <ArrowLeft className="h-5 w-5" /> Back to Requests
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-[#4B1D8F] p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Truck className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-sm font-bold uppercase tracking-widest">Shipping Request</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{request.order_reference}</h1>
            <p className="text-purple-200 text-base">
              {new Date(request.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${status.pill}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
            {STATUS_OPTIONS.find((s) => s.value === request.status)?.label ?? request.status}
          </span>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Buyer */}
        <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-[#4B1D8F]/5 border-b-2 border-[#4B1D8F]/10 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#4B1D8F] flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-[#4B1D8F] uppercase tracking-wide">Client</h2>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="h-12 w-12 rounded-full bg-[#4B1D8F] flex items-center justify-center text-white font-bold text-lg shrink-0">
                {request.buyer_name?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <p className="font-bold text-gray-900 text-lg">{request.buyer_name ?? "—"}</p>
            </div>
            {request.buyer_email && (
              <a href={`mailto:${request.buyer_email}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors">
                <Mail className="h-5 w-5 text-blue-600 shrink-0" />
                <span className="text-base text-blue-700 font-semibold">{request.buyer_email}</span>
              </a>
            )}
          </div>
        </div>

        {/* Shipment details */}
        <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-[#4B1D8F]/5 border-b-2 border-[#4B1D8F]/10 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#4B1D8F] flex items-center justify-center">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-[#4B1D8F] uppercase tracking-wide">Shipment Details</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="grid grid-cols-2 divide-x divide-gray-100">
              <div className="px-5 py-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Origin</p>
                <p className="text-base font-bold text-gray-900">🇨🇳 {request.origin_city}</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Destination</p>
                <p className="text-base font-bold text-gray-900">🇮🇷 {request.destination_city}</p>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Shipping Method</p>
              <span className="inline-flex items-center gap-2 text-base font-bold text-gray-900">
                {METHOD_ICONS[request.shipping_method]}
                {methodLabel?.icon} {methodLabel?.label ?? request.shipping_method}
              </span>
            </div>
            {request.notes && (
              <div className="px-5 py-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-base font-medium text-gray-700">{request.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documents */}
      {request.documents.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-[#4B1D8F]/5 border-b-2 border-[#4B1D8F]/10 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#4B1D8F] flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-[#4B1D8F] uppercase tracking-wide">
              Documents ({request.documents.length})
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {request.documents.map((doc) => {
              const docTypeLabel = DOC_TYPES.find((d) => d.value === doc.doc_type)?.label ?? doc.doc_type;
              return (
                <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 px-5 py-4 rounded-xl border-2 border-gray-100 bg-gray-50 hover:bg-[#4B1D8F]/5 hover:border-[#4B1D8F]/20 transition-colors">
                  <FileText className="h-6 w-6 text-[#4B1D8F] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-gray-900 truncate">{doc.file_name}</p>
                    <p className="text-sm text-gray-500">{docTypeLabel}</p>
                  </div>
                  <Download className="h-5 w-5 text-gray-400 shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Status update */}
      <div className="bg-white rounded-2xl border-2 border-[#4B1D8F]/30 shadow-lg overflow-hidden">
        <div className="px-8 py-5 bg-[#4B1D8F] flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-[#D4AF37]" />
          <h2 className="text-xl font-bold text-white">Update Status</h2>
        </div>
        <div className="p-6 flex items-center gap-4">
          <select
            value={statusValue}
            onChange={(e) => setStatusValue(e.target.value as ShippingStatus)}
            className="flex-1 px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base font-medium text-gray-900 focus:outline-none focus:border-[#4B1D8F] bg-white transition-all"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button
            onClick={handleStatusSave}
            disabled={savingStatus || statusValue === request.status}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-white disabled:opacity-50 transition-all shadow-md"
            style={{ background: "linear-gradient(135deg, #4B1D8F, #3a1570)", border: "2px solid #D4AF37" }}
          >
            {savingStatus ? <Loader2 className="h-5 w-5 animate-spin" /> : statusSaved ? <CheckCircle className="h-5 w-5" /> : null}
            {statusSaved ? "Saved!" : "Save Status"}
          </button>
        </div>
      </div>

      {/* Message thread */}
      <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-[#4B1D8F]/5 border-b-2 border-[#4B1D8F]/10 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#4B1D8F] flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-base font-bold text-[#4B1D8F] uppercase tracking-wide">Message Thread</h2>
        </div>
        <div className="p-5 min-h-[120px] max-h-80 overflow-y-auto space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-base text-gray-400 py-8">No messages yet. Start the conversation.</p>
          ) : messages.map((msg) => {
            const isAgent = msg.sender_role === "shipping_agent";
            return (
              <div key={msg.id} className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${isAgent ? "bg-[#4B1D8F] text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                  <p className={`text-xs font-bold mb-1.5 ${isAgent ? "text-purple-200" : "text-gray-400"}`}>
                    {isAgent ? "You (Agent)" : "Client"}
                  </p>
                  {msg.message && <p className="whitespace-pre-wrap text-base">{msg.message}</p>}
                  <p className={`text-xs mt-1.5 ${isAgent ? "text-purple-300" : "text-gray-400"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div className="px-5 pb-5 flex items-end gap-3">
          <div className="flex-1 flex items-end gap-2 border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#4B1D8F] transition-colors">
            <textarea
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              rows={1}
              placeholder="Type a message… (Enter to send)"
              className="flex-1 resize-none text-base outline-none bg-transparent max-h-28 text-gray-800 placeholder-gray-400"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={sending || !msgText.trim()}
            className="h-12 w-12 flex items-center justify-center bg-[#4B1D8F] text-white rounded-xl hover:bg-[#3a1570] disabled:opacity-40 shadow-md transition-all shrink-0"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
