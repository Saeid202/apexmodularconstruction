"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/actions/seller";
import { uploadProductImage } from "@/lib/uploadProductImage";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Category } from "@/types/database";
import { Tag, DollarSign, Layers, Hash, FileText, ChevronDown } from "lucide-react";
import { LuxuryButton } from "@/components/seller/LuxuryButton";
import { SpecificationsEditor } from "@/components/seller/SpecificationsEditor";
import { DraggableVariantGrid, newSlot, type VariantSlot } from "@/components/seller/DraggableVariantGrid";
import { RichTextEditor } from "@/components/seller/RichTextEditor";
import { ProductDocumentsEditor, type DocSlot } from "@/components/seller/ProductDocumentsEditor";
import { saveProductDocuments } from "@/app/actions/product-documents";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";
const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] focus:border-transparent transition-shadow";

function Field({ label, hint, required, icon: Icon, children }: {
  label: string; hint?: string; required?: boolean; icon?: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {Icon && (
          <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ backgroundColor: "#EDE9F6" }}>
            <Icon className="h-3.5 w-3.5" style={{ color: PURPLE }} />
          </span>
        )}
        <label className="text-sm font-semibold text-gray-700">
          {label}{required && <span className="ml-1 font-bold" style={{ color: GOLD }}>*</span>}
        </label>
      </div>
      {children}
      {hint && <p className="text-xs text-gray-400 pl-8">{hint}</p>}
    </div>
  );
}

function Section({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1" style={{ background: `linear-gradient(to right, ${GOLD}55, transparent)` }} />
      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>{title}</span>
      <span className="h-px flex-1" style={{ background: `linear-gradient(to left, ${GOLD}55, transparent)` }} />
    </div>
  );
}

