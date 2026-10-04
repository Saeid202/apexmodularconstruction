"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Loader2, User, Lock } from "lucide-react";

const inp = "w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-white transition-colors";

export default function AgentProfilePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        setEmail(user.email ?? "");
        setFullName(user.user_metadata?.full_name ?? "");
      }
    });
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false);
    const supabase = createBrowserClient();
    await supabase.auth.updateUser({ data: { full_name: fullName } });
    setSaving(false); setSaved(true);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPw(true); setPwMsg(null);
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPw(false);
    if (error) { setPwMsg({ type: "error", text: error.message }); return; }
    setPwMsg({ type: "success", text: "Password updated successfully." });
    setNewPassword("");
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-gradient-to-r from-orange-50 to-rose-50 border-b border-orange-100 flex items-center gap-2">
          <User className="h-4 w-4 text-orange-600" />
          <h2 className="text-xs font-bold text-orange-900 uppercase tracking-wide">Agent Profile</h2>
        </div>
        <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
          {saved && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">Profile saved.</div>}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inp} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</label>
            <input type="email" value={email} disabled className={inp + " opacity-50 cursor-not-allowed"} />
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-bold rounded-xl hover:from-orange-600 hover:to-rose-600 disabled:opacity-50 shadow-md shadow-orange-500/20 transition-all">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Profile
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-gradient-to-r from-amber-50 to-amber-50 border-b border-amber-100 flex items-center gap-2">
          <Lock className="h-4 w-4 text-gray-800" />
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Change Password</h2>
        </div>
        <form onSubmit={handleChangePassword} className="p-5 space-y-4">
          {pwMsg && <div className={`p-3 rounded-xl text-sm border ${pwMsg.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>{pwMsg.text}</div>}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Password</label>
            <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inp} />
          </div>
          <button type="submit" disabled={savingPw}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-800 text-white text-sm font-bold rounded-xl hover:from-gray-800 hover:to-gray-800 disabled:opacity-50 shadow-md shadow-amber-500/20 transition-all">
            {savingPw && <Loader2 className="h-4 w-4 animate-spin" />} Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
