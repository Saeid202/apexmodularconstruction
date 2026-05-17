"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProduct } from "@/app/actions/seller";
import { uploadProductImage } from "@/lib/uploadProductImage";
import { createBrowserClient } from "@/lib/supabase/client";
import type { SellerProduct } from "@/app/actions/seller";
import type { Category } from "@/types/database";
import { X, Tag, DollarSign, Layers, Hash, FileText, ChevronDown, ToggleLeft, Settings } from "lucide-react";
import Link from "next/link";
import { LuxuryButton } from "@/components/seller/LuxuryButton";
import { CustomizationSuiteSimple } from "@/components/seller/customization/CustomizationSuiteSimple";
import { DraggableVariantGrid, newSlot, type VariantSlot } from "@/components/seller/DraggableVariantGrid";
import { SpecificationsEditor } from "@/components/seller/SpecificationsEditor";
import { RichTextEditor } from "@/components/seller/RichTextEditor";
import { ProductDocumentsEditor, type DocSlot } from "@/components/seller/ProductDocumentsEditor";
import { saveProductDocuments } from "@/app/actions/product-documents";
import { extractYouTubeId, getYouTubeEmbedUrl, isValidYouTubeUrl } from "@/lib/youtube";

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

export function EditProductForm({ product, categories, initialDocuments, userId: propUserId }: EditProductFormProps & { initialDocuments?: any[], userId?: string }) {
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
  const [userId, setUserId] = useState<string>(propUserId || "");
  const [youtubeUrl, setYoutubeUrl] = useState<string>((product as any).youtube_url ?? "");
  const [hasCustomization, setHasCustomization] = useState<boolean>(product.has_customization ?? false);
  const [customGroups, setCustomGroups] = useState<any[]>([]);
  const [configuratorType, setConfiguratorType] = useState<'none' | 'house'>(
    ((product as any).configurator_type as string) === 'house' ? 'house' : 'none'
  );

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

    // Load existing customizations
    if (product.product_customization_groups?.length > 0) {
      setCustomGroups(
        product.product_customization_groups.map((g) => ({
          id: g.id,
          name: g.name,
          options: g.options.map((o) => ({
            id: o.id,
            name: o.name,
            priceModifier: String(o.price_modifier),
            imageUrl: o.image_url ?? "",
          })),
        }))
      );
    }

    // Load initial documents from props
    if (initialDocuments) {
      setDocs(initialDocuments.map((d: any) => ({
        id: d.id,
        name: d.name,
        url: d.url,
        file_type: d.file_type,
        storage_path: d.storage_path,
        position: d.position,
      })));
    }
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
    const formData = new FormData(formEl);

    try {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated"); setLoading(false); return; }

      console.log('Starting product save process...');
      console.log('hasCustomization:', hasCustomization);
      console.log('customGroups length:', customGroups.length);

      if (hasCustomization && customGroups.length > 0) {
        const customizationsJson = JSON.stringify(customGroups);
        console.log('customizationsJson size:', customizationsJson.length);
        formData.set("customizationsJson", customizationsJson);
      } else {
        formData.set("customizationsJson", "[]");
      }

      formData.set("configuratorType", configuratorType);
      console.log('Calling updateProduct...');
      setLoadingMsg("Saving changes...");
      const result = await updateProduct(product.id, formData);
      console.log('updateProduct result:', result);

      if (result.error) { 
        console.error('updateProduct error:', result.error);
        setError(result.error); 
        setLoading(false); 
        return; 
      }

      console.log('Product updated successfully, saving documents...');
      // Save documents
      const readyDocs = docs.filter((d) => d.url && !d.uploading && !d.error);
      await saveProductDocuments(product.id, readyDocs);
      console.log('Documents saved');

      console.log('Save process completed');
      // If just enabled as interactive house, redirect to calibration tool
      if (configuratorType === 'house') {
        router.push(`/admin/configurator/calibrate/${product.id}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error during save:', error);
      setError('An error occurred while saving. Please try again.');
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
          <div className="mt-3">
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Price Type</label>
            <div className="relative">
              <select id="priceType" name="priceType" required defaultValue={product.price_type || 'unit'} className={`${inputClass} appearance-none pr-9 text-sm`}>
                <option value="unit">per Unit</option>
                <option value="sqm">per SQM (Square Meter)</option>
                <option value="sqf">per SQF (Square Foot)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
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

      <Section title="Product Video" />
      <Field label="YouTube Video URL" hint="Paste any YouTube link — watch, youtu.be, or Shorts. The video is hosted on YouTube, not uploaded here.">
        <input
          name="youtubeUrl"
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className={inputClass}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        {youtubeUrl && !isValidYouTubeUrl(youtubeUrl) && (
          <p className="text-xs text-red-500 pl-8 mt-1">That doesn&apos;t look like a valid YouTube URL.</p>
        )}
        {youtubeUrl && isValidYouTubeUrl(youtubeUrl) && (() => {
          const id = extractYouTubeId(youtubeUrl)!;
          return (
            <div className="mt-3 rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${GOLD}55` }}>
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={getYouTubeEmbedUrl(id)}
                  title="Product video preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                  loading="lazy"
                />
              </div>
              <div className="px-3 py-2" style={{ backgroundColor: "#fdfbf7" }}>
                <p className="text-xs font-bold text-green-700">✓ Valid YouTube video — preview above</p>
                <p className="text-[11px] text-gray-400 mt-0.5 break-all">{youtubeUrl.trim()}</p>
              </div>
            </div>
          );
        })()}
      </Field>

      <Section title="Customization Options" />
      <div
        className="flex items-center justify-between rounded-xl border px-3 py-2.5 mb-4"
        style={{ borderColor: hasCustomization ? PURPLE : `${GOLD}44`, background: hasCustomization ? "#EDE9F6" : "#fdfbf7" }}
      >
        <div className="flex-1 pr-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" style={{ color: hasCustomization ? PURPLE : GOLD }} />
            <p className="text-xs font-bold text-gray-800">Enable Customization Suite</p>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
            Allow buyers to select custom doors, windows, flooring, etc. (Like topping on a pizza!)
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={hasCustomization}
          onClick={() => setHasCustomization(!hasCustomization)}
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] focus:ring-offset-2"
          style={{
            backgroundColor: hasCustomization ? PURPLE : "#D1D5DB",
            borderColor: hasCustomization ? PURPLE : "#D1D5DB",
          }}
        >
          <span
            className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200"
            style={{ transform: hasCustomization ? "translateX(19px)" : "translateX(1px)", marginTop: 1 }}
          />
        </button>
      </div>

      {hasCustomization && (
        <CustomizationSuiteSimple 
          productId={product.id} 
          userId={userId} 
          initialEnabled={true} 
          customGroups={customGroups}
          onCustomGroupsChange={setCustomGroups}
        />
      )}

      <Section title="Interactive Configurator" />
      <div
        className="flex items-center justify-between rounded-xl border px-3 py-2.5 mb-4"
        style={{ borderColor: configuratorType === 'house' ? PURPLE : `${GOLD}44`, background: configuratorType === 'house' ? "#EDE9F6" : "#fdfbf7" }}
      >
        <div className="flex-1 pr-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" style={{ color: configuratorType === 'house' ? PURPLE : GOLD }} />
            <p className="text-xs font-bold text-gray-800">Enable Interactive Building Engine</p>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
            Designate this product as a customizable prefab house. Saving will take you to the Calibration Tool.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={configuratorType === 'house'}
          onClick={() => setConfiguratorType(configuratorType === 'house' ? 'none' : 'house')}
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] focus:ring-offset-2"
          style={{
            backgroundColor: configuratorType === 'house' ? PURPLE : "#D1D5DB",
            borderColor: configuratorType === 'house' ? PURPLE : "#D1D5DB",
          }}
        >
          <span
            className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200"
            style={{ transform: configuratorType === 'house' ? "translateX(19px)" : "translateX(1px)", marginTop: 1 }}
          />
        </button>
      </div>
      {configuratorType === 'house' && (
        <Link
          href={`/admin/configurator/calibrate/${product.id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 mb-4"
          style={{ background: `linear-gradient(135deg, ${PURPLE}, #3a1570)`, color: 'white', border: `1.5px solid ${GOLD}` }}
        >
          <Layers className="h-4 w-4" />
          Open Calibration Tool →
        </Link>
      )}

      <div className="flex gap-3 pt-4 border-t" style={{ borderColor: `${GOLD}44` }}>
        <LuxuryButton type="button" variant="outline" size="md" onClick={() => router.back()}>Cancel</LuxuryButton>
        <LuxuryButton type="submit" loading={loading} size="md" className="flex-1">
          {loading ? loadingMsg : "Save Changes"}
        </LuxuryButton>
      </div>
    </form>
  );
}
