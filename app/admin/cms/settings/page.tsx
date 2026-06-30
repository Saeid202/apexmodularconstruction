"use client";

import { useEffect, useState, useRef } from "react";
import type { ComponentType } from "react";
import { getSiteSettings, updateSiteSettings, uploadLogo, type SiteSettings, type SocialLink } from "@/app/actions/cms-settings";
import { Loader2, Save, Sparkles, Image, Menu, Type, Upload, X, Plus, Share2 } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 1 1 0-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0 0 12.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
    </svg>
  );
}

const PLATFORM_OPTIONS: { value: string; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { value: "facebook",  label: "Facebook",    Icon: FacebookIcon },
  { value: "instagram", label: "Instagram",   Icon: InstagramIcon },
  { value: "linkedin",  label: "LinkedIn",    Icon: LinkedinIcon },
  { value: "twitter",   label: "Twitter / X", Icon: X },
  { value: "youtube",   label: "YouTube",     Icon: YoutubeIcon },
  { value: "github",    label: "GitHub",      Icon: GithubIcon },
  { value: "reddit",    label: "Reddit",      Icon: RedditIcon },
  { value: "google",    label: "Google",      Icon: GoogleIcon },
  { value: "tiktok",    label: "TikTok",      Icon: GlobeIcon },
  { value: "whatsapp",  label: "WhatsApp",    Icon: GlobeIcon },
  { value: "telegram",  label: "Telegram",    Icon: GlobeIcon },
  { value: "pinterest", label: "Pinterest",   Icon: GlobeIcon },
];

function getPlatformLabel(platform: string) {
  return PLATFORM_OPTIONS.find((p) => p.value === platform)?.label ?? platform;
}

function PlatformIcon({ platform }: { platform: string }) {
  const Icon = PLATFORM_OPTIONS.find((p) => p.value === platform)?.Icon ?? GlobeIcon;
  return <Icon className="h-4 w-4" />;
}

