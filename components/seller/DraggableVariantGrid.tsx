"use client";

import { useRef, useState } from "react";
import { X, Upload, Star, Plus, GripVertical } from "lucide-react";

export interface VariantSlot {
  id: string;
  file: File | null;
  preview: string | null;   // blob URL for local preview only
  existingUrl: string | null; // already-uploaded URL (edit mode)
  code: string;
  price: string;
  isMaster: boolean;
}

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";
export const MAX_VARIANTS = 20;

export function newSlot(isMaster = false): VariantSlot {
  return { id: crypto.randomUUID(), file: null, preview: null, existingUrl: null, code: "", price: "", isMaster };
}

interface Props {
  variants: VariantSlot[];
  onChange: (variants: VariantSlot[]) => void;
}

export function DraggableVariantGrid({ variants, onChange }: Props) {
  const dragIdx = useRef<number | null>(null);
  const [cardDragOver, setCardDragOver] = useState<number | null>(null);
  const [zoneDragOver, setZoneDragOver] = useState(false);
  const multiRef = useRef<HTMLInputElement>(null);

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...variants];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next.map((v, i) => ({ ...v, isMaster: i === 0 })));
  };

  const addFiles = (files: File[]) => {
    if (!files.length) return;
    const next = [...variants];
    let fi = 0;
    for (let i = 0; i < next.length && fi < files.length; i++) {
      if (!next[i].file && !next[i].existingUrl) {
        next[i] = { ...next[i], file: files[fi], preview: URL.createObjectURL(files[fi]) };
        fi++;
      }
    }
    while (fi < files.length && next.length < MAX_VARIANTS) {
      next.push({ ...newSlot(), file: files[fi], preview: URL.createObjectURL(files[fi]) });
      fi++;
    }
    onChange(next.map((v, i) => ({ ...v, isMaster: i === 0 })));
  };

  const handleMultiSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  };

  const handleZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setZoneDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    addFiles(files);
  };

  const updateSlot = (id: string, patch: Partial<VariantSlot>) =>
    onChange(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const removeSlot = (id: string) =>
    onChange(variants.filter((v) => v.id !== id).map((v, i) => ({ ...v, isMaster: i === 0 })));

  const addSlot = () => {
    if (variants.length >= MAX_VARIANTS) return;
    onChange([...variants, newSlot(false)]);
  };

  const hasImages = variants.some((v) => v.file || v.existingUrl);
  const slotsLeft = MAX_VARIANTS - variants.filter((v) => v.file || v.existingUrl).length;

  return (
    <div className="space-y-4">
      {/* Drop zone — always visible until all slots filled */}
      {slotsLeft > 0 && (
        <div
          onClick={() => multiRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setZoneDragOver(true); }}
          onDragLeave={() => setZoneDragOver(false)}
          onDrop={handleZoneDrop}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 transition-all"
          style={{
            borderColor: zoneDragOver ? PURPLE : `${GOLD}88`,
            backgroundColor: zoneDragOver ? "#EDE9F6" : "#FAFAFA",
          }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "#EDE9F6" }}>
            <Upload className="h-6 w-6" style={{ color: PURPLE }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: PURPLE }}>
              Click to select images, or drag &amp; drop here
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Select up to {slotsLeft} image{slotsLeft !== 1 ? "s" : ""} at once · JPG, PNG, WebP
            </p>
          </div>
        </div>
      )}

      {/* Hidden multi-file input */}
      <input ref={multiRef} type="file" accept="image/*" multiple className="hidden" onChange={handleMultiSelect} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {variants.map((slot, i) => (
          <VariantCard
            key={slot.id}
            slot={slot}
            index={i}
            isDragOver={cardDragOver === i}
            onUpdate={updateSlot}
            onRemove={removeSlot}
            onDragStart={(e) => { dragIdx.current = i; e.dataTransfer.effectAllowed = "move"; }}
            onDragOver={(e) => { e.preventDefault(); setCardDragOver(i); }}
            onDrop={(e) => { e.preventDefault(); if (dragIdx.current !== null) reorder(dragIdx.current, i); dragIdx.current = null; setCardDragOver(null); }}
            onDragEnd={() => { dragIdx.current = null; setCardDragOver(null); }}
          />
        ))}

        {variants.length < MAX_VARIANTS && (
          <button
            type="button"
            onClick={addSlot}
            className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors hover:border-[#4B1D8F] hover:bg-[#EDE9F6]/40"
            style={{ borderColor: `${GOLD}66` }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "#EDE9F6" }}>
              <Plus className="h-5 w-5" style={{ color: PURPLE }} />
            </div>
            <span className="text-xs font-semibold" style={{ color: PURPLE }}>Add Variant</span>
            <span className="text-[10px] text-gray-400">{variants.length}/{MAX_VARIANTS}</span>
          </button>
        )}
      </div>

      {hasImages && (
        <p className="text-xs text-gray-400">
          <span className="font-semibold" style={{ color: GOLD }}>Master</span> is always first.
          Drag cards to reorder · {variants.filter((v) => v.file || v.existingUrl).length}/{MAX_VARIANTS} images
        </p>
      )}
    </div>
  );
}

