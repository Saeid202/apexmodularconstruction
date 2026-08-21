"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ShoppingBag, User, Package, Wrench, ArrowRight, Zap, TrendingUp, Clock, Truck } from "lucide-react";

export default function BuyerDashboard() {
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const supabase = createBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      if (data.session) setUser(data.session.user);
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  const initials = name.charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Hero welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 text-white shadow-2xl shadow-blue-500/20">
        <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute right-20 -bottom-10 h-36 w-36 rounded-full bg-white/5" />
        <div className="absolute -left-4 bottom-0 h-24 w-24 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white font-black text-xl shadow-lg">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-300" />
                <span className="text-blue-100 text-sm font-medium">Buyer Portal</span>
              </div>
              <h1 className="text-2xl font-black mt-0.5">Welcome back, {name}! 👋</h1>
            </div>
          </div>
          <p className="text-blue-100 text-sm max-w-md">
            Manage your orders, submit RFQs, and track your engineering projects — all in one place.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Orders",    value: "0", icon: ShoppingBag, gradient: "from-blue-500 to-indigo-600",   shadow: "shadow-blue-500/20" },
          { label: "RFQ Submitted",   value: "0", icon: Package,     gradient: "from-orange-500 to-rose-500",   shadow: "shadow-orange-500/20" },
          { label: "Engineering",     value: "0", icon: Wrench,      gradient: "from-cyan-500 to-blue-500",     shadow: "shadow-cyan-500/20" },
          { label: "In Progress",     value: "0", icon: TrendingUp,  gradient: "from-emerald-500 to-teal-600",  shadow: "shadow-emerald-500/20" },
        ].map(({ label, value, icon: Icon, gradient, shadow }) => (          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${shadow} mb-3`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-3xl font-black text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              href: "/account/orders",
              label: "My Orders",
              desc: "Track and manage your purchases",
              icon: ShoppingBag,
              gradient: "from-blue-500 to-indigo-600",
              bg: "bg-blue-50",
              border: "border-blue-100 hover:border-blue-300",
            },
            {
              href: "/account/consolidation",
              label: "Consolidation / RFQ",
              desc: "Submit sourcing requests to our agents",
              icon: Package,
              gradient: "from-orange-500 to-rose-500",
              bg: "bg-orange-50",
              border: "border-orange-100 hover:border-orange-300",
            },
            {
              href: "/account/engineering",
              label: "Engineering Projects",
              desc: "Submit and track building projects",
              icon: Wrench,
              gradient: "from-cyan-500 to-blue-500",
              bg: "bg-cyan-50",
              border: "border-cyan-100 hover:border-cyan-300",
            },
            {
              href: "/account/shipping",
              label: "Shipping",
              desc: "Submit and track freight shipments",
              icon: Truck,
              gradient: "from-amber-500 to-orange-500",
              bg: "bg-amber-50",
              border: "border-amber-100 hover:border-amber-300",
            },
            {
              href: "/account/profile",
              label: "My Profile",
              desc: "Update your account details",
              icon: User,
              gradient: "from-violet-500 to-purple-600",
              bg: "bg-violet-50",
              border: "border-violet-100 hover:border-violet-300",
            },
          ].map(({ href, label, desc, icon: Icon, gradient, bg, border }) => (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-4 p-5 rounded-2xl bg-white border ${border} shadow-sm hover:shadow-md transition-all`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg shrink-0`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-bold text-gray-700">Recent Activity</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
            <TrendingUp className="h-6 w-6 text-gray-300" />
          </div>
          <p className="text-sm text-gray-400">No recent activity yet.</p>
          <p className="text-xs text-gray-300 mt-1">Your orders and submissions will appear here.</p>
        </div>
      </div>
    </div>
  );
}