export function NewProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariants] = useState<VariantSlot[]>([newSlot(true)]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [requireOrderRequest, setRequireOrderRequest] = useState(false);
  const [showStock, setShowStock] = useState(true);
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [docs, setDocs] = useState<DocSlot[]>([]);
  const [userId, setUserId] = useState("");

  // Get userId on mount for document uploads
  useEffect(() => {
    import("@/lib/supabase/client").then(({ createBrowserClient }) => {
      createBrowserClient().auth.getUser().then(({ data: { user } }) => {
        if (user) setUserId(user.id);
      });
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Capture form element immediately — before any await (React nullifies the event after)
    const formEl = e.currentTarget;

    try {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Upload images directly browser → Supabase (no Next.js in the middle)
      const slotsWithImages = variants.filter((v) => v.file || v.existingUrl);
      if (slotsWithImages.length > 0) setStatus("Uploading images…");

      const uploadedVariants = await Promise.all(
        variants.map(async (v, i) => {
          const url = v.file
            ? await uploadProductImage(v.file, user.id, i)
            : (v.existingUrl ?? null);
          return { url, code: v.code, price: v.price ? parseFloat(v.price) : null, isMaster: v.isMaster };
        })
      );

      // 2. Call server action with URLs only (no file bytes)
      setStatus("Saving product…");
      const formData = new FormData(formEl);
      const specObj: Record<string, string> = {};
      specs.forEach(({ key, value }) => { if (key && value) specObj[key] = value; });
      formData.set("specifications", JSON.stringify(specObj));
      formData.set("variantsJson", JSON.stringify(uploadedVariants));
      formData.set("requireOrderRequest", requireOrderRequest ? "true" : "false");
      formData.set("showStock", showStock ? "true" : "false");
      formData.set("description", descriptionHtml);

      const result = await createProduct(formData);
      if (result.error) throw new Error(result.error);

      // Save documents if any
      if (result.data && docs.length > 0) {
        const readyDocs = docs.filter((d) => d.url && !d.uploading && !d.error);
        await saveProductDocuments(result.data.id, readyDocs);
      }

      router.push("/seller/products");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span className="mt-0.5 shrink-0">⚠</span> {error}
        </div>
      )}

      <Section title="Product Images & Variants" />
      <DraggableVariantGrid variants={variants} onChange={setVariants} />

      <Section title="Product Details" />
      <Field label="Product Name" required icon={Tag}>
        <input name="name" type="text" required className={inputClass} placeholder="e.g., Premium Flooring Collection" />
      </Field>
      <Field label="Description" required icon={FileText}>
        <RichTextEditor
          value={descriptionHtml}
          onChange={setDescriptionHtml}
          placeholder="Describe your product — materials, dimensions, key features, use cases…"
        />
      </Field>

      <Section title="Pricing & Inventory" />
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Category" required icon={Layers}>
          <div className="relative">
            <select name="categoryId" required className={`${inputClass} appearance-none pr-9`}>
              <option value="">Select a category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </Field>
        <Field label="Master Price (CAD)" required icon={DollarSign}>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">$</span>
            <input name="price" type="number" step="0.01" min="0" required className={`${inputClass} pl-7`} placeholder="299.99" />
          </div>
          {/* Require Order Request + Show Stock toggles */}
          <div
            className="flex items-center justify-between rounded-xl border px-3 py-2.5 mt-1"
            style={{ borderColor: requireOrderRequest ? PURPLE : `${GOLD}44`, background: requireOrderRequest ? "#EDE9F6" : "#fdfbf7" }}
          >
            <div className="flex-1 pr-3">
              <p className="text-xs font-semibold text-gray-800">Require Order Request</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                Buyers must submit a request instead of buying directly.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={requireOrderRequest}
              onClick={() => setRequireOrderRequest((v) => !v)}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] focus:ring-offset-2"
              style={{
                backgroundColor: requireOrderRequest ? PURPLE : "#D1D5DB",
                borderColor: requireOrderRequest ? PURPLE : "#D1D5DB",
              }}
            >
              <span
                className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200"
                style={{ transform: requireOrderRequest ? "translateX(19px)" : "translateX(1px)", marginTop: 1 }}
              />
            </button>
          </div>
          <div
            className="flex items-center justify-between rounded-xl border px-3 py-2.5 mt-1"
            style={{ borderColor: showStock ? `${GOLD}44` : "#E5E7EB", background: showStock ? "#fdfbf7" : "#F9FAFB" }}
          >
            <div className="flex-1 pr-3">
              <p className="text-xs font-semibold text-gray-800">Show Stock Status</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                Display "In Stock / Out of Stock" on the product page.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showStock}
              onClick={() => setShowStock((v) => !v)}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] focus:ring-offset-2"
              style={{
                backgroundColor: showStock ? PURPLE : "#D1D5DB",
                borderColor: showStock ? PURPLE : "#D1D5DB",
              }}
            >
              <span
                className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200"
                style={{ transform: showStock ? "translateX(19px)" : "translateX(1px)", marginTop: 1 }}
              />
            </button>
          </div>
        </Field>
        <Field label="Compare at Price (CAD)" icon={DollarSign} hint="Original price — shows a discount badge">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">$</span>
            <input name="compareAtPrice" type="number" step="0.01" min="0" className={`${inputClass} pl-7`} placeholder="349.99" />
          </div>
        </Field>
        <Field label="Stock Quantity" required icon={Hash}>
          <input name="stockQuantity" type="number" min="0" required className={inputClass} placeholder="100" />
        </Field>
      </div>

      <Section title="Specifications" />
      <SpecificationsEditor specs={specs} onChange={setSpecs} />

      <Section title="Product Documents" />
      <ProductDocumentsEditor userId={userId} docs={docs} onChange={setDocs} />

      {/* Publish status */}
      <div className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: `${GOLD}44`, background: "#fdfbf7" }}>
        <div>
          <p className="text-sm font-semibold text-gray-800">Publish Status</p>
          <p className="text-xs text-gray-400 mt-0.5">Draft saves the product without making it visible to buyers</p>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 shrink-0">
          <label className="cursor-pointer">
            <input type="radio" name="publishStatus" value="active" defaultChecked className="sr-only peer" />
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors peer-checked:bg-green-500 peer-checked:text-white text-gray-500 hover:bg-gray-50">
              ● Publish
            </span>
          </label>
          <label className="cursor-pointer border-l border-gray-200">
            <input type="radio" name="publishStatus" value="draft" className="sr-only peer" />
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors peer-checked:bg-gray-500 peer-checked:text-white text-gray-500 hover:bg-gray-50">
              ○ Draft
            </span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 border-t pt-4" style={{ borderColor: `${GOLD}44` }}>
        <LuxuryButton type="button" variant="outline" size="md" onClick={() => router.back()}>Cancel</LuxuryButton>
        <LuxuryButton type="submit" loading={loading} size="md" className="flex-1">
          {loading ? status || "Working…" : "Create Product"}
        </LuxuryButton>
      </div>
    </form>
  );
}
