"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { User, Mail } from "lucide-react";

export default function ShippingAgentProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user);
    });
  }, []);

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "—";
  const email = user?.email || "—";

  return (
    <div className="space-y-6 max-w-lg">
      <div
        className="relative overflow-hidden rounded-2xl p-8 text-white"
        style={{ background: "linear-gradient(135deg, #4B1D8F 0%, #3a1570 100%)", boxShadow: "0 0 0 1px #4B1D8F, 0 0 0 4px #D4AF37, 0 0 0 5px #4B1D8F" }}
      >
        <span className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-yellow-400 rounded-tl-md" />
        <span className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-yellow-400 rounded-tr-md" />
        <span className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-yellow-400 rounded-bl-md" />
        <span className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-yellow-400 rounded-br-md" />
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0"
            style={{ backgroundColor: "rgba(212,175,55,0.25)", border: "1px solid rgba(212,175,55,0.5)" }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="inline-block mb-1 rounded-full border border-yellow-400/50 bg-yellow-400/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-widest text-yellow-300">
              Shipping Agent
            </span>
            <h1 className="text-2xl font-extrabold text-white">{name}</h1>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-[#4B1D8F]/5 border-b-2 border-[#4B1D8F]/10 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#4B1D8F] flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-base font-bold text-[#4B1D8F] uppercase tracking-wide">Account Info</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <User className="h-5 w-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Full Name</p>
              <p className="text-base font-semibold text-gray-900">{name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <Mail className="h-5 w-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Email</p>
              <p className="text-base font-semibold text-gray-900">{email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
