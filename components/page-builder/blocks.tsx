/**
 * Pre-built, presentational page-builder blocks.
 *
 * These are the ONLY things an architect's landing page can be composed of.
 * They are pure/presentational (no data fetching, no client state) so the same
 * components render both the live public page and the editor preview.
 *
 * Styling mirrors the existing hardcoded studio page (app/studio/[slug]) so
 * custom layouts stay on-brand with the rest of Apex Modular.
 */
import type { Block, HeroBlock, TextBlock, GalleryBlock, CtaBlock } from "@/types/page-builder";
import { ArrowRight } from "lucide-react";

interface BlockProps<T> {
  block: T;
  primaryColor: string;
}

function Hero({ block, primaryColor }: BlockProps<HeroBlock>) {
  const { badge, heading, subheading, imageUrl, primaryLabel, primaryHref, secondaryLabel, secondaryHref } =
    block.props;
  return (
    <section className="relative bg-slate-950 text-white py-24 md:py-32 px-6 overflow-hidden">
      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/70 to-slate-900/80" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.08),transparent)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900" />
        </>
      )}
      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        {badge ? (
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold"
            style={{ color: primaryColor }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
            {badge}
          </div>
        ) : null}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">{heading}</h1>
        {subheading ? <p className="text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed">{subheading}</p> : null}
        <div className="flex flex-wrap gap-4 pt-4">
          {primaryLabel ? (
            <a
              href={primaryHref || "#"}
              className="px-6 py-3 rounded-xl font-bold text-sm text-slate-900 bg-white hover:bg-slate-100 transition-all flex items-center gap-2"
            >
              {primaryLabel} <ArrowRight className="h-4 w-4" />
            </a>
          ) : null}
          {secondaryLabel ? (
            <a
              href={secondaryHref || "#"}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white border border-white/20 hover:bg-white/5 transition-all"
            >
              {secondaryLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Text({ block, primaryColor }: BlockProps<TextBlock>) {
  const { heading, body } = block.props;
  const paragraphs = (body || "").split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  return (
    <section className="py-20 px-6 max-w-3xl mx-auto space-y-6">
      {heading ? (
        <>
          <h2 className="text-3xl font-extrabold text-slate-900">{heading}</h2>
          <div className="h-1.5 w-16 rounded-full" style={{ backgroundColor: primaryColor }} />
        </>
      ) : null}
      <div className="space-y-4 text-slate-600 leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}

function Gallery({ block }: BlockProps<GalleryBlock>) {
  const { heading, images } = block.props;
  const urls = (images || "")
    .split("\n")
    .map((u) => u.trim())
    .filter(Boolean);
  return (
    <section className="bg-slate-100 py-20 px-6">
      <div className="max-w-5xl mx-auto space-y-10">
        {heading ? <h2 className="text-3xl font-extrabold text-slate-900 text-center">{heading}</h2> : null}
        {urls.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {urls.map((url, i) => (
              <div key={i} className="h-56 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover hover:scale-105 transition-all duration-500" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-slate-400">Add image URLs to populate this gallery.</p>
        )}
      </div>
    </section>
  );
}

function Cta({ block, primaryColor }: BlockProps<CtaBlock>) {
  const { heading, subtext, buttonLabel, buttonHref } = block.props;
  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-slate-900">{heading}</h2>
        {subtext ? <p className="text-slate-500 text-sm max-w-md mx-auto">{subtext}</p> : null}
        {buttonLabel ? (
          <a
            href={buttonHref || "#"}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm shadow-sm hover:opacity-95 transition-all"
            style={{ backgroundColor: primaryColor }}
          >
            {buttonLabel} <ArrowRight className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </section>
  );
}

/** Render a single block by dispatching on its `type`. */
export function BlockRenderer({ block, primaryColor }: { block: Block; primaryColor: string }) {
  switch (block.type) {
    case "hero":
      return <Hero block={block} primaryColor={primaryColor} />;
    case "text":
      return <Text block={block} primaryColor={primaryColor} />;
    case "gallery":
      return <Gallery block={block} primaryColor={primaryColor} />;
    case "cta":
      return <Cta block={block} primaryColor={primaryColor} />;
    default:
      return null;
  }
}
