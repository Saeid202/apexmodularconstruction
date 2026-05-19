"use client";

import { useEffect, useState } from "react";
import { getSiteSettings, updateSiteSettings, type SiteSettings } from "@/app/actions/cms-settings";
import { Loader2, Save, Sparkles, Image, Menu, Type } from "lucide-react";

export default function BrandingSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSiteSettings().then((data) => {
      setSettings(data);
    });
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setSuccess(false);
    setError(null);
    const res = await updateSiteSettings(settings);
    setSaving(false);
    if (!res.success) {
      setError(res.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  if (!settings) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
          Branding & Logo Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Customize the header logo and general branding configurations of your platform.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300">
          🎉 Branding settings updated and live successfully!
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
          ❌ Failed to update settings: {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Style Selection */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-md font-semibold text-gray-900">Header Logo Layout</h3>
          <p className="text-xs text-gray-500">Choose how the brand logo displays in your public header.</p>
          
          <div className="space-y-3">
            {/* Complete Banner Option */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              settings.logo_style === "complete-banner" 
                ? "border-purple-600 bg-purple-50/30" 
                : "border-gray-200 hover:bg-gray-50"
            }`}>
              <input
                type="radio"
                name="logo_style"
                value="complete-banner"
                checked={settings.logo_style === "complete-banner"}
                onChange={() => setSettings({ ...settings, logo_style: "complete-banner" })}
                className="mt-1 text-purple-600 focus:ring-purple-500"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <Image className="h-4 w-4 text-purple-600" />
                  Option A: Complete Shiny Logo Banner
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Uses the complete transparent-background PNG banner logo with both graphic and text included. Recommended for modern screens!
                </p>
              </div>
            </label>

            {/* Icon and Text Option */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              settings.logo_style === "icon-and-text" 
                ? "border-purple-600 bg-purple-50/30" 
                : "border-gray-200 hover:bg-gray-50"
            }`}>
              <input
                type="radio"
                name="logo_style"
                value="icon-and-text"
                checked={settings.logo_style === "icon-and-text"}
                onChange={() => setSettings({ ...settings, logo_style: "icon-and-text" })}
                className="mt-1 text-purple-600 focus:ring-purple-500"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <Menu className="h-4 w-4 text-purple-600" />
                  Option B: Graphic Icon + Gold Text
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Displays the standalone graphical modular-house logo icon inside a rounded white container alongside separate gold brand text.
                </p>
              </div>
            </label>

            {/* Text Only Option */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              settings.logo_style === "text-only" 
                ? "border-purple-600 bg-purple-50/30" 
                : "border-gray-200 hover:bg-gray-50"
            }`}>
              <input
                type="radio"
                name="logo_style"
                value="text-only"
                checked={settings.logo_style === "text-only"}
                onChange={() => setSettings({ ...settings, logo_style: "text-only" })}
                className="mt-1 text-purple-600 focus:ring-purple-500"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <Type className="h-4 w-4 text-purple-600" />
                  Option C: Gold Brand Text Only
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Reverts the header to display the classic gold-gradient "Apex Modular Construction" SVG text logo by itself.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Height & Size Options */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-900">Logo Height & Size</h3>
            <p className="text-xs text-gray-500">Adjust the vertical scale of the header logo to fit perfectly.</p>
            
            <div className="grid grid-cols-3 gap-3">
              {(["h-12", "h-16", "h-20"] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setSettings({ ...settings, logo_height: h })}
                  className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    settings.logo_height === h
                      ? "border-purple-600 bg-purple-50/50 text-purple-700 shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {h === "h-12" ? "Small (48px)" : h === "h-16" ? "Medium (64px)" : "Large (80px)"}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Preview */}
          <div className="rounded-xl bg-gray-950 p-6 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Real-time Header Preview</p>
            <div className="w-full bg-[#4B1D8F] h-24 rounded-lg flex items-center px-6 border border-purple-800/40 relative overflow-hidden">
              {settings.logo_style === "complete-banner" && (
                <div className={`flex items-center bg-white px-4 py-1.5 rounded-xl shadow-md border border-purple-900/30 transition-all ${
                  settings.logo_height === "h-12" ? "h-12" : settings.logo_height === "h-16" ? "h-16" : "h-20"
                }`}>
                  <img src="/logo.png" alt="Apex Logo Complete" className="h-full w-auto object-contain" />
                </div>
              )}

              {settings.logo_style === "icon-and-text" && (
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center rounded-xl bg-white p-0.5 shadow-md border border-purple-900/30 overflow-hidden transition-all ${
                    settings.logo_height === "h-12" ? "h-12 w-12" : settings.logo_height === "h-16" ? "h-16 w-16" : "h-20 w-20"
                  }`}>
                    <img src="/logo.jpg" alt="Apex Icon" className="h-full w-full object-contain" />
                  </div>
                  <img src="/logo.svg" alt="Apex Text" className="h-10 w-auto" />
                </div>
              )}

              {settings.logo_style === "text-only" && (
                <img src="/logo.svg" alt="Apex Text Only" className="h-12 w-auto" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold px-6 py-3 shadow-md transition-all shrink-0 cursor-pointer"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {saving ? "Saving Changes…" : "Save Configurations"}
        </button>
      </div>
    </div>
  );
}
