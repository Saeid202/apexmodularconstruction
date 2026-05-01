"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, Eye, Pencil, Download, MessageSquare, X,
  Loader2, Package, ChevronDown, ChevronUp, Send, ExternalLink, ImagePlus, FileUp, FileText,
} from "lucide-react";
import {
  getMyOrders, createOrder, updateOrder, deleteOrder, updateOrderNotes,
  uploadItemImages, getOrderImages, deleteItemImage,
  uploadOrderAttachments, getOrderAttachments, deleteOrderAttachment,
  type OrderAttachment,
  type ConsolidationOrder, type OrderItem, type ItemImage,
} from "@/app/actions/consolidation";
import { CATEGORIES, UNITS } from "@/lib/consolidation-constants";

// ── constants ─────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  high:   { label: "High",   className: "bg-red-100 text-red-700 border border-red-200" },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-700 border border-amber-200" },
  low:    { label: "Low",    className: "bg-green-100 text-green-700 border border-green-200" },
};

const inp = "w-full px-3 py-2 border-2 border-purple-200 rounded-xl text-sm focus:outline-none focus:border-[#4B1D8F] focus:ring-0 bg-white transition-colors placeholder-gray-300";
const inpSm = "w-full px-3 py-2 border-2 border-purple-200 rounded-xl text-sm focus:outline-none focus:border-[#4B1D8F] focus:ring-0 bg-white transition-colors";

function emptyItem(position: number): OrderItem {
  return { product_name: "", category: CATEGORIES[0], specification: "", quantity: 1, unit: "pcs", target_price: null, reference_link: "", priority: "medium", position };
}

// ── PDF export ────────────────────────────────────────────────────────────────
async function exportPDF(order: ConsolidationOrder) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  doc.setFontSize(16); doc.text(order.order_name, 14, 16);
  doc.setFontSize(9); doc.text(`Submitted: ${new Date(order.created_at).toLocaleDateString()}`, 14, 23);
  let y = 32;
  order.items.forEach((item, i) => {
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text(`${i + 1}. ${item.product_name}`, 14, y); y += 6;
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(`Category: ${item.category}  |  Qty: ${item.quantity} ${item.unit}  |  Priority: ${item.priority}`, 14, y); y += 5;
    if (item.target_price) { doc.text(`Target Price: $${item.target_price}`, 14, y); y += 5; }
    if (item.specification) { doc.text(`Spec: ${item.specification}`, 14, y); y += 5; }
    if (item.reference_link) { doc.text(`Ref: ${item.reference_link}`, 14, y); y += 5; }
    y += 3;
    if (y > 270) { doc.addPage(); y = 16; }
  });
  if (order.notes) { doc.setFont("helvetica", "italic"); doc.text(`Notes: ${order.notes}`, 14, y); }
  doc.save(`order-${order.order_name.replace(/\s+/g, "-")}.pdf`);
}

