"use client";

import { useState, useEffect } from "react";
import { updateArchitectProfile } from "@/app/actions/architect";
import { generateStudioDesign } from "@/app/actions/architect-ai-designer";
import { Globe, Palette, Link as LinkIcon, Compass, CheckCircle2, AlertCircle, Eye, ShieldAlert, Sparkles } from "lucide-react";

interface ArchitectStudioSettingsFormProps {
  initialProfile: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    firm_name: string | null;
    bio: string | null;
    subdomain: string | null;
    branding: any;
  } | null;
}

const colorPresets = [
  { name: "Emerald Green", value: "#10B981" },
  { name: "Classic Navy", value: "#1E3A8A" },
  { name: "Charcoal Slate", value: "#334155" },
  { name: "Burgundy Wine", value: "#991B1B" },
  { name: "Luxury Gold", value: "#D97706" },
  { name: "Amethyst Violet", value: "#7C3AED" },
];

export default function ArchitectStudioSettingsForm({ initialProfile }: ArchitectStudioSettingsFormProps) {
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

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiRunning, setAiRunning] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  // Subdomain Validation
  const handleSubdomainChange = (val: string) => {
    const cleanVal = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSubdomain(cleanVal);

    if (cleanVal && cleanVal.length < 3) {
      setSubdomainError("Subdomain must be at least 3 characters.");
    } else {
      setSubdomainError(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subdomainError) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const brandingPayload = {
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
    };

    // Save to local storage as fallback
    const localProfileData = localStorage.getItem("architect_profile_data");
    let mergedLocal = {};
    if (localProfileData) {
      try {
        mergedLocal = JSON.parse(localProfileData);
      } catch {}
    }
    localStorage.setItem(
      "architect_profile_data",
      JSON.stringify({ ...mergedLocal, subdomain, ...brandingPayload })
    );

    // Call server action
    const result = await updateArchitectProfile({
      fullName: initialProfile?.full_name || "",
      phone: initialProfile?.phone || null,
      firmName: initialProfile?.firm_name || null,
      bio: initialProfile?.bio || null,
      subdomain: subdomain || null,
      branding: brandingPayload,
    });

    setLoading(false);

    if (result.success) {
      setSuccess("Storefront settings updated successfully. Your changes are live!");
      setTimeout(() => setSuccess(null), 4000);
    } else {
      setError(result.error || "Failed to update settings. Changes saved locally.");
    }
  };

  const handleAiDesign = async () => {
    if (!aiPrompt.trim()) return;
    setAiRunning(true);
    setError(null);
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
        setError(res.error || "AI Designer could not process that request.");
      }
    } catch (e: any) {
      setError(e.message || "Failed to generate AI design.");
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

  const inputStyle = "w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-gray-400";

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto pb-12">
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl text-emerald-800 bg-emerald-50 border border-emerald-200 shadow-sm animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl text-rose-800 bg-rose-50 border border-rose-200 shadow-sm animate-fade-in">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Configuration Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Subdomain Allocation */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-slate-400" />
              <h2 className="font-bold text-slate-800 text-base">Public Subdomain Name</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Claim a unique web address for your portfolio. Clients will be able to visit your storefront directly using this address.
            </p>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">Subdomain Slug</label>
              <div className="relative flex rounded-xl border border-gray-200 bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                <input
                  type="text"
                  required
                  placeholder="my-studio-name"
                  value={subdomain}
                  onChange={(e) => handleSubdomainChange(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white text-sm focus:outline-none placeholder:text-gray-400 font-semibold"
                />
                <span className="px-4 py-2.5 text-sm text-slate-500 font-medium border-l border-gray-200 select-none">
                  .{rootDomain}
                </span>
              </div>
              {subdomainError && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" /> {subdomainError}
                </p>
              )}
            </div>

            {subdomain && !subdomainError && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <p className="text-xs font-semibold text-slate-400">Live URL Previews:</p>
                <div className="space-y-1.5">
                  <div>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1.5 break-all"
                    >
                      <Eye className="h-3.5 w-3.5 shrink-0" /> {publicUrl} (Subdomain)
                    </a>
                  </div>
                  <div>
                    <a
                      href={subpathUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-slate-500 hover:underline flex items-center gap-1.5 break-all"
                    >
                      <Eye className="h-3.5 w-3.5 shrink-0" /> {subpathUrl} (Subpath fallback)
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Storefront Designer */}
          <div className="bg-slate-950 text-white rounded-2xl border border-slate-850 shadow-xl p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Sparkles className="h-32 w-32 text-emerald-400" />
            </div>
            
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
              <h2 className="font-bold text-white text-base">AI Storefront Copilot</h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">Agent Active</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instantly customize your storefront theme, layout, colors, alignments, and button settings by typing what you want in plain English.
            </p>
            
            <div className="space-y-3">
              <textarea
                rows={2}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Set a luxury gold theme, center the text, and make the button say 'View Modular Designs'"
                className="w-full px-3.5 py-2.5 border border-slate-800 rounded-xl bg-slate-900 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
              />
              
              <button
                type="button"
                disabled={aiRunning || !aiPrompt.trim()}
                onClick={handleAiDesign}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-900 disabled:text-slate-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer disabled:cursor-not-allowed transition-all font-semibold"
              >
                {aiRunning ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI Agent Designing Theme...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Apply AI Design
                  </>
                )}
              </button>
              
              {aiFeedback && (
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-emerald-400 font-semibold animate-fade-in break-words">
                  🚀 {aiFeedback}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Branding Customizer */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-slate-400" />
              <h2 className="font-bold text-slate-800 text-base">Storefront Customization</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Public Site Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Connor Studio"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Studio Tagline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Prefab Architectures"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-700">Studio Logo Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-gray-400">Provide a hosted image link for your custom brand logo.</p>
              </div>

              {/* Theme Colors */}
              <div className="space-y-3 md:col-span-2">
                <label className="text-xs font-semibold text-gray-700 block">Primary Theme Color</label>
                
                {/* Palette Grid Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setPrimaryColor(preset.value)}
                      className={`flex items-center gap-2 p-2 border rounded-xl text-xs font-semibold transition-all ${
                        primaryColor === preset.value
                          ? "border-slate-800 bg-slate-50 ring-2 ring-slate-800"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: preset.value }} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Color Selector */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="relative">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-10 p-0 border border-gray-200 rounded-lg cursor-pointer bg-transparent"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Custom Brand Color</p>
                    <p className="text-xxs text-slate-400 font-mono">{primaryColor.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Hero Section & Slider Customization */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-slate-400" />
              <h2 className="font-bold text-slate-800 text-base">Hero Section Designer</h2>
            </div>

            <div className="space-y-4">
              {/* Background Type */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 block">Hero Background Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["color", "image", "slider"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setHeroBgType(type)}
                      className={`py-2 px-3 border rounded-xl text-xs font-semibold transition-all capitalize ${
                        heroBgType === type
                          ? "border-slate-800 bg-slate-50 ring-2 ring-slate-800"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {type === "color" ? "Solid/Gradient" : type === "image" ? "Single Image" : "Image Slider"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Alignment */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 block">Hero Content Alignment</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["left", "center"] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => setHeroTextAlignment(align)}
                      className={`py-2 px-3 border rounded-xl text-xs font-semibold transition-all capitalize ${
                        heroTextAlignment === align
                          ? "border-slate-800 bg-slate-50 ring-2 ring-slate-800"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Overlay Opacity */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-700">Dark Overlay Opacity</label>
                  <span className="text-xs font-mono text-slate-500">{heroOverlayOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={heroOverlayOpacity}
                  onChange={(e) => setHeroOverlayOpacity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <p className="text-[10px] text-gray-400">Increase this if your white text is hard to read over the background image.</p>
              </div>

              {/* CTA Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Call to Action Button Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Browse Designs"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Call to Action Link (e.g. #portfolio)</label>
                  <input
                    type="text"
                    placeholder="e.g. #portfolio"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Single Image Upload Section */}
              {heroBgType === "image" && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <label className="text-xs font-semibold text-gray-700 block">Single Background Image</label>
                  {heroBgImage && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 mb-2">
                      <img src={heroBgImage} alt="Hero Background" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setHeroBgImage("")}
                        className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-full text-xs font-bold shadow hover:bg-rose-700"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Or paste an image URL directly"
                      value={heroBgImage}
                      onChange={(e) => setHeroBgImage(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-gray-200 rounded-xl text-sm font-bold cursor-pointer shrink-0">
                      Upload File
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
                          if (result.success && result.url) {
                            setHeroBgImage(result.url);
                          } else {
                            alert(result.error || "Upload failed");
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Slider Images Upload Section */}
              {heroBgType === "slider" && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <label className="text-xs font-semibold text-gray-700 block">Slider Background Images</label>
                  
                  {/* Slider Preview Grid */}
                  {heroBgSlider.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {heroBgSlider.map((img, idx) => (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 bg-slate-50 group">
                          <img src={img} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...heroBgSlider];
                              updated.splice(idx, 1);
                              setHeroBgSlider(updated);
                            }}
                            className="absolute top-1.5 right-1.5 bg-rose-600 text-white p-1 rounded-full text-xs font-bold shadow hover:bg-rose-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl text-slate-400 text-xs">
                      No slider images uploaded yet. Upload images below to start the slideshow.
                    </div>
                  )}

                  {/* Add Image Uploader */}
                  <div className="flex justify-end pt-2">
                    <label className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold cursor-pointer flex items-center gap-1.5">
                      <span>Add Slide Image</span>
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
                          if (result.success && result.url) {
                            setHeroBgSlider([...heroBgSlider, result.url]);
                          } else {
                            alert(result.error || "Upload failed");
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Social Connections */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-slate-400" />
              <h2 className="font-bold text-slate-800 text-base">Social Media Connections</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Instagram Profile URL</label>
                <input
                  type="text"
                  placeholder="https://instagram.com/my-profile"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">LinkedIn Company URL</label>
                <input
                  type="text"
                  placeholder="https://linkedin.com/company/my-studio"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Twitter / X URL</label>
                <input
                  type="text"
                  placeholder="https://twitter.com/my-profile"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Preview Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
            <div className="p-4 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Preview Panel</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Simulated Mobile Mockup */}
            <div className="p-6 bg-slate-50 border-b border-gray-100 flex justify-center">
              <div className="w-full max-w-[280px] bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-md aspect-[9/16] flex flex-col justify-between">
                
                {/* Mock Header */}
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-1.5">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-4 w-auto max-w-[60px] object-contain rounded" />
                  ) : (
                    <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] text-white" style={{ backgroundColor: primaryColor }}>
                      <Compass className="h-3 w-3" />
                    </div>
                  )}
                  <span className="text-[10px] font-black text-slate-800 truncate">{title || "Studio Name"}</span>
                </div>

                {/* Mock Hero */}
                <div 
                  className="py-6 px-4 space-y-2.5 text-white transition-all duration-300 relative overflow-hidden flex flex-col justify-center"
                  style={{
                    backgroundColor: heroBgType === "color" ? undefined : "#0F172A",
                    backgroundImage: heroBgType === "color" ? undefined : (heroBgType === "image" && heroBgImage ? `url(${heroBgImage})` : (heroBgType === "slider" && heroBgSlider.length > 0 ? `url(${heroBgSlider[0]})` : undefined)),
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    textAlign: heroTextAlignment === "center" ? "center" : "left",
                    minHeight: "100px",
                  }}
                >
                  {/* Overlay */}
                  {heroBgType !== "color" && (
                    <div 
                      className="absolute inset-0 bg-slate-950 transition-opacity duration-300" 
                      style={{ opacity: heroOverlayOpacity / 100 }} 
                    />
                  )}
                  
                  <div className="relative z-10 space-y-2">
                    {heroTextAlignment === "center" && logoUrl && (
                      <div className="relative w-8 h-8 mb-1 rounded bg-white shadow flex items-center justify-center p-0.5 overflow-hidden mx-auto">
                        <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <h3 className="text-[12px] font-black leading-tight tracking-tight break-words">{title || "Studio Name"}</h3>
                    <p className="text-[8px] text-slate-300 font-medium line-clamp-2 break-words">{tagline || "Apex Authorized Architect"}</p>
                    <div 
                      className="h-5 w-20 rounded flex items-center justify-center text-[7px] font-bold text-white shadow-sm transition-all" 
                      style={{ 
                        backgroundColor: primaryColor,
                        marginLeft: heroTextAlignment === "center" ? "auto" : "0",
                        marginRight: heroTextAlignment === "center" ? "auto" : "0",
                      }}
                    >
                      {ctaText}
                    </div>
                  </div>
                </div>

                {/* Mock Body */}
                <div className="p-4 flex-1 space-y-3 bg-slate-50">
                  <div className="h-1.5 w-12 bg-gray-200 rounded" />
                  <div className="space-y-1.5">
                    <div className="h-1 w-full bg-gray-200 rounded" />
                    <div className="h-1 w-5/6 bg-gray-200 rounded" />
                  </div>

                  <div className="border border-gray-200 rounded-lg p-2.5 bg-white space-y-1.5">
                    <div className="h-2 w-14 bg-gray-200 rounded" />
                    <div className="flex gap-1.5">
                      <div className="w-8 h-8 rounded bg-gray-200 shrink-0" />
                      <div className="space-y-1 w-full">
                        <div className="h-1.5 w-16 bg-gray-200 rounded" />
                        <div className="h-1 w-20 bg-gray-200 rounded" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mock Footer */}
                <div className="p-3 bg-slate-900 border-t border-slate-800 text-[8px] text-slate-500 text-center">
                  © {new Date().getFullYear()} {title || "Studio Name"}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="p-4 bg-slate-50 flex items-center justify-end">
              <button
                type="submit"
                disabled={loading || !!subdomainError}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-55 transition-all shadow-sm"
              >
                {loading ? "Publishing Settings..." : "Publish Brand Settings"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
