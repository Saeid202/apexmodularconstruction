"use client";

import { useMemo, useState, useEffect } from "react";
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
  Globe,
  Palette,
  Link as LinkIcon,
  Compass,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { updateArchitectProfile } from "@/app/actions/architect";
import { generateStudioDesign } from "@/app/actions/architect-ai-designer";
import { BLOCK_LIBRARY, getBlockDefinition } from "@/types/page-builder";
import type { Block, BlockType, PageLayout } from "@/types/page-builder";
import { PageRenderer } from "./PageRenderer";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutTemplate,
  Type,
  Image: ImageIcon,
  Sparkles,
};

const colorPresets = [
  { name: "Emerald Green", value: "#10B981" },
  { name: "Classic Navy", value: "#1E3A8A" },
  { name: "Charcoal Slate", value: "#334155" },
  { name: "Burgundy Wine", value: "#991B1B" },
  { name: "Luxury Gold", value: "#D97706" },
  { name: "Amethyst Violet", value: "#7C3AED" },
];

function createBlock(type: BlockType): Block {
  const def = getBlockDefinition(type)!;
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${type}-${Date.now()}`;
  return { id, type, props: { ...def.defaults } } as Block;
}

interface PageBuilderEditorProps {
  initialProfile: any;
}

export function PageBuilderEditor({ initialProfile }: PageBuilderEditorProps) {
  const [activeTab, setActiveTab] = useState<"blocks" | "branding">("blocks");

  // Parse branding settings
  const branding = initialProfile?.branding || {};
  
  const [subdomain, setSubdomain] = useState(initialProfile?.subdomain || "");
  const [title, setTitle] = useState(branding.title || initialProfile?.firm_name || initialProfile?.full_name || "");
  const [tagline, setTagline] = useState(branding.tagline || "Apex Authorized Architect Studio");
  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor || "#10B981");
  const [secondaryColor, setSecondaryColor] = useState(branding.secondaryColor || "#0F172A");
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl || "");
  
  // Socials
  const [instagram, setInstagram] = useState(branding.instagram || "");
  const [linkedin, setLinkedin] = useState(branding.linkedin || "");
  const [twitter, setTwitter] = useState(branding.twitter || "");

  // Hero Section Configuration
  const heroConfig = branding.heroConfig || {};
  const [heroBgType, setHeroBgType] = useState<"color" | "image" | "slider">(heroConfig.bgType || "color");
  const [heroBgImage, setHeroBgImage] = useState(heroConfig.singleImageUrl || "");
  const [heroBgSlider, setHeroBgSlider] = useState<string[]>(heroConfig.sliderImages || []);
  const [heroTextAlignment, setHeroTextAlignment] = useState<"left" | "center">(heroConfig.textAlignment || "left");
  const [heroOverlayOpacity, setHeroOverlayOpacity] = useState<number>(heroConfig.textOverlayOpacity !== undefined ? heroConfig.textOverlayOpacity * 100 : 20);
  const [ctaText, setCtaText] = useState(heroConfig.ctaButton?.text || "Browse Catalog");
  const [ctaLink, setCtaLink] = useState(heroConfig.ctaButton?.link || "#portfolio");

  // Page blocks layout state
  const [layout, setLayout] = useState<PageLayout>(
    Array.isArray(branding.layout) ? (branding.layout as PageLayout) : []
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiRunning, setAiRunning] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const selected = useMemo(() => layout.find((b) => b.id === selectedId) ?? null, [layout, selectedId]);
  const selectedDef = selected ? getBlockDefinition(selected.type) : null;

  // Subdomain Validation
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const handleSubdomainChange = (val: string) => {
    const cleanVal = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSubdomain(cleanVal);

    if (cleanVal && cleanVal.length < 3) {
      setSubdomainError("Subdomain must be at least 3 characters.");
    } else {
      setSubdomainError(null);
    }
  };

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
    if (subdomainError) return;
    setSaving(true);
    setMessage(null);

    const brandingPayload = {
      ...branding,
      title,
      tagline,
      primaryColor,
      secondaryColor,
      instagram,
      linkedin,
      twitter,
      logoUrl,
      heroConfig: {
        bgType: heroBgType,
        singleImageUrl: heroBgImage,
        sliderImages: heroBgSlider,
        textAlignment: heroTextAlignment,
        textOverlayOpacity: heroOverlayOpacity / 100,
        ctaButton: {
          text: ctaText,
          link: ctaLink,
        },
      },
      layout,
    };

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
      subdomain: subdomain || null,
      branding: brandingPayload,
    });

    setSaving(false);
    setMessage(
      result.success
        ? { kind: "ok", text: "Page and brand settings successfully published live!" }
        : { kind: "err", text: result.error || "Failed to save settings." }
    );
    if (result.success) setTimeout(() => setMessage(null), 4000);
  }

  const handleAiDesign = async () => {
    if (!aiPrompt.trim()) return;
    setAiRunning(true);
    setAiFeedback(null);

    const currentConfig = {
      title,
      tagline,
      primaryColor,
      secondaryColor,
      heroBgType,
      heroTextAlignment,
      heroOverlayOpacity,
      ctaText,
      ctaLink
    };

    try {
      const res = await generateStudioDesign(aiPrompt, currentConfig);
      if (res.success && res.design) {
        const d = res.design;
        let changes: string[] = [];
        if (d.title !== undefined) {
          setTitle(d.title);
          changes.push(`Title: "${d.title}"`);
        }
        if (d.tagline !== undefined) {
          setTagline(d.tagline);
          changes.push(`Tagline: "${d.tagline}"`);
        }
        if (d.primaryColor !== undefined) {
          setPrimaryColor(d.primaryColor);
          changes.push(`Primary Color: ${d.primaryColor}`);
        }
        if (d.secondaryColor !== undefined) {
          setSecondaryColor(d.secondaryColor);
          changes.push(`Secondary Color: ${d.secondaryColor}`);
        }
        if (d.heroBgType !== undefined) {
          setHeroBgType(d.heroBgType);
          changes.push(`Bg Type: ${d.heroBgType}`);
        }
        if (d.heroTextAlignment !== undefined) {
          setHeroTextAlignment(d.heroTextAlignment);
          changes.push(`Text Alignment: ${d.heroTextAlignment}`);
        }
        if (d.heroOverlayOpacity !== undefined) {
          setHeroOverlayOpacity(d.heroOverlayOpacity);
          changes.push(`Overlay Opacity: ${d.heroOverlayOpacity}%`);
        }
        if (d.ctaText !== undefined) {
          setCtaText(d.ctaText);
          changes.push(`CTA Text: "${d.ctaText}"`);
        }
        if (d.ctaLink !== undefined) {
          setCtaLink(d.ctaLink);
          changes.push(`CTA Link: "${d.ctaLink}"`);
        }
        
        if (changes.length > 0) {
          setAiFeedback(`Applied updates: ${changes.join(", ")}`);
          setAiPrompt("");
        } else {
          setAiFeedback("Design was processed, but no values needed changing.");
        }
      } else {
        setMessage({ kind: "err", text: res.error || "AI Designer could not process that request." });
      }
    } catch (e: any) {
      setMessage({ kind: "err", text: e.message || "Failed to generate AI design." });
    } finally {
      setAiRunning(false);
    }
  };

  // Build live URLs
  const [mounted, setMounted] = useState(false);
  const [host, setHost] = useState("apex.com");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setHost(window.location.host);
    }
  }, []);

  const rootDomain = host.replace("www.", "");
  const publicUrl = subdomain ? `http://${subdomain}.${rootDomain}` : "";
  const subpathUrl = subdomain ? `http://${host}/studio/${subdomain}` : "";

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 lg:p-8">
      {/* Left rail: palette + settings / blocks switcher */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        
        {/* Toggle between Blocks and Branding */}
        <div className="flex p-1 bg-gray-200/80 backdrop-blur rounded-2xl border border-gray-300/40">
          <button
            type="button"
            onClick={() => setActiveTab("blocks")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "blocks"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Page Blocks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("branding")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "branding"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Branding & Subdomain
          </button>
        </div>

        {activeTab === "blocks" ? (
          <>
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
          </>
        ) : (
          <div className="space-y-6 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
            
            {/* AI Storefront Copilot */}
            <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-lg p-4 space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
                <h3 className="font-bold text-white text-xs">AI Storefront Copilot</h3>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Describe the design you want in plain English to automatically apply theme updates.
              </p>
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Set a luxury gold theme and center-align the content"
                  className="w-full px-3 py-2 border border-slate-800 rounded-xl bg-slate-900 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
                <button
                  type="button"
                  disabled={aiRunning || !aiPrompt.trim()}
                  onClick={handleAiDesign}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-900 disabled:text-slate-600 text-white text-xs font-bold rounded-xl transition-all"
                >
                  {aiRunning ? "Designing..." : "Apply AI Design"}
                </button>
                {aiFeedback && (
                  <p className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[10px] text-emerald-400 leading-snug break-words">
                    {aiFeedback}
                  </p>
                )}
              </div>
            </div>

            {/* Subdomain settings */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-400" />
                <h3 className="font-bold text-gray-900 text-xs">Public Subdomain Name</h3>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-gray-500 block">Subdomain Slug</label>
                <div className="relative flex rounded-xl border border-gray-200 bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                  <input
                    type="text"
                    required
                    placeholder="my-studio-name"
                    value={subdomain}
                    onChange={(e) => handleSubdomainChange(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white text-xs focus:outline-none placeholder:text-gray-400 font-semibold"
                  />
                  <span className="px-3 py-2 text-[10px] text-slate-500 font-medium border-l border-gray-200 select-none flex items-center">
                    .{rootDomain}
                  </span>
                </div>
                {subdomainError && (
                  <p className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" /> {subdomainError}
                  </p>
                )}

                {subdomain && !subdomainError && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1 text-[10px]">
                    <span className="font-semibold text-slate-400">Live URL Previews:</span>
                    <a href={publicUrl} className="block text-emerald-600 font-bold hover:underline truncate" target="_blank" rel="noreferrer">
                      {publicUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* General theme customization */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-slate-400" />
                <h3 className="font-bold text-gray-900 text-xs">Storefront Customization</h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 block">Public Site Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 block">Studio Tagline</label>
                  <input
                    type="text"
                    required
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-semibold text-gray-500">Logo Image URL</label>
                    <label className="text-[10px] text-emerald-600 hover:text-emerald-700 cursor-pointer font-bold">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append("file", file);
                          const { uploadArchitectImage } = await import("@/app/actions/architect");
                          const result = await uploadArchitectImage(formData);
                          if (result.success && result.url) setLogoUrl(result.url);
                          else alert(result.error || "Upload failed");
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Primary theme color presets */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-gray-500 block">Primary Theme Color</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setPrimaryColor(preset.value)}
                        className={`flex items-center gap-1.5 p-1.5 border rounded-lg text-[10px] font-medium transition-all ${
                          primaryColor === preset.value
                            ? "border-emerald-600 bg-emerald-50 font-bold"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: preset.value }} />
                        <span className="truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 p-0 border border-gray-200 rounded-lg cursor-pointer bg-transparent"
                    />
                    <span className="text-[10px] font-semibold font-mono text-gray-600">{primaryColor.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Default Hero customizer */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-slate-400" />
                <h3 className="font-bold text-gray-900 text-xs">Hero Background Customizer</h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 block">Background Type</label>
                  <select
                    value={heroBgType}
                    onChange={(e) => setHeroBgType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    <option value="color">Solid Theme Color</option>
                    <option value="image">Single Background Image</option>
                    <option value="slider">Background Image Slideshow</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 block">Text Alignment</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["left", "center"] as const).map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => setHeroTextAlignment(align)}
                        className={`py-1.5 border rounded-lg text-[10px] font-semibold capitalize ${
                          heroTextAlignment === align ? "border-emerald-600 bg-emerald-50" : "border-gray-200"
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-semibold text-gray-500">Dark Overlay Opacity</label>
                    <span className="text-[10px] font-mono text-gray-500">{heroOverlayOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={heroOverlayOpacity}
                    onChange={(e) => setHeroOverlayOpacity(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                {/* Hero single image URL */}
                {heroBgType === "image" && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-semibold text-gray-500">Background Image</label>
                      <label className="text-[10px] text-emerald-600 hover:text-emerald-700 cursor-pointer font-bold">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append("file", file);
                            const { uploadArchitectImage } = await import("@/app/actions/architect");
                            const result = await uploadArchitectImage(formData);
                            if (result.success && result.url) setHeroBgImage(result.url);
                            else alert(result.error || "Upload failed");
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <input
                      type="url"
                      value={heroBgImage}
                      onChange={(e) => setHeroBgImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {/* Hero Slider Images list */}
                {heroBgType === "slider" && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-semibold text-gray-500">Slide Images ({heroBgSlider.length})</label>
                      <label className="text-[10px] text-emerald-600 hover:text-emerald-700 cursor-pointer font-bold">
                        Add Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append("file", file);
                            const { uploadArchitectImage } = await import("@/app/actions/architect");
                            const result = await uploadArchitectImage(formData);
                            if (result.success && result.url) setHeroBgSlider([...heroBgSlider, result.url]);
                            else alert(result.error || "Upload failed");
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {heroBgSlider.length > 0 && (
                      <div className="grid grid-cols-3 gap-1">
                        {heroBgSlider.map((img, idx) => (
                          <div key={idx} className="relative aspect-video rounded border overflow-hidden bg-gray-50 group">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const nextSlider = [...heroBgSlider];
                                nextSlider.splice(idx, 1);
                                setHeroBgSlider(nextSlider);
                              }}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[8px] font-bold transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Call to action button text & link */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-500 block">CTA Label</label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-500 block">CTA Link</label>
                    <input
                      type="text"
                      value={ctaLink}
                      onChange={(e) => setCtaLink(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social media settings */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-slate-400" />
                <h3 className="font-bold text-gray-900 text-xs">Social Connections</h3>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 block">Instagram URL</label>
                  <input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 block">LinkedIn URL</label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 block">Twitter / X URL</label>
                  <input
                    type="url"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://twitter.com/..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

          </div>
        )}
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
              disabled={saving || !!subdomainError}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save & Publish"}
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
