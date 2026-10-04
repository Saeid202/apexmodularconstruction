"use client";

import { useState } from "react";
import { ChevronDown, X, Plus } from "lucide-react";

const PURPLE = "#1F2937";
const GOLD = "#D4AF37";

const inputClass =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent transition-shadow";

// ── Preset options ──────────────────────────────────────────────
const SIZE_PRESETS = [
  "300mm", "400mm", "600mm", "800mm", "1000mm", "1200mm", "Custom",
];

const THICKNESS_PRESETS = [
  "3mm", "4mm", "6mm", "8mm", "10mm", "12mm", "15mm", "18mm", "20mm", "Custom",
];

// ── Types ────────────────────────────────────────────────────────
export interface SpecRow {
  key: string;
  value: string;
}

interface HybridFieldProps {
  label: string;
  presets: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  unit?: string;
}

function HybridField({ label, presets, value, onChange, placeholder, unit }: HybridFieldProps) {
  const isCustom = value !== "" && !presets.slice(0, -1).includes(value);
  const [showCustom, setShowCustom] = useState(isCustom);

  const handleSelect = (v: string) => {
    if (v === "Custom") {
      setShowCustom(true);
      onChange("");
    } else {
      setShowCustom(false);
      onChange(v);
    }
  };

  const dropdownValue = showCustom ? "Custom" : (value || "");

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label} <span className="text-gray-300 font-normal normal-case">(optional)</span>
      </label>
      <div className="relative">
        <select
          value={dropdownValue}
          onChange={(e) => handleSelect(e.target.value)}
          className={`${inputClass} appearance-none pr-9`}
        >
          <option value="">— Not specified —</option>
          {presets.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      {showCustom && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${inputClass} flex-1`}
            autoFocus
          />
          {unit && (
            <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">{unit}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
interface Props {
  specs: SpecRow[];
  onChange: (specs: SpecRow[]) => void;
}

export function SpecificationsEditor({ specs, onChange }: Props) {
  // Extract size/thickness from specs array
  const getVal = (key: string) =>
    specs.find((s) => s.key.toLowerCase() === key)?.value ?? "";

  const legacySize = getVal("size");
  const legacyDimensions = legacySize.match(/^(\d+(?:\.\d+)?)\s*(?:mm|cm|m|ft|')?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(mm|cm|m|ft|')?$/i);
  const getDimension = (key: "width" | "length") =>
    getVal(key) || (legacyDimensions ? `${key === "width" ? legacyDimensions[1] : legacyDimensions[2]}${legacyDimensions[3] || ""}` : "");

  const setStructured = (key: string, value: string) => {
    const filtered = specs.filter((s) => s.key.toLowerCase() !== key);
    if (value.trim()) {
      onChange([{ key, value }, ...filtered]);
    } else {
      onChange(filtered);
    }
  };

  // Extra free-form specs (anything that isn't size/thickness)
  const extraSpecs = specs.filter(
    (s) => !["size", "width", "length", "height", "thickness"].includes(s.key.toLowerCase())
  );

  const addExtra = () =>
    onChange([...specs, { key: "", value: "" }]);

  const removeExtra = (key: string, value: string) =>
    onChange(specs.filter((s) => !(s.key === key && s.value === value)));

  const updateExtra = (
    idx: number,
    field: "key" | "value",
    val: string
  ) => {
    const updated = [...specs];
    // find the actual index in the full specs array
    const extraIdx = specs.indexOf(extraSpecs[idx]);
    if (extraIdx === -1) return;
    updated[extraIdx] = { ...updated[extraIdx], [field]: val };
    onChange(updated);
  };

  return (
    <div className="space-y-5">
      {/* Structured fields */}
      <div className="grid sm:grid-cols-2 gap-5 p-4 rounded-2xl border"
        style={{ borderColor: `${GOLD}44`, backgroundColor: "#FDFBF7" }}>
        <HybridField
          label="Width"
          presets={SIZE_PRESETS}
          value={getDimension("width")}
          onChange={(v) => setStructured("width", v)}
          placeholder="e.g. 1220mm"
        />
        <HybridField
          label="Length"
          presets={SIZE_PRESETS}
          value={getDimension("length")}
          onChange={(v) => setStructured("length", v)}
          placeholder="e.g. 2400mm"
        />
        <HybridField
          label="Height"
          presets={SIZE_PRESETS}
          value={getVal("height")}
          onChange={(v) => setStructured("height", v)}
          placeholder="e.g. 120mm"
        />
        <HybridField
          label="Thickness"
          presets={THICKNESS_PRESETS}
          value={getVal("thickness")}
          onChange={(v) => setStructured("thickness", v)}
          placeholder="e.g. 14mm"
          unit="mm"
        />
      </div>

      {/* Extra free-form specs */}
      {extraSpecs.length > 0 && (
        <div className="space-y-2">
          {extraSpecs.map((spec, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Field (e.g. Material)"
                value={spec.key}
                onChange={(e) => updateExtra(i, "key", e.target.value)}
                className={`${inputClass} flex-1`}
              />
              <input
                type="text"
                placeholder="Value (e.g. Porcelain)"
                value={spec.value}
                onChange={(e) => updateExtra(i, "value", e.target.value)}
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={() => removeExtra(spec.key, spec.value)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addExtra}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors hover:bg-[#FEF3C7]"
        style={{ borderColor: GOLD, color: PURPLE }}
      >
        <Plus className="h-4 w-4" /> Add Specification
      </button>
      <p className="text-xs text-gray-400">
        Width, Length, Height, and Thickness are optional. Add more fields like Material, Color, Weight, etc.
      </p>
    </div>
  );
}
