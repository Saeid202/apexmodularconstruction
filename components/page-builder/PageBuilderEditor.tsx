"use client";

import { useMemo, useState } from "react";
import {
  LayoutTemplate,
  Type,
  Image as ImageIcon,
  Sparkles,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  Save,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { updateArchitectProfile } from "@/app/actions/architect";
import { BLOCK_LIBRARY, getBlockDefinition } from "@/types/page-builder";
import type { Block, BlockType, PageLayout } from "@/types/page-builder";
import { PageRenderer } from "./PageRenderer";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutTemplate,
  Type,
  Image: ImageIcon,
  Sparkles,
};

function createBlock(type: BlockType): Block {
  const def = getBlockDefinition(type)!;
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${type}-${Date.now()}`;
  return { id, type, props: { ...def.defaults } } as Block;
}

interface PageBuilderEditorProps {
  initialProfile: any;
}

export function PageBuilderEditor({ initialProfile }: PageBuilderEditorProps) {
  const branding = initialProfile?.branding || {};
  const primaryColor: string = branding.primaryColor || "#10B981";
  const subdomain: string | null = initialProfile?.subdomain || null;

  const [layout, setLayout] = useState<PageLayout>(
    Array.isArray(branding.layout) ? (branding.layout as PageLayout) : []
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const selected = useMemo(() => layout.find((b) => b.id === selectedId) ?? null, [layout, selectedId]);
  const selectedDef = selected ? getBlockDefinition(selected.type) : null;

  function addBlock(type: BlockType) {
    const block = createBlock(type);
    setLayout((prev) => [...prev, block]);
    setSelectedId(block.id);
  }

  function removeBlock(id: string) {
    setLayout((prev) => prev.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function move(id: string, dir: -1 | 1) {
    setLayout((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function updateField(id: string, key: string, value: string) {
    setLayout((prev) =>
      prev.map((b) => (b.id === id ? ({ ...b, props: { ...b.props, [key]: value } } as Block) : b))
    );
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    // Only `branding.layout` changes — every other profile field is passed
    // through unchanged so nothing else in the record is affected.
    const result = await updateArchitectProfile({
      fullName: initialProfile?.full_name || "",
      phone: initialProfile?.phone ?? null,
      firmName: initialProfile?.firm_name ?? null,
      bio: initialProfile?.bio ?? null,
      website: initialProfile?.website ?? null,
      address: initialProfile?.address ?? null,
      professionalRole: initialProfile?.professional_role ?? null,
      experienceYears: initialProfile?.experience_years ?? null,
      specialization: initialProfile?.specialization ?? null,
      subdomain: initialProfile?.subdomain ?? undefined,
      branding: { ...branding, layout },
    });
    setSaving(false);
    setMessage(
      result.success
        ? { kind: "ok", text: "Page saved. Your live page now reflects these changes." }
        : { kind: "err", text: result.error || "Failed to save page." }
    );
    if (result.success) setTimeout(() => setMessage(null), 4000);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 lg:p-8">
      {/* Left rail: palette + block list */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Add a block</h3>
          <div className="grid grid-cols-2 gap-2">
            {BLOCK_LIBRARY.map((def) => {
              const Icon = ICONS[def.icon] ?? LayoutTemplate;
              return (
                <button
                  key={def.type}
                  onClick={() => addBlock(def.type)}
                  title={def.description}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 p-3 text-xs font-medium text-gray-700 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                >
                  <Icon className="h-5 w-5 text-emerald-600" />
                  {def.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Your page ({layout.length})</h3>
          {layout.length === 0 ? (
            <p className="text-xs text-gray-400">No blocks yet. Add one above to start building.</p>
          ) : (
            <ul className="space-y-2">
              {layout.map((block, i) => {
                const def = getBlockDefinition(block.type);
                const Icon = ICONS[def?.icon ?? ""] ?? LayoutTemplate;
                const active = block.id === selectedId;
                return (
                  <li
                    key={block.id}
                    className={`flex items-center gap-2 rounded-xl border p-2 ${
                      active ? "border-emerald-400 bg-emerald-50" : "border-gray-200"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-emerald-600 shrink-0" />
                    <button
                      onClick={() => setSelectedId(block.id)}
                      className="flex-1 text-left text-xs font-medium text-gray-800 truncate"
                    >
                      {def?.label ?? block.type}
                    </button>
                    <button onClick={() => move(block.id, -1)} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button onClick={() => move(block.id, 1)} disabled={i === layout.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button onClick={() => removeBlock(block.id)} className="p-1 text-gray-400 hover:text-rose-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Property editor */}
        {selected && selectedDef ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Pencil className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900">Edit {selectedDef.label}</h3>
            </div>
            <div className="space-y-3">
              {selectedDef.fields.map((field) => {
                const value = (selected.props as Record<string, string>)[field.key] ?? "";
                return (
                  <label key={field.key} className="block">
                    <span className="text-xs font-semibold text-gray-600">{field.label}</span>
                    {field.type === "textarea" ? (
                      <textarea
                        rows={4}
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(e) => updateField(selected.id, field.key, e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(e) => updateField(selected.id, field.key, e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {/* Right: toolbar + live preview */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Eye className="h-4 w-4" /> Live preview
          </div>
          <div className="flex items-center gap-2">
            {subdomain ? (
              <a
                href={`/studio/${subdomain}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4" /> View live
              </a>
            ) : null}
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save page"}
            </button>
          </div>
        </div>

        {message ? (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              message.kind === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {layout.length === 0 ? (
            <div className="flex h-96 items-center justify-center text-center text-sm text-gray-400">
              Your page is empty. Add blocks from the left to see them here.
            </div>
          ) : (
            <div className="bg-white">
              <PageRenderer layout={layout} primaryColor={primaryColor} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
