"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutTemplate,
  Type,
  Image as ImageIcon,
  Sparkles,
  Columns2,
  Eye,
  X,
  Check,
  AlertTriangle,
  Loader2,
  Wand2,
} from "lucide-react";
import { updateArchitectProfile } from "@/app/actions/architect";
import type { Architect } from "@/types/database";
import { getBlockDefinition } from "@/types/page-builder";
import type { PageLayout } from "@/types/page-builder";
import {
  PAGE_TEMPLATES,
  buildTemplatePreview,
  instantiateTemplate,
} from "@/types/page-builder-templates";
import type { PageTemplate } from "@/types/page-builder-templates";
import { PageRenderer } from "./PageRenderer";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutTemplate,
  Type,
  Image: ImageIcon,
  Sparkles,
  Columns2,
};

/** Width the preview is composed at before being scaled down to fit its card. */
const DESIGN_WIDTH = 1280;

/**
 * Renders a real block layout at desktop width, then scales it to fit the
 * available space. Reuses the same renderer as the live page, so a thumbnail
 * can never drift from what actually gets published.
 */
function ScaledPreview({
  layout,
  primaryColor,
  height,
}: {
  layout: PageLayout;
  primaryColor: string;
  height: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      if (el.clientWidth > 0) setScale(el.clientWidth / DESIGN_WIDTH);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative overflow-hidden bg-white" style={{ height }}>
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 origin-top-left select-none pointer-events-none"
        style={{ width: DESIGN_WIDTH, transform: `scale(${scale})` }}
      >
        <PageRenderer layout={layout} primaryColor={primaryColor} />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}

function BlockChips({ template }: { template: PageTemplate }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {template.blocks.map((block, i) => {
        const def = getBlockDefinition(block.type);
        const Icon = ICONS[def?.icon ?? ""] ?? LayoutTemplate;
        return (
          <span
            key={`${block.type}-${i}`}
            className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600"
          >
            <Icon className="h-3 w-3 text-emerald-600" />
            {def?.label ?? block.type}
          </span>
        );
      })}
    </div>
  );
}

interface TemplateGalleryProps {
  initialProfile: Architect | null;
}

export function TemplateGallery({ initialProfile }: TemplateGalleryProps) {
  const router = useRouter();

  const branding = initialProfile?.branding || {};
  const primaryColor: string = branding.primaryColor || "#10B981";
  const existingLayout: PageLayout = Array.isArray(branding.layout) ? (branding.layout as PageLayout) : [];
  const hasExistingPage = existingLayout.length > 0;

  const [previewId, setPreviewId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previews = useMemo(
    () => Object.fromEntries(PAGE_TEMPLATES.map((t) => [t.id, buildTemplatePreview(t)])),
    []
  );

  const previewTemplate = previewId ? PAGE_TEMPLATES.find((t) => t.id === previewId) ?? null : null;

  // Close the preview modal on Escape.
  useEffect(() => {
    if (!previewTemplate) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewTemplate]);

  async function applyTemplate(template: PageTemplate) {
    setApplyingId(template.id);
    setError(null);

    // Only `branding.layout` changes — every other profile field and branding
    // key is passed through untouched, exactly like the page builder's save.
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
      branding: { ...branding, layout: instantiateTemplate(template) },
    });

    if (!result.success) {
      setApplyingId(null);
      setConfirmId(null);
      setError(result.error || "Failed to apply template.");
      return;
    }

    // Land the architect in the editor with the template already loaded.
    setPreviewId(null);
    router.push("/architect/page-builder");
  }

  function handleUse(template: PageTemplate) {
    if (hasExistingPage && confirmId !== template.id) {
      setConfirmId(template.id);
      setError(null);
      return;
    }
    void applyTemplate(template);
  }

  const busy = applyingId !== null;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {error}
        </div>
      ) : null}

      {hasExistingPage ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-900">
            You already have a page with {existingLayout.length}{" "}
            {existingLayout.length === 1 ? "block" : "blocks"}. Applying a template replaces it, so we
            will ask you to confirm first.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {PAGE_TEMPLATES.map((template) => {
          const isApplying = applyingId === template.id;
          const isConfirming = confirmId === template.id;
          return (
            <div
              key={template.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="space-y-2 border-b border-gray-100 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{template.name}</h3>
                    <p className="mt-0.5 text-sm text-gray-500">{template.tagline}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                    {template.blocks.length} blocks
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {template.bestFor.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewId(template.id)}
                className="group relative block w-full cursor-pointer border-b border-gray-100 text-left"
                aria-label={`Preview the ${template.name} template`}
              >
                <ScaledPreview layout={previews[template.id]} primaryColor={primaryColor} height={220} />
                <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition-all group-hover:bg-slate-900/40 group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-md">
                    <Eye className="h-4 w-4" /> Preview full page
                  </span>
                </span>
              </button>

              <div className="flex flex-1 flex-col gap-4 p-5">
                <p className="text-sm leading-relaxed text-gray-600">{template.description}</p>
                <BlockChips template={template} />

                <div className="mt-auto space-y-2 pt-1">
                  {isConfirming ? (
                    <p className="text-xs font-medium text-amber-700">
                      This replaces your current {existingLayout.length}-block page. You can still edit
                      everything afterwards.
                    </p>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUse(template)}
                      disabled={busy}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-50 ${
                        isConfirming ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Applying…
                        </>
                      ) : isConfirming ? (
                        <>
                          <Check className="h-4 w-4" /> Yes, replace my page
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4" /> Use this template
                        </>
                      )}
                    </button>
                    {isConfirming && !isApplying ? (
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPreviewId(template.id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Eye className="h-4 w-4" /> Preview
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-page preview */}
      {previewTemplate ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${previewTemplate.name} preview`}
          onClick={() => setPreviewId(null)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">{previewTemplate.name}</h3>
                <p className="text-xs text-gray-500">
                  Preview only — nothing is saved until you apply it.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUse(previewTemplate)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {applyingId === previewTemplate.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Applying…
                    </>
                  ) : confirmId === previewTemplate.id ? (
                    <>
                      <Check className="h-4 w-4" /> Yes, replace my page
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" /> Use this template
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewId(null)}
                  className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
                  aria-label="Close preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-white">
              <PageRenderer layout={previews[previewTemplate.id]} primaryColor={primaryColor} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
