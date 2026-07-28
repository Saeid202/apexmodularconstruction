"use client";

import { useState, useEffect } from "react";
import { updateArchitectProfile } from "@/app/actions/architect";
import { Globe, Palette, Link as LinkIcon, Compass, CheckCircle2, AlertCircle, Eye, ShieldAlert } from "lucide-react";

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

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);

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

  // Build live URLs
  const host = typeof window !== "undefined" ? window.location.host : "apex.com";
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

          {/* Section 3: Social Connections */}
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
                <div className="bg-slate-900 py-6 px-4 text-center space-y-2.5 text-white">
                  <h3 className="text-[14px] font-black leading-tight tracking-tight">{title || "Studio Name"}</h3>
                  <p className="text-[9px] text-slate-400 font-medium truncate">{tagline || "Apex Authorized Architect"}</p>
                  <div className="h-6 w-20 mx-auto rounded-md flex items-center justify-center text-[8px] font-bold text-white shadow-sm" style={{ backgroundColor: primaryColor }}>
                    Browse Catalog
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