// ── Order form ────────────────────────────────────────────────────────────────
function OrderForm({ existing, onDone }: { existing?: ConsolidationOrder; onDone: () => void }) {
  const [orderName, setOrderName] = useState(existing?.order_name ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [items, setItems] = useState<OrderItem[]>(existing?.items.length ? existing.items : [emptyItem(0)]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOrderNameTip, setShowOrderNameTip] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<OrderAttachment[]>([]);
  useEffect(() => {
    if (!showOrderNameTip) return;
    const handler = () => setShowOrderNameTip(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showOrderNameTip]);
  // newFiles[i] = files staged for upload for item i
  const [newFiles, setNewFiles] = useState<File[][]>(() => (existing?.items ?? [emptyItem(0)]).map(() => []));
  // existingImages[i] = already-saved images for item i (edit mode)
  const [existingImages, setExistingImages] = useState<ItemImage[][]>(() => (existing?.items ?? []).map(() => []));

  // Load existing images when editing
  useEffect(() => {
    if (!existing) return;
    getOrderImages(existing.id).then((imgs) => {
      const grouped = existing.items.map((_, i) => imgs.filter((img) => img.item_index === i));
      setExistingImages(grouped);
    });
    getOrderAttachments(existing.id).then(setExistingAttachments);
  }, [existing]);

  function setItem(i: number, field: keyof OrderItem, value: any) {
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem(prev.length)]);
    setNewFiles((prev) => [...prev, []]);
    setExistingImages((prev) => [...prev, []]);
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
    setNewFiles((prev) => prev.filter((_, idx) => idx !== i));
    setExistingImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addFiles(i: number, files: FileList) {
    setNewFiles((prev) => prev.map((arr, idx) => idx === i ? [...arr, ...Array.from(files)] : arr));
  }

  function removeNewFile(i: number, fi: number) {
    setNewFiles((prev) => prev.map((arr, idx) => idx === i ? arr.filter((_, j) => j !== fi) : arr));
  }

  async function removeExistingImage(i: number, img: ItemImage) {
    await deleteItemImage(img.id, img.storage_path);
    setExistingImages((prev) => prev.map((arr, idx) => idx === i ? arr.filter((x) => x.id !== img.id) : arr));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) { setError("Add at least one product line."); return; }
    setSaving(true); setError(null);

    const result = existing
      ? await updateOrder(existing.id, orderName, notes || null, items)
      : await createOrder(orderName, notes || null, items);

    if ("error" in result && result.error) { setError(result.error); setSaving(false); return; }

    const orderId = existing ? existing.id : (result as any).id;

    // Upload new images per item
    for (let i = 0; i < newFiles.length; i++) {
      if (newFiles[i].length === 0) continue;
      const attachments: { name: string; base64: string; type: string }[] = [];
      for (const file of newFiles[i]) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(file);
        });
        attachments.push({ name: file.name, base64, type: file.type });
      }
      await uploadItemImages(orderId, i, attachments);
    }

    // Upload order-level attachments (PDF/Excel)
    if (attachmentFiles.length > 0) {
      const attachments: { name: string; base64: string; type: string }[] = [];
      for (const file of attachmentFiles) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(file);
        });
        attachments.push({ name: file.name, base64, type: file.type });
      }
      await uploadOrderAttachments(orderId, attachments);
    }

    setSaving(false);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 flex items-center gap-2">
          <X className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {/* Order name */}
      <div className="rounded-xl p-5 bg-white border-2 border-[#4B1D8F]/60" style={{ boxShadow: "0 0 0 3px rgba(75,29,143,0.12), 0 4px 12px rgba(75,29,143,0.12)" }}>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#4B1D8F" }}>📦 Order Name *</label>
          <div className="relative">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowOrderNameTip((v) => !v); }}
              className="flex items-center justify-center h-4 w-4 rounded-full text-white text-[10px] font-black leading-none transition-transform hover:scale-110 focus:outline-none"
              style={{ background: "linear-gradient(135deg, #4B1D8F, #D4AF37)", boxShadow: "0 1px 4px rgba(75,29,143,0.4)" }}
              aria-label="Order name help"
            >
              !
            </button>
            {showOrderNameTip && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-6 z-50 w-72 rounded-xl bg-white p-4 text-xs text-gray-700 shadow-xl border-l-4"
                style={{ borderColor: "#4B1D8F", boxShadow: "0 8px 24px rgba(75,29,143,0.18)" }}
              >
                {/* arrow */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 bg-white border-l border-t" style={{ borderColor: "#4B1D8F" }} />
                <p className="font-bold mb-1" style={{ color: "#4B1D8F" }}>Why does my order need a name?</p>
                <p className="leading-relaxed text-gray-600">
                  Every order must have a unique name or number so you and your agent can track it easily. Use anything that makes sense to you — a batch number, a date, or a short description.
                </p>
                <p className="mt-2 font-semibold text-gray-700">Examples:</p>
                <ul className="mt-1 space-y-0.5 text-gray-500">
                  <li>• <span className="font-mono">#2026-001</span></li>
                  <li>• <span className="font-mono">Spring Batch — Electronics</span></li>
                  <li>• <span className="font-mono">Steel Run 3</span></li>
                </ul>
                <button
                  type="button"
                  onClick={() => setShowOrderNameTip(false)}
                  className="mt-3 text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: "#4B1D8F" }}
                >
                  Got it ✕
                </button>
              </div>
            )}
          </div>
        </div>
        <input type="text" required value={orderName} onChange={(e) => setOrderName(e.target.value)}
          placeholder="e.g. Spring 2026 Batch — Electronics"
          className="w-full px-4 py-3 rounded-xl text-base font-bold focus:outline-none bg-white placeholder-gray-300 transition-colors border-2 border-[#4B1D8F]/60 focus:border-[#4B1D8F]" style={{ color: "#1a0a3c" }} />
      </div>

      {/* Product lines */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Product Lines</h3>
            <p className="text-xs text-gray-400 mt-0.5">Add one or more products to this order</p>
          </div>
          <button type="button" onClick={addItem}
            className="flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-xl transition-all shadow-md"
            style={{ background: "linear-gradient(135deg, #4B1D8F, #3a1570)", border: "1px solid #D4AF37" }}>
            <Plus className="h-3.5 w-3.5" /> Add Product Line
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, i) => {
            const accentGradient = item.priority === "high" ? "from-red-500 to-rose-600" : item.priority === "low" ? "from-emerald-500 to-teal-600" : "from-blue-400 to-indigo-500";
            return (
              <div key={i} className="relative rounded-xl overflow-hidden bg-white border border-gray-200">
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: "#4B1D8F" }} />
                <div className="pl-5 pr-4 pt-4 pb-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full text-white text-[10px] font-black" style={{ background: "linear-gradient(135deg, #4B1D8F, #D4AF37)" }}>{i + 1}</span>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#4B1D8F" }}>Product Line {i + 1}</span>
                    </div>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-red-500 bg-red-50 hover:bg-red-100 transition-colors">
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    )}
                  </div>

                  {/* Row 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 mb-3">
                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Product Name *</label>
                      <input type="text" required value={item.product_name}
                        onChange={(e) => setItem(i, "product_name", e.target.value)}
                        placeholder="e.g. Galvanized Steel Pipe"
                        className="w-full px-3 py-2.5 border-2 border-[#4B1D8F]/60 rounded-xl text-sm font-bold focus:outline-none focus:border-[#4B1D8F] bg-white placeholder-gray-300 transition-colors" style={{ color: "#1a0a3c", boxShadow: "0 0 0 3px rgba(75,29,143,0.08)" }} />
                      {/* Sample images */}
                      <div className="mt-3">
                        <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2 block">Sample Images</label>
                        {/* Upload drop zone — shown when no images yet */}
                        {((existingImages[i]?.length ?? 0) + (newFiles[i]?.length ?? 0)) === 0 && (
                          <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:bg-purple-50"
                            style={{ borderColor: "rgba(75,29,143,0.4)", background: "rgba(75,29,143,0.03)" }}>
                            <ImagePlus className="h-7 w-7 mb-1.5" style={{ color: "#4B1D8F" }} />
                            <span className="text-sm font-bold" style={{ color: "#4B1D8F" }}>Click to upload images</span>
                            <span className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP — multiple allowed</span>
                            <input type="file" multiple accept="image/*" className="hidden"
                              onChange={(e) => e.target.files && addFiles(i, e.target.files)} />
                          </label>
                        )}
                        {/* Thumbnails + add more */}
                        {((existingImages[i]?.length ?? 0) + (newFiles[i]?.length ?? 0)) > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {(existingImages[i] ?? []).map((img) => (
                              <div key={img.id} className="relative group h-20 w-20 rounded-xl overflow-hidden border-2 border-[#4B1D8F]/30 shadow-sm">
                                <img src={img.url} alt={img.file_name} className="h-full w-full object-cover" />
                                <button type="button" onClick={() => removeExistingImage(i, img)}
                                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <X className="h-4 w-4 text-white" />
                                </button>
                              </div>
                            ))}
                            {(newFiles[i] ?? []).map((file, fi) => (
                              <div key={fi} className="relative group h-20 w-20 rounded-xl overflow-hidden border-2 border-[#4B1D8F]/30 shadow-sm">
                                <img src={URL.createObjectURL(file)} alt={file.name} className="h-full w-full object-cover" />
                                <button type="button" onClick={() => removeNewFile(i, fi)}
                                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <X className="h-4 w-4 text-white" />
                                </button>
                              </div>
                            ))}
                            {/* Add more */}
                            <label className="flex flex-col items-center justify-center h-20 w-20 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:bg-purple-50"
                              style={{ borderColor: "rgba(75,29,143,0.4)" }}>
                              <ImagePlus className="h-5 w-5" style={{ color: "#4B1D8F" }} />
                              <span className="text-[10px] font-bold mt-0.5" style={{ color: "#4B1D8F" }}>Add more</span>
                              <input type="file" multiple accept="image/*" className="hidden"
                                onChange={(e) => e.target.files && addFiles(i, e.target.files)} />
                            </label>
                          </div>
                        )}
                        {((existingImages[i]?.length ?? 0) + (newFiles[i]?.length ?? 0)) > 0 && (
                          <p className="text-[10px] text-gray-400 mt-1.5">{(existingImages[i]?.length ?? 0) + (newFiles[i]?.length ?? 0)} image{((existingImages[i]?.length ?? 0) + (newFiles[i]?.length ?? 0)) !== 1 ? "s" : ""} · hover to remove</p>
                        )}
                      </div>
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Category *</label>
                      <select value={item.category} onChange={(e) => setItem(i, "category", e.target.value)}
                        className="w-full px-3 py-2.5 border-2 border-[#4B1D8F]/60 rounded-xl text-sm font-bold focus:outline-none focus:border-[#4B1D8F] bg-white transition-colors" style={{ color: "#1a0a3c", boxShadow: "0 0 0 3px rgba(75,29,143,0.08)" }}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-1 space-y-1.5">
                      <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Priority *</label>
                      <select value={item.priority} onChange={(e) => setItem(i, "priority", e.target.value as any)}
                        className={`w-full px-3 py-2.5 border-2 rounded-xl text-sm font-semibold focus:outline-none transition-colors ${
                          item.priority === "high" ? "border-red-300 bg-red-50 text-red-700" :
                          item.priority === "medium" ? "border-indigo-300 bg-indigo-50 text-indigo-700" :
                          "border-green-300 bg-green-50 text-green-700"
                        }`}>
                        <option value="high">🔴 High</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="low">🟢 Low</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Quantity *</label>
                      <input type="number" required min={0} step="any" value={item.quantity}
                        onChange={(e) => setItem(i, "quantity", parseFloat(e.target.value))}
                        className="w-full px-3 py-2.5 border-2 border-[#4B1D8F]/60 rounded-xl text-sm font-bold focus:outline-none focus:border-[#4B1D8F] bg-white transition-colors" style={{ color: "#1a0a3c", boxShadow: "0 0 0 3px rgba(75,29,143,0.08)" }} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Unit *</label>
                      <select value={item.unit} onChange={(e) => setItem(i, "unit", e.target.value)}
                        className="w-full px-3 py-2.5 border-2 border-[#4B1D8F]/60 rounded-xl text-sm font-bold focus:outline-none focus:border-[#4B1D8F] bg-white transition-colors" style={{ color: "#1a0a3c", boxShadow: "0 0 0 3px rgba(75,29,143,0.08)" }}>
                        {UNITS.map((u) => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Target Price ($/unit)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B1D8F] text-sm font-bold">$</span>
                        <input type="number" min={0} step="any" value={item.target_price ?? ""}
                          onChange={(e) => setItem(i, "target_price", e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2.5 border-2 border-[#4B1D8F]/60 rounded-xl text-sm font-bold focus:outline-none focus:border-[#4B1D8F] bg-white placeholder-gray-300 transition-colors" style={{ color: "#1a0a3c", boxShadow: "0 0 0 3px rgba(75,29,143,0.08)" }} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Reference Link</label>
                      <input type="url" value={item.reference_link ?? ""}
                        onChange={(e) => setItem(i, "reference_link", e.target.value || null)}
                        placeholder="https://alibaba.com/..."
                        className="w-full px-3 py-2.5 border-2 border-[#4B1D8F]/60 rounded-xl text-sm font-bold focus:outline-none focus:border-[#4B1D8F] bg-white placeholder-gray-300 transition-colors" style={{ color: "#1a0a3c", boxShadow: "0 0 0 3px rgba(75,29,143,0.08)" }} />
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Specification</label>
                    <input type="text" value={item.specification ?? ""}
                      onChange={(e) => setItem(i, "specification", e.target.value || null)}
                      placeholder="Size, color, material, grade, standard…"
                      className="w-full px-3 py-2.5 border-2 border-[#4B1D8F]/60 rounded-xl text-sm font-bold focus:outline-none focus:border-[#4B1D8F] bg-white placeholder-gray-300 transition-colors" style={{ color: "#1a0a3c", boxShadow: "0 0 0 3px rgba(75,29,143,0.08)" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl p-5 bg-white border-2 border-[#4B1D8F]/60" style={{ boxShadow: "0 0 0 3px rgba(75,29,143,0.12), 0 4px 12px rgba(75,29,143,0.12)" }}>
        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#4B1D8F" }}>📝 Notes for Agent</label>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional instructions, delivery requirements, or special requests…"
          className="w-full px-4 py-3 border-2 border-[#4B1D8F]/60 rounded-xl text-sm font-bold focus:outline-none focus:border-[#4B1D8F] bg-white placeholder-gray-300 resize-none transition-colors" style={{ color: "#1a0a3c", boxShadow: "0 0 0 3px rgba(75,29,143,0.08)" }} />
      </div>

      {/* Order attachments */}
      <div className="rounded-xl p-5 bg-white border-2 border-[#4B1D8F]/60" style={{ boxShadow: "0 0 0 3px rgba(75,29,143,0.12), 0 4px 12px rgba(75,29,143,0.12)" }}>
        <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#4B1D8F" }}>📎 Order Documents</label>
        <p className="text-xs text-gray-500 mb-3">Attach your order request as a PDF or Excel file. Our agent will review it alongside your product lines.</p>

        {/* Drop zone */}
        <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:bg-purple-50 mb-3"
          style={{ borderColor: "rgba(75,29,143,0.4)", background: "rgba(75,29,143,0.02)" }}>
          <FileUp className="h-6 w-6 mb-1" style={{ color: "#4B1D8F" }} />
          <span className="text-sm font-bold" style={{ color: "#4B1D8F" }}>Click to upload PDF or Excel</span>
          <span className="text-xs text-gray-400 mt-0.5">.pdf, .xls, .xlsx — multiple allowed</span>
          <input type="file" multiple accept=".pdf,.xls,.xlsx" className="hidden"
            onChange={(e) => e.target.files && setAttachmentFiles((prev) => [...prev, ...Array.from(e.target.files!)])} />
        </label>

        {/* Existing saved attachments */}
        {existingAttachments.length > 0 && (
          <div className="space-y-1.5 mb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Previously uploaded</p>
            {existingAttachments.map((att) => (
              <div key={att.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-[#4B1D8F]/20 bg-purple-50">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 shrink-0" style={{ color: "#4B1D8F" }} />
                  <a href={att.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-semibold truncate hover:underline" style={{ color: "#4B1D8F" }}>
                    {att.file_name}
                  </a>
                </div>
                <button type="button" onClick={async () => {
                  await deleteOrderAttachment(att.id, att.storage_path);
                  setExistingAttachments((prev) => prev.filter((a) => a.id !== att.id));
                }} className="shrink-0 text-gray-400 hover:text-red-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New staged attachments */}
        {attachmentFiles.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ready to upload</p>
            {attachmentFiles.map((file, i) => (
              <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700 truncate">{file.name}</span>
                  <span className="text-xs text-gray-400 shrink-0">({(file.size / 1024).toFixed(0)} KB)</span>
                </div>
                <button type="button" onClick={() => setAttachmentFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="shrink-0 text-gray-400 hover:text-red-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-all shadow-lg"
          style={{ background: "linear-gradient(135deg, #4B1D8F, #3a1570)", border: "2px solid #D4AF37" }}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {existing ? "💾 Save Changes" : "🚀 Submit Order"}
        </button>
        <button type="button" onClick={onDone}
          className="px-6 py-3 text-sm font-semibold rounded-xl transition-colors"
          style={{ border: "2px solid #4B1D8F", color: "#4B1D8F" }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── View modal ────────────────────────────────────────────────────────────────
function ViewModal({ order, onClose }: { order: ConsolidationOrder; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{order.order_name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4">
          {order.items.map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 text-sm">{item.product_name}</h3>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${PRIORITY_CONFIG[item.priority].className}`}>
                  {PRIORITY_CONFIG[item.priority].label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                <span><b>Category:</b> {item.category}</span>
                <span><b>Qty:</b> {item.quantity} {item.unit}</span>
                {item.target_price && <span><b>Target:</b> ${item.target_price}/unit</span>}
                {item.specification && <span className="col-span-2"><b>Spec:</b> {item.specification}</span>}
                {item.reference_link && (
                  <span className="col-span-2">
                    <b>Ref: </b>
                    <a href={item.reference_link} target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-0.5">
                      {item.reference_link.replace(/^https?:\/\//, "").slice(0, 40)}…
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </span>
                )}
              </div>
            </div>
          ))}
          {order.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
              <b>Notes:</b> {order.notes}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <button onClick={() => exportPDF(order)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4" /> PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Note editor ───────────────────────────────────────────────────────────────
function NoteEditor({ order, onClose, onSaved }: { order: ConsolidationOrder; onClose: () => void; onSaved: (notes: string) => void }) {
  const [text, setText] = useState(order.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateOrderNotes(order.id, text);
    setSaving(false);
    onSaved(text);
  }

  return (
    <div>
      <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Add notes for the agent…"
        className="w-full px-3 py-2 border border-violet-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />
      <div className="flex gap-2 mt-2">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Save Note
        </button>
        <button onClick={onClose} className="px-4 py-2 text-sm border border-violet-200 rounded-lg hover:bg-violet-50">Cancel</button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ConsolidationPage() {
  const [orders, setOrders] = useState<ConsolidationOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"table" | "form" | "edit">("table");
  const [editOrder, setEditOrder] = useState<ConsolidationOrder | null>(null);
  const [viewOrder, setViewOrder] = useState<ConsolidationOrder | null>(null);
  const [noteOrderId, setNoteOrderId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getMyOrders();
    setOrders(result.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    setDeleting(id);
    await deleteOrder(id);
    setDeleting(null);
    load();
  }

  function handleNotesSaved(orderId: string, notes: string) {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, notes } : o));
    setNoteOrderId(null);
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? "s" : ""} submitted</p>
        </div>
        {view === "table" && (
          <button onClick={() => setView("form")}
            className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors shadow-md"
            style={{ background: "linear-gradient(135deg, #4B1D8F, #3a1570)", border: "1px solid #D4AF37" }}>
            <Plus className="h-4 w-4" /> New Order
          </button>
        )}
      </div>

      {/* Guidance banner */}
      {view === "table" && (
        <div className="rounded-2xl overflow-hidden border border-[#4B1D8F]/20" style={{ background: "linear-gradient(135deg, #f9f7ff 0%, #fdf8ec 100%)", boxShadow: "0 2px 12px rgba(75,29,143,0.08)" }}>
          <div className="px-6 py-4 flex items-center gap-3 border-b border-[#4B1D8F]/10" style={{ background: "linear-gradient(135deg, #4B1D8F, #3a1570)" }}>
            <span className="text-yellow-300 text-lg">✦</span>
            <p className="text-sm font-bold uppercase tracking-widest text-white">How It Works</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#4B1D8F]/10">
            {/* Service 1 */}
            <div className="bg-white/90 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-white text-base font-black shrink-0" style={{ background: "linear-gradient(135deg, #4B1D8F, #D4AF37)" }}>1</span>
                <p className="text-base font-bold text-gray-900">Sourcing & RFQ</p>
              </div>
              <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                Submit a list of products you want to source from China. Our agent will review your request and respond promptly with pricing, availability, and sourcing options — so you can make informed purchasing decisions without dealing with suppliers directly.
              </p>
            </div>
            {/* Service 2 */}
            <div className="bg-white/90 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-white text-base font-black shrink-0" style={{ background: "linear-gradient(135deg, #4B1D8F, #D4AF37)" }}>2</span>
                <p className="text-base font-bold text-gray-900">Consolidation & Shipping</p>
              </div>
              <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                Already have a supplier in China or purchasing from multiple sources? Share your supplier links or order details and we'll coordinate everything on your behalf — consolidating all items into a single shipment and delivering it straight to your door.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {(view === "form" || view === "edit") && (
        <div className="relative rounded-2xl p-6 bg-white" style={{ boxShadow: "0 0 0 1px #4B1D8F, 0 0 0 4px #D4AF37, 0 0 0 5px #4B1D8F" }}>
          <span className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-yellow-400 rounded-tl-md" />
          <span className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-yellow-400 rounded-tr-md" />
          <span className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-yellow-400 rounded-bl-md" />
          <span className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-yellow-400 rounded-br-md" />
          <h2 className="font-bold mb-5" style={{ color: "#4B1D8F" }}>{view === "edit" ? "Edit Order" : "New Order"}</h2>
          <OrderForm
            existing={view === "edit" ? editOrder ?? undefined : undefined}
            onDone={() => { setView("table"); setEditOrder(null); load(); }}
          />
        </div>
      )}

      {/* Order cards */}
      {view === "table" && (
        <div>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20">
              <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400 mb-3">No orders yet.</p>
              <button onClick={() => setView("form")} className="text-sm text-blue-600 hover:underline">Submit your first order</button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const noteOpen = noteOrderId === order.id;
                const highCount = order.items.filter((i) => i.priority === "high").length;
                const medCount  = order.items.filter((i) => i.priority === "medium").length;
                const lowCount  = order.items.filter((i) => i.priority === "low").length;
                return (
                  <div key={order.id}>
                    <div className={`relative overflow-hidden rounded-2xl transition-all ${noteOpen ? "" : ""}`} style={{ boxShadow: "0 0 0 1px #4B1D8F, 0 0 0 4px #D4AF37, 0 0 0 5px #4B1D8F" }}>
                      {/* Top gradient accent */}
                      <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #4B1D8F, #D4AF37, #4B1D8F)" }} />

                      <div className="bg-white px-6 py-5 flex items-center gap-6">
                        {/* Order icon */}
                        <div className="shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #4B1D8F, #D4AF37)" }}>
                          <Package className="h-6 w-6 text-white" />
                        </div>

                        {/* Order info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-base truncate">{order.order_name}</h3>
                            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border" style={{ background: "#EDE9F6", color: "#4B1D8F", borderColor: "#4B1D8F33" }}>
                              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {/* Product chips */}
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {order.items.slice(0, 4).map((item, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-600">
                                {item.product_name}
                              </span>
                            ))}
                            {order.items.length > 4 && (
                              <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-400">
                                +{order.items.length - 4} more
                              </span>
                            )}
                          </div>

                          {/* Priority breakdown + date */}
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            {highCount > 0 && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />{highCount} high</span>}
                            {medCount > 0  && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-400" />{medCount} medium</span>}
                            {lowCount > 0  && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />{lowCount} low</span>}
                            <span className="ml-auto">{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0 flex items-center gap-2">
                          <button onClick={() => setViewOrder(order)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all"
                            style={{ background: "linear-gradient(135deg, #4B1D8F, #3a1570)", border: "1px solid #D4AF37" }}>
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                          <button onClick={() => { setEditOrder(order); setView("edit"); }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all"
                            style={{ color: "#4B1D8F", background: "#EDE9F6", borderColor: "#4B1D8F44" }}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button onClick={() => setNoteOrderId(noteOpen ? null : order.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all"
                            style={noteOpen ? { background: "#4B1D8F", color: "#fff", borderColor: "#D4AF37" } : { color: "#4B1D8F", background: "#EDE9F6", borderColor: "#4B1D8F44" }}>
                            <MessageSquare className="h-3.5 w-3.5" /> Note
                          </button>
                          <button onClick={() => exportPDF(order)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all"
                            style={{ color: "#D4AF37", background: "#fefce8", borderColor: "#D4AF3766" }}>
                            <Download className="h-3.5 w-3.5" /> PDF
                          </button>
                          <button onClick={() => handleDelete(order.id)} disabled={deleting === order.id}
                            className="flex items-center justify-center h-8 w-8 rounded-xl text-red-400 bg-red-50 hover:bg-red-100 border border-red-100 transition-all disabled:opacity-50">
                            {deleting === order.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Inline notes */}
                    {noteOpen && (
                      <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 border-t-0 rounded-b-2xl px-6 py-4 -mt-2 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-violet-600" />
                            <span className="text-sm font-semibold text-violet-900">Notes — {order.order_name}</span>
                          </div>
                          <button onClick={() => setNoteOrderId(null)} className="p-1 rounded-lg hover:bg-violet-100 text-violet-400 hover:text-violet-600">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <NoteEditor order={order} onClose={() => setNoteOrderId(null)} onSaved={(notes) => handleNotesSaved(order.id, notes)} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {viewOrder && <ViewModal order={viewOrder} onClose={() => setViewOrder(null)} />}
    </div>
  );
}
