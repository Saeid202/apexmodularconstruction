"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { LayoutDashboard, User, Briefcase, Settings, LogOut, Zap, ChevronRight } from "lucide-react";

const navItems = [
  { href: "/contractor/dashboard",     label: "Dashboard",         icon: LayoutDashboard, color: "from-blue-400 to-indigo-500" },
  { href: "/contractor/profile",       label: "Profile",           icon: User,            color: "from-violet-400 to-purple-500" },
  { href: "/contractor/business-scope", label: "Business Scope",   icon: Briefcase,       color: "from-emerald-400 to-teal-500" },
  { href: "/contractor/settings",      label: "Settings",          icon: Settings,        color: "from-orange-400 to-rose-500" },
];

interface ContractorSidebarProps {
  children: React.ReactNode;
}

export default function ContractorSidebar({ children }: ContractorSidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) window.location.href = "/";
      else {
        setUser(data.session.user);
      }
    });
  }, []);

  async function handleLogout() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const email = user?.email || "";
  const initials = name.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="shrink-0 flex flex-col border-r border-purple-900/40" style={{ width: 280, minWidth: 280, background: "linear-gradient(180deg, #2d0f6b 0%, #1e0a4a 60%, #150736 100%)" }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-purple-800/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 shadow-md">
            <Zap className="h-4 w-4 text-yellow-300" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">Apex Modular Construction</p>
            <p className="text-[10px] text-purple-300 font-semibold uppercase tracking-widest">Contractor Portal</p>
          </div>
        </div>

        {/* User card */}
        <div className="mx-3 mt-4 mb-2 p-3 rounded-2xl bg-white/8 border border-purple-700/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-base shrink-0 shadow-md" style={{ background: "linear-gradient(135deg, #D4AF37, #b8960f)" }}>
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{name}</p>
              <p className="text-[11px] text-slate-400 truncate">{email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon, color }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-white/15 text-white border border-white/15 shadow-sm"
                    : "text-purple-200 hover:text-white hover:bg-white/8"
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${color} shadow-sm shrink-0 ${active ? "" : "opacity-70 group-hover:opacity-100"}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 text-white/50" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 border-t border-purple-800/50 pt-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-purple-300 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center px-10 bg-white border-b border-gray-100 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {navItems.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"))?.label ?? "Dashboard"}
            </h1>
            <p className="text-xs text-gray-400">Contractor Portal</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: "#D4AF37" }} />
            <span className="text-xs text-gray-400 font-medium">Online</span>
          </div>
        </header>
        <main className="flex-1 p-10 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
