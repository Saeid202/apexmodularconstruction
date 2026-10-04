"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Save, User, Building2, MapPin } from "lucide-react";
import type { Database } from "@/types/database";

type Profile = {
  full_name: string | null; phone: string | null; company_name: string | null; contact_email: string | null;
  company_intro: string | null; address_line1: string | null; address_line2: string | null;
  city: string | null; province: string | null; postal_code: string | null; country: string | null;
};

const empty: Profile = {
  full_name: null, phone: null, company_name: null, contact_email: null,
  company_intro: null, address_line1: null, address_line2: null,
  city: null, province: null, postal_code: null, country: "Canada",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setProfile(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      // @ts-ignore - TypeScript database typing issues, but runtime works correctly
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", data.session.user.id)
        .single();
      if (p) {
        setProfile({
          full_name: (p as any).full_name,
          phone: (p as any).phone,
          company_name: null,
          contact_email: null,
          company_intro: null,
          address_line1: null,
          address_line2: null,
          city: null,
          province: null,
          postal_code: null,
          country: "Canada"
        });
      }
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null); setSuccess(false);
    const supabase = createBrowserClient();
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) return;
    
    const { error } = await (supabase as any)
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        updated_at: new Date().toISOString()
      })
      .eq("id", s.session.user.id);
    
    if (error) setError(error.message); else setSuccess(true);
    setSaving(false);
  }

  if (loading) return <div className="text-gray-400 text-xs">Loading...</div>;

  const inp = `
    w-full px-4 py-2.5 rounded-lg text-sm font-medium
    bg-white border-2 border-gray-200
    text-gray-900 placeholder:text-gray-400
    focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100
    transition-all duration-200 shadow-sm
  `;

  const textarea = `
    w-full px-4 py-2.5 rounded-lg text-sm font-medium resize-none
    bg-white border-2 border-gray-200
    text-gray-900 placeholder:text-gray-400
    focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100
    transition-all duration-200 shadow-sm
  `;

  return (
    <div className="max-w-2xl">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your personal and company information</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">

        {/* Personal */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-gray-800 to-blue-500">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-wide">Personal Information</span>
          </div>
          <div className="p-5 bg-white grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Full Name</label>
              <input type="text" value={profile.full_name || ""} onChange={set("full_name")} placeholder="John Doe" className={inp} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</label>
              <input type="tel" value={profile.phone || ""} onChange={set("phone")} placeholder="+1 (555) 000-0000" className={inp} />
            </div>
          </div>
        </div>

        {/* Company */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-amber-500 to-orange-400">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-wide">Company Information</span>
          </div>
          <div className="p-5 bg-white space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Company Name</label>
                <input type="text" value={profile.company_name || ""} onChange={set("company_name")} placeholder="Acme Corp" className={inp} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Email</label>
                <input type="email" value={profile.contact_email || ""} onChange={set("contact_email")} placeholder="contact@company.com" className={inp} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">About Your Company</label>
              <textarea value={profile.company_intro || ""} onChange={set("company_intro")} rows={3}
                placeholder="Tell us about your company, what you do, and what you're looking for..."
                className={textarea} />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-wide">Address</span>
          </div>
          <div className="p-5 bg-white space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Street Address</label>
              <input type="text" value={profile.address_line1 || ""} onChange={set("address_line1")} placeholder="123 Main Street" className={inp} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Suite / Unit <span className="normal-case font-normal text-gray-400">(optional)</span></label>
              <input type="text" value={profile.address_line2 || ""} onChange={set("address_line2")} placeholder="Suite 100" className={inp} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">City</label>
                <input type="text" value={profile.city || ""} onChange={set("city")} placeholder="Toronto" className={inp} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Province</label>
                <input type="text" value={profile.province || ""} onChange={set("province")} placeholder="ON" className={inp} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Postal</label>
                <input type="text" value={profile.postal_code || ""} onChange={set("postal_code")} placeholder="M5V 3A8" className={inp} />
              </div>
            </div>
            <div className="w-1/2 space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Country</label>
              <input type="text" value={profile.country || ""} onChange={set("country")} className={inp} />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-between pt-1">
          <div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-emerald-600 font-medium">✓ Profile saved successfully.</p>}
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-200 disabled:opacity-60 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #6366f1, #F59E0B)" }}>
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

      </form>
    </div>
  );
}
