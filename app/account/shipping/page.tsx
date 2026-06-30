"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, X, Loader2, Truck, FileText, Trash2, ChevronDown,
  FileUp, Download, Ship, Train, Plane, MessageSquare, Send, Eye, Pencil,
} from "lucide-react";
import {
  createShippingRequest, getMyShippingRequests, deleteShippingRequest,
  updateShippingRequest, deleteShippingDocument, addShippingDocuments,
  type ShippingRequest,
} from "@/app/actions/shipping";
import {
  getShippingMessages, sendShippingClientMessage, markShippingMessagesRead,
  type ShippingMessage,
} from "@/app/actions/shipping-agent";
import {
  CHINA_CITIES, IRAN_CITIES, SHIPPING_METHODS, DOC_TYPES,
  type ShippingMethod, type DocType,
} from "@/lib/shipping-constants";

// ── Styles ────────────────────────────────────────────────────────────────────
const inp = "w-full px-4 py-3 border-2 border-[#4B1D8F]/60 rounded-xl text-sm font-bold focus:outline-none focus:border-[#4B1D8F] bg-white placeholder-gray-300 transition-colors";
const inpStyle = { color: "#1a0a3c", boxShadow: "0 0 0 3px rgba(75,29,143,0.08)" };

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:     { label: "Pending",     className: "bg-amber-100 text-amber-700 border border-amber-200" },
  in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700 border border-blue-200" },
  completed:   { label: "Completed",   className: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
};

const METHOD_ICONS: Record<string, React.ReactNode> = {
  rail: <Train className="h-4 w-4" />,
  sea:  <Ship className="h-4 w-4" />,
  air:  <Plane className="h-4 w-4" />,
};