interface CardProps {
  slot: VariantSlot;
  index: number;
  isDragOver: boolean;
  onUpdate: (id: string, patch: Partial<VariantSlot>) => void;
  onRemove: (id: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function VariantCard({ slot, index, isDragOver, onUpdate, onRemove, onDragStart, onDragOver, onDrop, onDragEnd }: CardProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  // Show local blob preview first, fall back to existing URL
  const displaySrc = slot.preview ?? slot.existingUrl ?? null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Revoke old blob URL to avoid memory leaks
    if (slot.preview) URL.revokeObjectURL(slot.preview);
    onUpdate(slot.id, { file, preview: URL.createObjectURL(file) });
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className="relative flex flex-col overflow-hidden rounded-2xl border-2 transition-all duration-200 select-none"
      style={{
        borderColor: isDragOver ? PURPLE : slot.isMaster ? GOLD : displaySrc ? `${PURPLE}88` : "#e5e7eb",
        boxShadow: slot.isMaster ? `0 0 0 1px ${GOLD}55` : "none",
        opacity: isDragOver ? 0.8 : 1,
        cursor: "grab",
      }}
    >
      {/* Drag handle + position */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-lg px-1.5 py-0.5" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
        <GripVertical className="h-3 w-3 text-white" />
        <span className="text-[9px] font-bold text-white">{index + 1}</span>
      </div>

      {/* Master badge */}
      {slot.isMaster && (
        <div className="absolute top-2 left-10 z-10 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: GOLD }}>
          <Star className="h-2.5 w-2.5" /> Master
        </div>
      )}

      {/* Remove button (non-master only) */}
      {!slot.isMaster && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(slot.id); }}
          className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Image area — click to pick file */}
      <div
        className="relative flex h-40 items-center justify-center bg-gray-50 group cursor-pointer"
        onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
      >
        {displaySrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displaySrc}
            alt={slot.code || "variant"}
            className="h-full w-full object-contain bg-white pointer-events-none"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl group-hover:opacity-75 transition-opacity" style={{ backgroundColor: "#EDE9F6" }}>
              <Upload className="h-5 w-5" style={{ color: PURPLE }} />
            </div>
            <p className="text-xs text-gray-400">Click to upload</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Code / price fields */}
      <div className="space-y-2 bg-white p-3" onClick={(e) => e.stopPropagation()}>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {slot.isMaster ? "Master SKU / Code" : "Variant Code"}
          </label>
          <input
            type="text"
            value={slot.code}
            onChange={(e) => onUpdate(slot.id, { code: e.target.value })}
            placeholder={slot.isMaster ? "e.g. A800" : "e.g. A801"}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] transition-shadow"
          />
        </div>
        {!slot.isMaster && (
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Price Override (CAD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={slot.price}
                onChange={(e) => onUpdate(slot.id, { price: e.target.value })}
                placeholder="Leave blank to use master price"
                className="w-full rounded-xl border border-gray-200 pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] transition-shadow"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
