"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { SlideImagePreview } from "./SlideImagePreview";
import { Toggle } from "@/components/ui/Toggle";
import { createSlide, updateSlide } from "@/app/actions/cms-sliders";
import { uploadCmsImage } from "@/app/actions/cms-upload";
import type { HeroSlideRow, SlideFormData } from "@/types/cms";

interface SlideFormProps {
  slide?: HeroSlideRow | null;
  nextPosition: number;
  onClose: () => void;
  onSaved: () => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function SlideForm({ slide, nextPosition, onClose, onSaved }: SlideFormProps) {
  const [form, setForm] = useState<SlideFormData>({
    title: slide?.title ?? "",
    subtitle: slide?.subtitle ?? "",
    image_url: slide?.image_url ?? "",
    cta_enabled: slide?.cta_enabled ?? false,
    cta_text: slide?.cta_text ?? "",
    cta_link: slide?.cta_link ?? "",
    position: slide?.position ?? nextPosition,
    is_active: slide?.is_active ?? true,
    // New fields for enhanced hero section
    headline: slide?.headline ?? "",
    subtext: slide?.subtext ?? "",
    benefits: slide?.benefits ?? [],
    cta_secondary_text: slide?.cta_secondary_text ?? "",
    cta_secondary_link: slide?.cta_secondary_link ?? "",
    layout_type: slide?.layout_type ?? "split",
    background_overlay: slide?.background_overlay ?? true,
    trust_line: slide?.trust_line ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SlideFormData, string>>>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedImageUrl = useDebounce(form.image_url, 500);

  const set = (key: keyof SlideFormData, value: string | number | boolean | string[]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadCmsImage(fd);
    setUploading(false);
    if (result.error) { setUploadError(result.error); return; }
    set("image_url", result.data!);
    // reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.image_url.trim()) e.image_url = "Image URL is required";
    else if (!form.image_url.startsWith("https://")) e.image_url = "Image URL must start with https://";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setServerError("");
    const result = slide
      ? await updateSlide(slide.id, form)
      : await createSlide(form);
    setSaving(false);
    if (result.error) { setServerError(result.error); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{slide ? "Edit Slide" : "Add Slide"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {serverError && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{serverError}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input value={form.image_url} onChange={(e) => set("image_url", e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shrink-0"
              >
                {uploading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading…" : "Upload"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
            {errors.image_url && <p className="mt-1 text-xs text-red-500">{errors.image_url}</p>}
            <div className="mt-2">
              <SlideImagePreview url={debouncedImageUrl} />
            </div>
          </div>

          {/* CTA toggle + conditional fields */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
            <Toggle checked={form.cta_enabled} onChange={(v) => set("cta_enabled", v)} label="Enable Call-to-Action button" />
            {form.cta_enabled && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Label <span className="text-red-500">*</span></label>
                  <input value={form.cta_text} onChange={(e) => set("cta_text", e.target.value)}
                    placeholder="e.g. Contact Us"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Link <span className="text-red-500">*</span></label>
                  <input value={form.cta_link} onChange={(e) => set("cta_link", e.target.value)}
                    placeholder="/contact or /auth/register"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Hero Section Fields */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Enhanced Hero Section</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Headline (H1)</label>
              <input value={form.headline} onChange={(e) => set("headline", e.target.value)}
                placeholder="Prefabricated Modular Homes & Light Steel Structures from China to Canada"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtext</label>
              <textarea value={form.subtext} onChange={(e) => set("subtext", e.target.value)}
                placeholder="End-to-end design, manufacturing, and installation of certified modular buildings delivered across Canada."
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Benefits (one per line, max 3)</label>
              <textarea value={form.benefits.join('\n')} onChange={(e) => set("benefits", e.target.value.split('\n').filter(b => b.trim()))}
                placeholder="Factory-built precision compliant with Canadian standards&#10;Faster construction with reduced cost and on-site time&#10;Full-service delivery from design to installation"
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary CTA Label</label>
                <input value={form.cta_secondary_text} onChange={(e) => set("cta_secondary_text", e.target.value)}
                  placeholder="View Projects"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary CTA Link</label>
                <input value={form.cta_secondary_link} onChange={(e) => set("cta_secondary_link", e.target.value)}
                  placeholder="/projects"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Layout Type</label>
              <select value={form.layout_type} onChange={(e) => set("layout_type", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="split">Split (Two-column)</option>
                <option value="centered">Centered Overlay</option>
                <option value="image-only">Image Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Toggle checked={form.background_overlay} onChange={(v) => set("background_overlay", v)} label="Background Overlay" />
              <span className="text-xs text-gray-500">Dark overlay for text readability</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trust Line</label>
              <input value={form.trust_line} onChange={(e) => set("trust_line", e.target.value)}
                placeholder="Engineered for Canadian climate • Direct factory supply • Turnkey delivery"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input type="number" min={0} value={form.position} onChange={(e) => set("position", parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="pt-5">
              <Toggle checked={form.is_active} onChange={(v) => set("is_active", v)} label="Active" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving…" : slide ? "Save Changes" : "Add Slide"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