export default function BrandingSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [newPlatform, setNewPlatform] = useState("facebook");
  const [newUrl, setNewUrl] = useState("");

  const completeBannerInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  function addSocialLink() {
    if (!settings || !newUrl.trim()) return;
    const existing = settings.social_links ?? [];
    if (existing.some((l) => l.platform === newPlatform)) return;
    setSettings({
      ...settings,
      social_links: [...existing, { platform: newPlatform, url: newUrl.trim(), enabled: true }],
    });
    setNewUrl("");
    const nextPlatform = PLATFORM_OPTIONS.find(
      (p) => p.value !== newPlatform && !existing.some((l) => l.platform === p.value)
    );
    setNewPlatform(nextPlatform?.value ?? "");
  }

  function removeSocialLink(platform: string) {
    if (!settings) return;
    setSettings({
      ...settings,
      social_links: (settings.social_links ?? []).filter((l) => l.platform !== platform),
    });
  }

  function updateSocialLink(platform: string, patch: Partial<SocialLink>) {
    if (!settings) return;
    setSettings({
      ...settings,
      social_links: (settings.social_links ?? []).map((l) =>
        l.platform === platform ? { ...l, ...patch } : l
      ),
    });
  }

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

  async function handleLogoUpload(type: 'complete-banner' | 'icon' | 'text', file: File) {
    setUploading(type);
    setError(null);
    const res = await uploadLogo(file);
    setUploading(null);
    
    if (!res.success) {
      setError(res.error || 'Failed to upload logo');
      return;
    }
    
    if (!settings) return;
    
    if (type === 'complete-banner') {
      setSettings({ ...settings, logo_complete_banner_url: res.url });
    } else if (type === 'icon') {
      setSettings({ ...settings, logo_icon_url: res.url });
    } else if (type === 'text') {
      setSettings({ ...settings, logo_text_url: res.url });
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
        {/* Logo Upload Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-md font-semibold text-gray-900">Logo Upload</h3>
          <p className="text-xs text-gray-500">Upload custom logos for each display style. If not uploaded, default logos will be used.</p>
          
          <div className="space-y-4">
            {/* Complete Banner Logo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Complete Banner Logo</label>
              <div className="flex items-center gap-3">
                <input
                  ref={completeBannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload('complete-banner', file);
                  }}
                />
                <button
                  onClick={() => completeBannerInputRef.current?.click()}
                  disabled={uploading === 'complete-banner'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
                >
                  {uploading === 'complete-banner' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading === 'complete-banner' ? 'Uploading...' : 'Upload'}
                </button>
                {settings.logo_complete_banner_url && (
                  <button
                    onClick={() => setSettings({ ...settings, logo_complete_banner_url: undefined })}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                    title="Remove custom logo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {settings.logo_complete_banner_url && (
                <div className="mt-2">
                  <img src={settings.logo_complete_banner_url} alt="Complete Banner Logo" className="h-12 w-auto object-contain border rounded" />
                </div>
              )}
            </div>

            {/* Icon Logo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Icon Logo</label>
              <div className="flex items-center gap-3">
                <input
                  ref={iconInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload('icon', file);
                  }}
                />
                <button
                  onClick={() => iconInputRef.current?.click()}
                  disabled={uploading === 'icon'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
                >
                  {uploading === 'icon' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading === 'icon' ? 'Uploading...' : 'Upload'}
                </button>
                {settings.logo_icon_url && (
                  <button
                    onClick={() => setSettings({ ...settings, logo_icon_url: undefined })}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                    title="Remove custom logo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {settings.logo_icon_url && (
                <div className="mt-2">
                  <img src={settings.logo_icon_url} alt="Icon Logo" className="h-12 w-12 object-contain border rounded" />
                </div>
              )}
            </div>

            {/* Text Logo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Text Logo</label>
              <div className="flex items-center gap-3">
                <input
                  ref={textInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload('text', file);
                  }}
                />
                <button
                  onClick={() => textInputRef.current?.click()}
                  disabled={uploading === 'text'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
                >
                  {uploading === 'text' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading === 'text' ? 'Uploading...' : 'Upload'}
                </button>
                {settings.logo_text_url && (
                  <button
                    onClick={() => setSettings({ ...settings, logo_text_url: undefined })}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                    title="Remove custom logo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {settings.logo_text_url && (
                <div className="mt-2">
                  <img src={settings.logo_text_url} alt="Text Logo" className="h-12 w-auto object-contain border rounded" />
                </div>
              )}
            </div>
          </div>
        </div>

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
                <div className={`flex items-center bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-xl shadow-lg border border-white/20 overflow-hidden transition-all ${
                  settings.logo_height === "h-12" ? "h-12" : settings.logo_height === "h-16" ? "h-16" : "h-20"
                }`}>
                  <img 
                    src={settings.logo_complete_banner_url || "/logo.png"} 
                    alt="Apex Logo Complete" 
                    className="h-full w-auto object-contain" 
                  />
                </div>
              )}

              {settings.logo_style === "icon-and-text" && (
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center rounded-xl bg-white/95 backdrop-blur-sm p-0.5 shadow-lg border border-white/20 overflow-hidden transition-all ${
                    settings.logo_height === "h-12" ? "h-12 w-12" : settings.logo_height === "h-16" ? "h-16 w-16" : "h-20 w-20"
                  }`}>
                    <img 
                      src={settings.logo_icon_url || "/logo.jpg"} 
                      alt="Apex Icon" 
                      className="h-full w-full object-contain" 
                    />
                  </div>
                  <img 
                    src={settings.logo_text_url || "/logo.svg"} 
                    alt="Apex Text" 
                    className="h-10 w-auto" 
                  />
                </div>
              )}

              {settings.logo_style === "text-only" && (
                <div className="bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-xl shadow-lg border border-white/20">
                  <img 
                    src={settings.logo_text_url || "/logo.svg"} 
                    alt="Apex Text Only" 
                    className="h-12 w-auto" 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-purple-600" />
            Social Media Links
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Add your social media profiles. Enabled links will appear as icons in the footer.
          </p>
        </div>

        {/* Existing links */}
        <div className="space-y-3">
          {(settings.social_links ?? []).length === 0 && (
            <p className="text-sm text-gray-400 italic">No social links added yet.</p>
          )}
          {(settings.social_links ?? []).map((link) => (
            <div key={link.platform} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700 shrink-0">
                <PlatformIcon platform={link.platform} />
              </div>
              <span className="text-sm font-medium text-gray-700 w-24 shrink-0">
                {getPlatformLabel(link.platform)}
              </span>
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateSocialLink(link.platform, { url: e.target.value })}
                placeholder="https://..."
                className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={link.enabled}
                  onChange={(e) => updateSocialLink(link.platform, { enabled: e.target.checked })}
                  className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs text-gray-600">Visible</span>
              </label>
              <button
                onClick={() => removeSocialLink(link.platform)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                title="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add new link */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <select
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
          >
            {PLATFORM_OPTIONS.filter(
              (p) => !(settings.social_links ?? []).some((l) => l.platform === p.value)
            ).map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSocialLink()}
            placeholder="https://..."
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={addSocialLink}
            disabled={!newUrl.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {/* Homepage Projects Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-md font-semibold text-gray-900">Homepage Projects Section</h3>
          <p className="text-xs text-gray-500 mt-1">
            Control how many products appear in the "Our Projects" section on the homepage. Leave blank to show all products.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Max products to display</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={100}
                placeholder="All"
                value={settings.homepage_products_limit ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSettings({
                    ...settings,
                    homepage_products_limit: val === "" ? null : Math.max(1, parseInt(val) || 1),
                  });
                }}
                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              {settings.homepage_products_limit && (
                <button
                  onClick={() => setSettings({ ...settings, homepage_products_limit: null })}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Clear (show all)
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {settings.homepage_products_limit
                ? `Showing up to ${settings.homepage_products_limit} product${settings.homepage_products_limit === 1 ? "" : "s"} per tab`
                : "Showing all products"}
            </p>
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
