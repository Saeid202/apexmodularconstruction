"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Download, Send, Paperclip, FileText, Loader2,
  User, Phone, Mail, Package, MessageSquare, ClipboardList, X, CheckCircle
} from "lucide-react";
import {
  getOrderDetailForAgent, submitAgentResponse, getOrderMessages,
  sendAgentMessage, markOrderMessagesRead, updateOrderStatus,
  type AgentOrder, type AgentResponse, type AgentMessage,
} from "@/app/actions/agent";

const STATUS_OPTIONS = ["pending", "in_progress", "quoted", "completed"];
const STATUS_CONFIG: Record<string, { label: string; pill: string; dot: string }> = {
  pending:     { label: "Pending",     pill: "bg-amber-100 text-amber-800 border border-amber-300",    dot: "bg-amber-400" },
  in_progress: { label: "In Progress", pill: "bg-blue-100 text-blue-800 border border-blue-300",       dot: "bg-blue-500" },
  quoted:      { label: "Quoted",      pill: "bg-violet-100 text-violet-800 border border-violet-300", dot: "bg-violet-500" },
  completed:   { label: "Completed",   pill: "bg-emerald-100 text-emerald-800 border border-emerald-300", dot: "bg-emerald-500" },
};

const fieldLabel = "block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide";
const inp = "w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#4B1D8F] focus:ring-2 focus:ring-[#4B1D8F]/10 bg-white transition-all";