// ── Searchable dropdown ───────────────────────────────────────────────────────
function CityDropdown({
  value, onChange, cities, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  cities: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = cities.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setQuery(""); }}
        className={`${inp} flex items-center justify-between text-left`}
        style={inpStyle}
      >
        <span className={value ? "" : "text-gray-300 font-normal"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "#4B1D8F" }} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border-2 border-[#4B1D8F]/30 bg-white shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#4B1D8F]"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">No cities found</p>
            ) : filtered.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => { onChange(city); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#4B1D8F]/5 ${
                  value === city ? "bg-[#4B1D8F]/10 text-[#4B1D8F] font-bold" : "text-gray-700"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Document upload row ───────────────────────────────────────────────────────
interface DocFile {
  file: File;
  doc_type: DocType;
}

// ── Create form ───────────────────────────────────────────────────────────────
function ShippingForm({ onDone }: { onDone: () => void }) {
  const [orderRef, setOrderRef] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [method, setMethod] = useState<ShippingMethod | "">("");
  const [notes, setNotes] = useState("");
  const [docs, setDocs] = useState<DocFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function addFiles(files: FileList) {
    const newDocs: DocFile[] = Array.from(files).map((f) => ({
      file: f,
      doc_type: "other" as DocType,
    }));
    setDocs((prev) => [...prev, ...newDocs]);
  }

  function removeDoc(i: number) {
    setDocs((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateDocType(i: number, doc_type: DocType) {
    setDocs((prev) => prev.map((d, idx) => idx === i ? { ...d, doc_type } : d));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!method) { setError("Please select a shipping method."); return; }
    if (!origin) { setError("Please select an origin city."); return; }
    if (!destination) { setError("Please select a destination city."); return; }

    setSaving(true);
    setError(null);

    // Convert files to base64
    const docPayload: { name: string; base64: string; type: string; doc_type: DocType }[] = [];
    for (const d of docs) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(d.file);
      });
      docPayload.push({ name: d.file.name, base64, type: d.file.type, doc_type: d.doc_type });
    }

    const result = await createShippingRequest({
      order_reference: orderRef,
      origin_city: origin,
      destination_city: destination,
      shipping_method: method as ShippingMethod,
      notes: notes || null,
      documents: docPayload,
    });

    setSaving(false);
    if (result.error) { setError(result.error); return; }
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 flex items-center gap-2">
          <X className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {/* Order Reference */}
      <div className="rounded-xl p-5 bg-white border-2 border-[#4B1D8F]/60" style={{ boxShadow: "0 0 0 3px rgba(75,29,143,0.12)" }}>
        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#4B1D8F" }}>
          📋 Order Reference *
        </label>
        <input
          type="text"
          required
          value={orderRef}
          onChange={(e) => setOrderRef(e.target.value)}
          placeholder="e.g. INV-2026-001 or Steel Pipes May Batch"
          className={inp}
          style={inpStyle}
        />
        <p className="text-xs text-gray-400 mt-1.5">Your own reference number or description for this shipment</p>
      </div>

      {/* Origin + Destination */}
      <div className="rounded-xl p-5 bg-white border-2 border-[#4B1D8F]/60" style={{ boxShadow: "0 0 0 3px rgba(75,29,143,0.12)" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#4B1D8F" }}>
              🇨🇳 Origin City (China) *
            </label>
            <CityDropdown
              value={origin}
              onChange={setOrigin}
              cities={CHINA_CITIES}
              placeholder="Select Chinese city…"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#4B1D8F" }}>
              🇮🇷 Destination City (Iran) *
            </label>
            <CityDropdown
              value={destination}
              onChange={setDestination}
              cities={IRAN_CITIES}
              placeholder="Select Iranian city…"
            />
          </div>
        </div>
      </div>

      {/* Shipping Method */}
      <div className="rounded-xl p-5 bg-white border-2 border-[#4B1D8F]/60" style={{ boxShadow: "0 0 0 3px rgba(75,29,143,0.12)" }}>
        <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#4B1D8F" }}>
          🚚 Shipping Method *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {SHIPPING_METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMethod(m.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-sm transition-all ${
                method === m.value
                  ? "border-[#4B1D8F] bg-[#4B1D8F] text-white shadow-lg"
                  : "border-[#4B1D8F]/30 text-gray-600 hover:border-[#4B1D8F]/60 hover:bg-[#4B1D8F]/5"
              }`}
            >
              <span className="text-2xl">{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="rounded-xl p-5 bg-white border-2 border-[#4B1D8F]/60" style={{ boxShadow: "0 0 0 3px rgba(75,29,143,0.12)" }}>
        <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#4B1D8F" }}>
          📎 Shipping Documents
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Upload Commercial Invoice, Packing List, Supplier Info, or other documents. Supported: PDF, JPG, PNG, DOC
        </p>

        {/* Drop zone */}
        <label
          className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:bg-purple-50 mb-3"
          style={{ borderColor: "rgba(75,29,143,0.4)", background: "rgba(75,29,143,0.02)" }}
        >
          <FileUp className="h-6 w-6 mb-1" style={{ color: "#4B1D8F" }} />
          <span className="text-sm font-bold" style={{ color: "#4B1D8F" }}>Click to upload documents</span>
          <span className="text-xs text-gray-400 mt-0.5">PDF, JPG, PNG, DOC — multiple allowed</span>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </label>

        {/* Staged files */}
        {docs.length > 0 && (
          <div className="space-y-2">
            {docs.map((d, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#4B1D8F]/20 bg-purple-50">
                <FileText className="h-4 w-4 shrink-0" style={{ color: "#4B1D8F" }} />
                <span className="text-sm font-semibold truncate flex-1" style={{ color: "#1a0a3c" }}>{d.file.name}</span>
                <select
                  value={d.doc_type}
                  onChange={(e) => updateDocType(i, e.target.value as DocType)}
                  className="text-xs border border-[#4B1D8F]/30 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#4B1D8F] font-semibold shrink-0"
                  style={{ color: "#4B1D8F" }}
                >
                  {DOC_TYPES.map((dt) => (
                    <option key={dt.value} value={dt.value}>{dt.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeDoc(i)}
                  className="shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="rounded-xl p-5 bg-white border-2 border-[#4B1D8F]/60" style={{ boxShadow: "0 0 0 3px rgba(75,29,143,0.12)" }}>
        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#4B1D8F" }}>
          📝 Additional Notes (Optional)
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Special instructions, multiple suppliers, packaging requirements, delivery deadlines…"
          className={`${inp} resize-none`}
          style={inpStyle}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-all shadow-lg"
          style={{ background: "linear-gradient(135deg, #4B1D8F, #3a1570)", border: "2px solid #D4AF37" }}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          🚀 Submit Shipping Request
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-6 py-3 text-sm font-semibold rounded-xl transition-colors"
          style={{ border: "2px solid #4B1D8F", color: "#4B1D8F" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
type View = "list" | "form";

export default function ShippingPage() {
  const [view, setView] = useState<View>("list");
  const [requests, setRequests] = useState<ShippingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewRequest, setViewRequest] = useState<ShippingRequest | null>(null);
  const [editRequest, setEditRequest] = useState<ShippingRequest | null>(null);
  const [editRef, setEditRef] = useState("");
  const [editOrigin, setEditOrigin] = useState("");
  const [editDest, setEditDest] = useState("");
  const [editMethod, setEditMethod] = useState<ShippingMethod | "">("");
  const [editNotes, setEditNotes] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editNewDocs, setEditNewDocs] = useState<DocFile[]>([]);
  const editFileRef = useRef<HTMLInputElement>(null);
  const [chatRequestId, setChatRequestId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ShippingMessage[]>([]);
  const [chatText, setChatText] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getMyShippingRequests();
    setRequests(result.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function openChat(requestId: string) {
    setChatRequestId(requestId);
    const msgs = await getShippingMessages(requestId);
    setChatMessages(msgs);
    void markShippingMessagesRead(requestId, "client");
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function handleChatSend() {
    if (!chatText.trim() || !chatRequestId) return;
    setChatSending(true);
    await sendShippingClientMessage(chatRequestId, chatText.trim());
    setChatText("");
    setChatSending(false);
    const msgs = await getShippingMessages(chatRequestId);
    setChatMessages(msgs);
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this shipping request? This cannot be undone.")) return;
    setDeleting(id);
    await deleteShippingRequest(id);
    setDeleting(null);
    load();
  }

  function openEdit(req: ShippingRequest) {
    setEditRequest(req);
    setEditRef(req.order_reference);
    setEditOrigin(req.origin_city);
    setEditDest(req.destination_city);
    setEditMethod(req.shipping_method);
    setEditNotes(req.notes ?? "");
    setEditError(null);
    setEditNewDocs([]);
  }

  async function handleDeleteDoc(docId: string, storagePath: string) {
    if (!editRequest) return;
    await deleteShippingDocument(docId, storagePath);
    // Refresh the request in state
    const result = await getMyShippingRequests();
    const updated = result.data.find((r) => r.id === editRequest.id);
    if (updated) setEditRequest(updated);
    setRequests(result.data);
  }

  async function handleEditSave() {
    if (!editRequest || !editMethod) return;
    setEditSaving(true); setEditError(null);

    // Save field changes
    const result = await updateShippingRequest(editRequest.id, {
      order_reference: editRef,
      origin_city: editOrigin,
      destination_city: editDest,
      shipping_method: editMethod as ShippingMethod,
      notes: editNotes || null,
    });
    if (result.error) { setEditSaving(false); setEditError(result.error); return; }

    // Upload new documents if any
    if (editNewDocs.length > 0) {
      const docPayload: { name: string; base64: string; type: string; doc_type: DocType }[] = [];
      for (const d of editNewDocs) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(d.file);
        });
        docPayload.push({ name: d.file.name, base64, type: d.file.type, doc_type: d.doc_type });
      }
      const uploadResult = await addShippingDocuments(editRequest.id, docPayload);
      if (uploadResult.error) { setEditSaving(false); setEditError(uploadResult.error); return; }
    }

    setEditSaving(false);
    setEditRequest(null);
    setEditNewDocs([]);
    load();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {requests.length} request{requests.length !== 1 ? "s" : ""} submitted
          </p>
        </div>
        <button
          onClick={() => setView(view === "form" ? "list" : "form")}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors shadow-md"
          style={{ background: "linear-gradient(135deg, #4B1D8F, #3a1570)", border: "1px solid #D4AF37" }}
        >
          {view === "form"
            ? <><X className="h-4 w-4" /> Cancel</>
            : <><Plus className="h-4 w-4" /> New Shipping Request</>
          }
        </button>
      </div>

      {/* Guidance banner */}
      {view === "list" && (
        <div
          className="rounded-2xl overflow-hidden border border-[#4B1D8F]/20"
          style={{ background: "linear-gradient(135deg, #f9f7ff 0%, #fdf8ec 100%)", boxShadow: "0 2px 12px rgba(75,29,143,0.08)" }}
        >
          <div
            className="px-6 py-4 flex items-center gap-3 border-b border-[#4B1D8F]/10"
            style={{ background: "linear-gradient(135deg, #4B1D8F, #3a1570)" }}
          >
            <Truck className="h-5 w-5 text-yellow-300" />
            <p className="text-sm font-bold uppercase tracking-widest text-white">How Shipping Works</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#4B1D8F]/10">
            {[
              { step: "1", title: "Submit Your Request", desc: "Fill in your shipment details — origin, destination, method, and upload your documents." },
              { step: "2", title: "We Arrange Freight", desc: "Our team reviews your request and coordinates the shipment via your chosen transport mode." },
              { step: "3", title: "Track Your Shipment", desc: "Receive updates on your shipment status directly through your dashboard." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white/90 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white text-base font-black shrink-0"
                    style={{ background: "linear-gradient(135deg, #4B1D8F, #D4AF37)" }}
                  >
                    {step}
                  </span>
                  <p className="text-base font-bold text-gray-900">{title}</p>
                </div>
                <p className="text-sm font-semibold text-gray-700 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      {view === "form" && (
        <ShippingForm onDone={() => { setView("list"); load(); }} />
      )}

      {/* List */}
      {view === "list" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#4B1D8F" }} />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
                style={{ backgroundColor: "#EDE9F6" }}
              >
                <Truck className="h-7 w-7" style={{ color: "#4B1D8F" }} />
              </div>
              <p className="text-gray-400 text-sm">No shipping requests yet.</p>
              <button
                onClick={() => setView("form")}
                className="mt-3 text-sm font-semibold hover:underline"
                style={{ color: "#4B1D8F" }}
              >
                Submit your first request
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Reference", "Route", "Method", "Documents", "Status", "Submitted", "Messages", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((req) => {
                    const statusCfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
                    const methodLabel = SHIPPING_METHODS.find((m) => m.value === req.shipping_method);
                    return (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-gray-900 max-w-[160px] truncate">
                          {req.order_reference}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          <span className="font-medium">{req.origin_city}</span>
                          <span className="mx-1.5 text-gray-400">→</span>
                          <span className="font-medium">{req.destination_city}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-gray-700 font-medium whitespace-nowrap">
                            {METHOD_ICONS[req.shipping_method]}
                            {methodLabel?.label ?? req.shipping_method}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {req.documents.length > 0 ? (
                            <span className="flex items-center gap-1 text-[#4B1D8F] font-semibold">
                              <FileText className="h-3.5 w-3.5" />
                              {req.documents.length} file{req.documents.length !== 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusCfg.className}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {new Date(req.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openChat(req.id)}
                            title="Messages"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                            style={{ color: "#4B1D8F", backgroundColor: "#EDE9F6" }}
                          >
                            <MessageSquare className="h-4 w-4" />
                            Chat
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setViewRequest(req)} title="View"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#4B1D8F] hover:bg-purple-50 transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button onClick={() => openEdit(req)} title="Edit"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#4B1D8F] hover:bg-purple-50 transition-colors">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(req.id)}
                              disabled={deleting === req.id}
                              title="Delete"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              {deleting === req.id
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Trash2 className="h-4 w-4" />
                              }
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* View modal */}
      {viewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewRequest(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4"
              style={{ background: "linear-gradient(135deg, #4B1D8F, #3a1570)" }}>
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-[#D4AF37]" />
                <p className="text-base font-bold text-white">{viewRequest.order_reference}</p>
              </div>
              <button onClick={() => setViewRequest(null)} className="text-white/60 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { label: "Origin", value: `🇨🇳 ${viewRequest.origin_city}` },
                { label: "Destination", value: `🇮🇷 ${viewRequest.destination_city}` },
                { label: "Method", value: SHIPPING_METHODS.find((m) => m.value === viewRequest.shipping_method)?.label ?? viewRequest.shipping_method },
                { label: "Status", value: STATUS_CONFIG[viewRequest.status]?.label ?? viewRequest.status },
                { label: "Submitted", value: new Date(viewRequest.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
                { label: "Documents", value: `${viewRequest.documents.length} file${viewRequest.documents.length !== 1 ? "s" : ""}` },
                ...(viewRequest.notes ? [{ label: "Notes", value: viewRequest.notes }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
                  <span className="w-28 shrink-0 text-xs font-bold text-gray-400 uppercase tracking-wide pt-0.5">{label}</span>
                  <span className="text-sm font-semibold text-gray-800">{value}</span>
                </div>
              ))}
              {viewRequest.documents.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Files</p>
                  {viewRequest.documents.map((doc: any) => (
                    <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                      <FileText className="h-4 w-4 shrink-0" style={{ color: "#4B1D8F" }} />
                      <span className="text-sm font-semibold truncate" style={{ color: "#4B1D8F" }}>{doc.file_name}</span>
                      <Download className="h-3.5 w-3.5 ml-auto shrink-0 text-gray-400" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditRequest(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 sticky top-0"
              style={{ background: "linear-gradient(135deg, #4B1D8F, #3a1570)" }}>
              <div className="flex items-center gap-3">
                <Pencil className="h-5 w-5 text-[#D4AF37]" />
                <p className="text-base font-bold text-white">Edit Request</p>
              </div>
              <button onClick={() => setEditRequest(null)} className="text-white/60 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {editError && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{editError}</div>}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#4B1D8F" }}>Order Reference *</label>
                <input type="text" required value={editRef} onChange={(e) => setEditRef(e.target.value)} className={inp} style={inpStyle} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#4B1D8F" }}>🇨🇳 Origin</label>
                  <CityDropdown value={editOrigin} onChange={setEditOrigin} cities={CHINA_CITIES} placeholder="Select city…" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#4B1D8F" }}>🇮🇷 Destination</label>
                  <CityDropdown value={editDest} onChange={setEditDest} cities={IRAN_CITIES} placeholder="Select city…" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#4B1D8F" }}>Shipping Method *</label>
                <div className="grid grid-cols-3 gap-2">
                  {SHIPPING_METHODS.map((m) => (
                    <button key={m.value} type="button" onClick={() => setEditMethod(m.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 font-bold text-xs transition-all ${
                        editMethod === m.value ? "border-[#4B1D8F] bg-[#4B1D8F] text-white" : "border-[#4B1D8F]/30 text-gray-600 hover:border-[#4B1D8F]/60"
                      }`}>
                      <span className="text-xl">{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#4B1D8F" }}>Notes</label>
                <textarea rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Additional instructions…" className={`${inp} resize-none`} style={inpStyle} />
              </div>

              {/* Documents section */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#4B1D8F" }}>Documents</label>

                {/* Existing docs */}
                {editRequest.documents.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Uploaded</p>
                    {editRequest.documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#4B1D8F]/20 bg-purple-50">
                        <FileText className="h-4 w-4 shrink-0" style={{ color: "#4B1D8F" }} />
                        <a href={doc.url} target="_blank" rel="noopener noreferrer"
                          className="text-sm font-semibold truncate flex-1 hover:underline" style={{ color: "#4B1D8F" }}>
                          {doc.file_name}
                        </a>
                        <span className="text-xs text-gray-400 shrink-0">
                          {DOC_TYPES.find((d) => d.value === doc.doc_type)?.label ?? doc.doc_type}
                        </span>
                        <button type="button" onClick={() => handleDeleteDoc(doc.id, doc.storage_path)}
                          className="shrink-0 text-gray-400 hover:text-red-500 transition-colors ml-1">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New docs to upload */}
                {editNewDocs.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">To be uploaded</p>
                    {editNewDocs.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50">
                        <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="text-sm font-semibold truncate flex-1 text-gray-700">{d.file.name}</span>
                        <select value={d.doc_type}
                          onChange={(e) => setEditNewDocs((prev) => prev.map((x, j) => j === i ? { ...x, doc_type: e.target.value as DocType } : x))}
                          className="text-xs border border-[#4B1D8F]/30 rounded-lg px-2 py-1 bg-white focus:outline-none shrink-0"
                          style={{ color: "#4B1D8F" }}>
                          {DOC_TYPES.map((dt) => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
                        </select>
                        <button type="button" onClick={() => setEditNewDocs((prev) => prev.filter((_, j) => j !== i))}
                          className="shrink-0 text-gray-400 hover:text-red-500 transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add more */}
                <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:bg-purple-50"
                  style={{ borderColor: "rgba(75,29,143,0.4)" }}>
                  <FileUp className="h-4 w-4" style={{ color: "#4B1D8F" }} />
                  <span className="text-sm font-semibold" style={{ color: "#4B1D8F" }}>Add documents…</span>
                  <input ref={editFileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden"
                    onChange={(e) => {
                      if (!e.target.files) return;
                      const newDocs: DocFile[] = Array.from(e.target.files).map((f) => ({ file: f, doc_type: "other" as DocType }));
                      setEditNewDocs((prev) => [...prev, ...newDocs]);
                      e.target.value = "";
                    }} />
                </label>
              </div>

              <div className="flex gap-3 pt-2">                <button onClick={handleEditSave} disabled={editSaving || !editRef || !editOrigin || !editDest || !editMethod}
                  className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-all shadow-md"
                  style={{ background: "linear-gradient(135deg, #4B1D8F, #3a1570)", border: "2px solid #D4AF37" }}>
                  {editSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
                <button onClick={() => setEditRequest(null)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors"
                  style={{ border: "2px solid #4B1D8F", color: "#4B1D8F" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat drawer */}
      {chatRequestId && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setChatRequestId(null)} />
          <div className="relative ml-auto w-full max-w-md bg-white shadow-2xl flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
              style={{ background: "linear-gradient(135deg, #4B1D8F, #3a1570)" }}>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-[#D4AF37]" />
                <div>
                  <p className="text-sm font-bold text-white">Shipping Messages</p>
                  <p className="text-xs text-purple-200">
                    {requests.find((r) => r.id === chatRequestId)?.order_reference ?? ""}
                  </p>
                </div>
              </div>
              <button onClick={() => setChatRequestId(null)} className="text-white/60 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">No messages yet.</p>
              ) : chatMessages.map((msg) => {
                const isClient = msg.sender_role === "client";
                return (
                  <div key={msg.id} className={`flex ${isClient ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${isClient ? "bg-[#4B1D8F] text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                      <p className={`text-[10px] font-bold mb-1 ${isClient ? "text-purple-200" : "text-gray-400"}`}>
                        {isClient ? "You" : "Shipping Agent"}
                      </p>
                      {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                      <p className={`text-[10px] mt-1 ${isClient ? "text-purple-300" : "text-gray-400"}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>
            <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex items-end gap-2">
              <div className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#4B1D8F] transition-colors">
                <textarea
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
                  rows={1}
                  placeholder="Type a message…"
                  className="w-full resize-none text-sm outline-none bg-transparent max-h-24 text-gray-800 placeholder-gray-400"
                />
              </div>
              <button onClick={handleChatSend} disabled={chatSending || !chatText.trim()}
                className="h-10 w-10 flex items-center justify-center bg-[#4B1D8F] text-white rounded-xl hover:bg-[#3a1570] disabled:opacity-40 shadow-md transition-all shrink-0">
                {chatSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
