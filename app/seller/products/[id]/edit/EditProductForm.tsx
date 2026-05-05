"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProduct } from "@/app/actions/seller";
import { uploadProductImage } from "@/lib/uploadProductImage";
import { createBrowserClient } from "@/lib/supabase/client";
import type { SellerProduct } from "@/app/actions/seller";
import type { Category } from "@/types/database";
import { X, Tag, DollarSign, Layers, Hash, FileText, ChevronDown, ToggleLeft } from "lucide-react";import { LuxuryButton } from "@/components/seller/LuxuryButton";
import { DraggableVariantGrid, newSlot, type VariantSlot } from "@/components/seller/DraggableVariantGrid";
import { SpecificationsEditor } from "@/components/seller/SpecificationsEditor";
import { RichTextEditor } from "@/components/seller/RichTextEditor";
import { ProductDocumentsEditor, type DocSlot } from "@/components/seller/ProductDocumentsEditor";
import { saveProductDocuments } from "@/app/actions/product-documents";

interface EditProductFormProps {
  product: SellerProduct;
  categories: Category[];
}

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

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

const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] focus:border-transparent transition-shadow";

export function EditProductForm({ product, categories }: EditProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Saving Changes...");
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariants] = useState<VariantSlot[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [requireOrderRequest, setRequireOrderRequest] = useState<boolean>(
    (product as any).require_order_request ?? false
  );
  const [showStock, setShowStock] = useState<boolean>(
    (product as any).show_stock ?? true
  );
  const [descriptionHtml, setDescriptionHtml] = useState<string>(product.description ?? "");
  const [docs, setDocs] = useState<DocSlot[]>([]);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    if (product.product_images.length > 0) {
      const sorted = [...product.product_images].sort((a, b) => a.position - b.position);
      const hasMaster = sorted.some((img) => (img as any).is_master === true);
      setVariants(sorted.map((img, idx) => ({
        id: img.id,
        file: null,
        preview: null,
        existingUrl: img.url,
        code: (img as any).variant_code ?? "",
        price: (img as any).variant_price != null ? String((img as any).variant_price) : "",
        isMaster: hasMaster ? (img as any).is_master === true : idx === 0,
      })));
    } else {
      setVariants([newSlot(true)]);
    }
    const specObj = product.specifications as Record<string, string>;
    if (specObj && Object.keys(specObj).length > 0) {
      setSpecs(Object.entries(specObj).map(([key, value]) => ({ key, value })));
    }

    // Load existing documents + current user id
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
    supabase
      .from("product_documents")
      .select("*")
      .eq("product_id", product.id)
      .order("position", { ascending: true })
      .then(({ data }) => {
        if (data) {
          setDocs(data.map((d: any) => ({
            id: d.id,
            name: d.name,
            url: d.url,
            file_type: d.file_type,
            storage_path: d.storage_path,
            position: d.position,
          })));
        }
      });
  }, []);

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpec = (i: number) => setSpecs(specs.filter((_, idx) => idx !== i));
  const updateSpec = (i: number, field: "key" | "value", val: string) => {
    const updated = [...specs]; updated[i][field] = val; setSpecs(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Capture form element immediately — before any await
    const formEl = e.currentTarget;

    try {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated"); setLoading(false); return; }

      const hasNewFiles = variants.some((v) => v.file);
      if (hasNewFiles) setLoadingMsg("Uploading images...");
      const uploadedVariants = await Promise.all(
        variants.map(async (v, i) => {
          let url = v.existingUrl ?? null;
          if (v.file) url = await uploadProductImage(v.file, user.id, i);
          return { url, code: v.code, price: v.price ? parseFloat(v.price) : null, isMaster: v.isMaster };
        })
      );

      const formData = new FormData(formEl);
      const specObj: Record<string, string> = {};
      specs.forEach(({ key, value }) => { if (key && value) specObj[key] = value; });
      formData.set("specifications", JSON.stringify(specObj));
      formData.set("variantsJson", JSON.stringify(uploadedVariants));
      formData.set("requireOrderRequest", requireOrderRequest ? "true" : "false");
      formData.set("showStock", showStock ? "true" : "false");
      formData.set("description", descriptionHtml);

      setLoadingMsg("Saving changes...");
      const result = await updateProduct(product.id, formData);
      if (result.error) { setError(result.error); setLoading(false); return; }

      // Save documents
      const readyDocs = docs.filter((d) => d.url && !d.uploading && !d.error);
      await saveProductDocuments(product.id, readyDocs);

      router.push("/seller/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
          <span className="mt-0.5 shrink-0">⚠</span> {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-500">Current status:</span>
        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
          product.status === "active" ? "bg-green-100 text-green-700"
          : product.status === "pending" ? "bg-yellow-100 text-yellow-700"
          : product.status === "rejected" ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-600"
        }`}>{product.status}</span>
      </div>

      <Section title="Product Images & Variants" />
      <DraggableVariantGrid variants={variants} onChange={setVariants} />

      <Section title="Product Details" />
      <Field label="Product Name" required icon={Tag}>
        <input id="name" name="name" type="text" required defaultValue={product.name} className={inputClass} />
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
            <select id="categoryId" name="categoryId" required defaultValue={product.category_id} className={`${inputClass} appearance-none pr-9`}>
              <option value="">Select a category</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </Field>
        <Field label="Master Price (CAD)" required icon={DollarSign}>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">$</span>
            <input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={product.price} className={`${inputClass} pl-7`} />
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
        <Field label="Compare at Price (CAD)" icon={DollarSign} hint="Original price — used to show a discount badge">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">$</span>
            <input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" min="0" defaultValue={product.compare_at_price ?? ""} className={`${inputClass} pl-7`} />
          </div>
        </Field>
        <Field label="Stock Quantity" required icon={Hash}>
          <input id="stockQuantity" name="stockQuantity" type="number" min="0" required defaultValue={product.stock_quantity} className={inputClass} />
        </Field>
      </div>

      <Section title="Specifications" />
      <SpecificationsEditor specs={specs} onChange={setSpecs} />

      <Section title="Product Documents" />
      <ProductDocumentsEditor userId={userId} docs={docs} onChange={setDocs} />

      <div className="flex gap-3 pt-4 border-t" style={{ borderColor: `${GOLD}44` }}>
        <LuxuryButton type="button" variant="outline" size="md" onClick={() => router.back()}>Cancel</LuxuryButton>
        <LuxuryButton type="submit" loading={loading} size="md" className="flex-1">
          {loading ? loadingMsg : "Save Changes"}
        </LuxuryButton>
      </div>
    </form>
  );
}