export default function AgentOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<AgentOrder | null>(null);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const [supplierName, setSupplierName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [leadTime, setLeadTime] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("in_progress");
  const [quoteFiles, setQuoteFiles] = useState<File[]>([]);
  const [savingQuote, setSavingQuote] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [msgText, setMsgText] = useState("");
  const [msgFiles, setMsgFiles] = useState<File[]>([]);
  const [sendingMsg, setSendingMsg] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const [detail, msgs] = await Promise.all([
      getOrderDetailForAgent(id),
      getOrderMessages(id),
    ]);
    if (detail.order) {
      setOrder(detail.order);
      setImages(detail.images);
      setAttachments(detail.attachments ?? []);
      if (detail.response) {
        setResponse(detail.response);
        setSupplierName(detail.response.supplier_name ?? "");
        setUnitPrice(detail.response.unit_price?.toString() ?? "");
        setLeadTime(detail.response.lead_time_days?.toString() ?? "");
        setQuoteNotes(detail.response.notes ?? "");
        setStatusUpdate(detail.response.status_update);
      }
    }
    setMessages(msgs);
    // Fire-and-forget — don't block page render on this write
    void markOrderMessagesRead(id);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleQuoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingQuote(true); setQuoteError(null); setQuoteSuccess(false);
    const atts: { name: string; base64: string; type: string }[] = [];
    for (const file of quoteFiles) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(file);
      });
      atts.push({ name: file.name, base64, type: file.type });
    }
    const result = await submitAgentResponse(id, {
      supplier_name: supplierName || null,
      unit_price: unitPrice ? parseFloat(unitPrice) : null,
      lead_time_days: leadTime ? parseInt(leadTime) : null,
      notes: quoteNotes || null,
      status_update: statusUpdate,
    }, atts);
    setSavingQuote(false);
    if (result.error) { setQuoteError(result.error); return; }
    setQuoteSuccess(true);
    setQuoteFiles([]);
    load();
  }

  async function handleSendMessage() {
    if (!msgText.trim() && msgFiles.length === 0) return;
    setSendingMsg(true);
    const atts: { name: string; base64: string; type: string }[] = [];
    for (const file of msgFiles) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(file);
      });
      atts.push({ name: file.name, base64, type: file.type });
    }
    await sendAgentMessage(id, msgText.trim() || null, atts);
    setMsgText(""); setMsgFiles([]);
    setSendingMsg(false);
    load();
  }

  if (loading) return (
    <div className="flex justify-center py-32">
      <Loader2 className="h-8 w-8 animate-spin text-[#4B1D8F]" />
    </div>
  );
  if (!order) return <div className="text-center py-20 text-gray-400 text-lg">Order not found.</div>;

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;

  return (
    <div className="space-y-6 pb-12">

      {/* Back link */}
      <Link href="/agent/orders" className="inline-flex items-center gap-2 text-base font-semibold text-gray-500 hover:text-[#4B1D8F] transition-colors">
        <ArrowLeft className="h-5 w-5" /> Back to Orders
      </Link>

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#4B1D8F] p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute -left-6 -bottom-6 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-sm font-bold uppercase tracking-widest">RFQ Order</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{order.order_name}</h1>
            <p className="text-purple-200 text-base">
              {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${status.pill}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
      </div>

      {/* Buyer + Products grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Buyer info */}
        <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-[#4B1D8F]/5 border-b-2 border-[#4B1D8F]/10 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#4B1D8F] flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-[#4B1D8F] uppercase tracking-wide">Buyer Contact</h2>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="h-12 w-12 rounded-full bg-[#4B1D8F] flex items-center justify-center text-white font-bold text-lg shrink-0">
                {order.buyer_name?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <p className="font-bold text-gray-900 text-lg">{order.buyer_name ?? "—"}</p>
            </div>
            {order.buyer_email && (
              <a href={`mailto:${order.buyer_email}`} className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors">
                <Mail className="h-5 w-5 text-blue-600 shrink-0" />
                <span className="text-base text-blue-700 font-semibold">{order.buyer_email}</span>
              </a>
            )}
            {(order as any).buyer_phone && (
              <a href={`tel:${(order as any).buyer_phone}`} className="flex items-center gap-3 p-4 rounded-xl bg-green-50 hover:bg-green-100 border border-green-100 transition-colors">
                <Phone className="h-5 w-5 text-green-600 shrink-0" />
                <span className="text-base text-green-700 font-semibold">{(order as any).buyer_phone}</span>
              </a>
            )}
          </div>
        </div>

        {/* Product lines */}
        <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-[#4B1D8F]/5 border-b-2 border-[#4B1D8F]/10 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#4B1D8F] flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-[#4B1D8F] uppercase tracking-wide">
              Product Lines ({order.items.length})
            </h2>
          </div>
          <div className="p-5 space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="rounded-xl border-2 border-gray-200 overflow-hidden">
                {/* Item header bar */}
                <div className="flex items-center justify-between gap-3 px-5 py-3 bg-gray-50 border-b-2 border-gray-200">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Item {i + 1}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    item.priority === "high"
                      ? "bg-red-100 text-red-700 border border-red-300"
                      : item.priority === "medium"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-green-100 text-green-700 border border-green-300"
                  }`}>
                    {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                  </span>
                </div>

                {/* Product name */}
                <div className="px-5 pt-4 pb-3 border-b border-gray-100">
                  <p className="text-xl font-bold text-gray-900">{item.product_name}</p>
                </div>

                {/* Structured fields */}
                <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-gray-100">
                  <div className="px-5 py-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Category</p>
                    <p className="text-base font-semibold text-gray-800">{item.category || "—"}</p>
                  </div>
                  <div className="px-5 py-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Quantity</p>
                    <p className="text-base font-semibold text-gray-800">{item.quantity} {item.unit}</p>
                  </div>
                  <div className="px-5 py-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Target Price</p>
                    <p className="text-base font-semibold text-gray-800">{item.target_price ? `$${item.target_price} / unit` : "—"}</p>
                  </div>
                  {item.specification && (
                    <div className="px-5 py-3 col-span-2 sm:col-span-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Specification</p>
                      <p className="text-base font-medium text-gray-700">{item.specification}</p>
                    </div>
                  )}
                  {item.reference_link && (
                    <div className="px-5 py-3 col-span-2 sm:col-span-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Reference Link</p>
                      <a href={item.reference_link} target="_blank" rel="noopener noreferrer"
                        className="text-base font-medium text-[#4B1D8F] hover:underline truncate block">
                        {item.reference_link}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sample images */}
      {images.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-[#4B1D8F]/5 border-b-2 border-[#4B1D8F]/10 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#4B1D8F] flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-[#4B1D8F] uppercase tracking-wide">Sample Images</h2>
          </div>
          <div className="p-6 flex flex-wrap gap-4">
            {images.map((img: any) => (
              <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer">
                <img src={img.url} alt={img.file_name} className="h-24 w-24 rounded-xl object-cover border-2 border-gray-200 hover:opacity-80 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Order attachments */}
      {attachments.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-[#4B1D8F]/5 border-b-2 border-[#4B1D8F]/10 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#4B1D8F] flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-[#4B1D8F] uppercase tracking-wide">Order Documents ({attachments.length})</h2>
          </div>
          <div className="p-4 space-y-2">
            {attachments.map((att: any) => (
              <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 px-5 py-4 rounded-xl border-2 border-gray-100 bg-gray-50 hover:bg-[#4B1D8F]/5 hover:border-[#4B1D8F]/20 transition-colors">
                <FileText className="h-6 w-6 text-[#4B1D8F] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-gray-900 truncate">{att.file_name}</p>
                  <p className="text-sm text-gray-500">{new Date(att.uploaded_at).toLocaleDateString()}</p>
                </div>
                <Download className="h-5 w-5 text-gray-400 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

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
            const isAgent = msg.sender_role === "agent";
            return (
              <div key={msg.id} className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${isAgent ? "bg-[#4B1D8F] text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                  <p className={`text-xs font-bold mb-1.5 ${isAgent ? "text-purple-200" : "text-gray-400"}`}>{isAgent ? "You (Agent)" : "Buyer"}</p>
                  {msg.message && <p className="whitespace-pre-wrap text-base">{msg.message}</p>}
                  {msg.files.map((f) => (
                    <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 text-sm underline mt-1.5 ${isAgent ? "text-purple-200" : "text-blue-500"}`}>
                      <FileText className="h-4 w-4" />{f.file_name}
                    </a>
                  ))}
                  <p className={`text-xs mt-1.5 ${isAgent ? "text-purple-300" : "text-gray-400"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        {msgFiles.length > 0 && (
          <div className="px-5 pb-2 flex flex-wrap gap-2">
            {msgFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-3 py-1.5 text-sm text-gray-700 font-medium">
                <FileText className="h-4 w-4" /><span className="max-w-[120px] truncate">{f.name}</span>
                <button onClick={() => setMsgFiles((p) => p.filter((_, j) => j !== i))} className="ml-1 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
        <div className="px-5 pb-5 flex items-end gap-3">
          <div className="flex-1 flex items-end gap-2 border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#4B1D8F] transition-colors">
            <textarea value={msgText} onChange={(e) => setMsgText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              rows={1} placeholder="Type a message… (Enter to send)"
              className="flex-1 resize-none text-base outline-none bg-transparent max-h-28 text-gray-800 placeholder-gray-400" />
            <label className="cursor-pointer text-gray-400 hover:text-[#4B1D8F] shrink-0">
              <Paperclip className="h-5 w-5" />
              <input type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) setMsgFiles((p) => [...p, ...Array.from(e.target.files!)]); }} />
            </label>
          </div>
          <button onClick={handleSendMessage} disabled={sendingMsg || (!msgText.trim() && msgFiles.length === 0)}
            className="h-12 w-12 flex items-center justify-center bg-[#4B1D8F] text-white rounded-xl hover:bg-[#3a1570] disabled:opacity-40 shadow-md transition-all shrink-0">
            {sendingMsg ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Quote / Response form */}
      <div className="bg-white rounded-2xl border-2 border-[#4B1D8F]/30 shadow-lg overflow-hidden">
        {/* Form header */}
        <div className="px-8 py-5 bg-[#4B1D8F] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-[#D4AF37]" />
            <h2 className="text-xl font-bold text-white">
              {response ? "Update Quote" : "Submit Quote"}
            </h2>
          </div>
          {response && (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold bg-[#D4AF37] text-[#4B1D8F]">
              <CheckCircle className="h-4 w-4" /> Quote on file
            </span>
          )}
        </div>

        <form onSubmit={handleQuoteSubmit} className="p-8 space-y-6">
          {quoteSuccess && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <p className="text-base font-semibold text-emerald-700">Quote saved successfully.</p>
            </div>
          )}
          {quoteError && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-base font-semibold text-red-700">{quoteError}</p>
            </div>
          )}

          {/* Row 1: Supplier / Price / Lead time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className={fieldLabel}>Supplier Name</label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g. Shenzhen Co. Ltd"
                className={inp}
              />
            </div>
            <div>
              <label className={fieldLabel}>Unit Price (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base font-bold">$</span>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0.00"
                  className={inp + " pl-9"}
                />
              </div>
            </div>
            <div>
              <label className={fieldLabel}>Lead Time (days)</label>
              <input
                type="number"
                min={0}
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
                placeholder="e.g. 30"
                className={inp}
              />
            </div>
          </div>

          {/* Row 2: Status / Files */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={fieldLabel}>Status Update <span className="text-red-500">*</span></label>
              <select
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value)}
                className={inp}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={fieldLabel}>Attach Files (PDF, Excel)</label>
              <label className="flex items-center gap-3 px-4 py-3.5 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#4B1D8F] hover:bg-[#4B1D8F]/5 transition-colors">
                <Paperclip className="h-5 w-5 text-gray-400" />
                <span className="text-base font-medium text-gray-500">Choose files…</span>
                <input type="file" multiple accept=".pdf,.xls,.xlsx" className="hidden" onChange={(e) => { if (e.target.files) setQuoteFiles((p) => [...p, ...Array.from(e.target.files!)]); }} />
              </label>
              {quoteFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {quoteFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700">
                      <FileText className="h-4 w-4" />
                      <span className="max-w-[120px] truncate">{f.name}</span>
                      <button type="button" onClick={() => setQuoteFiles((p) => p.filter((_, j) => j !== i))} className="ml-1 text-gray-400 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={fieldLabel}>Notes</label>
            <textarea
              rows={4}
              value={quoteNotes}
              onChange={(e) => setQuoteNotes(e.target.value)}
              placeholder="Sourcing notes, conditions, remarks…"
              className={inp + " resize-none"}
            />
          </div>

          {/* Previously uploaded files */}
          {response?.files && response.files.length > 0 && (
            <div>
              <label className={fieldLabel}>Previously Uploaded Files</label>
              <div className="flex flex-wrap gap-2">
                {response.files.map((f: any) => (
                  <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4B1D8F]/5 border-2 border-[#4B1D8F]/20 text-sm font-semibold text-[#4B1D8F] hover:bg-[#4B1D8F]/10 transition-colors">
                    <Download className="h-4 w-4" />{f.file_name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={savingQuote}
              className="flex items-center gap-3 px-8 py-4 bg-[#4B1D8F] text-white text-base font-bold rounded-xl hover:bg-[#3a1570] disabled:opacity-50 shadow-lg transition-all"
            >
              {savingQuote ? <Loader2 className="h-5 w-5 animate-spin" /> : <ClipboardList className="h-5 w-5" />}
              {response ? "Update Quote" : "Submit Quote"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
