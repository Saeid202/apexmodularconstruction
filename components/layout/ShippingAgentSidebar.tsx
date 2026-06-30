"use client";

import { useState } from "react";
import { Menu, X, LayoutDashboard, Truck, User, ChevronRight, LogOut, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { FloatingMessenger } from "@/components/messenger/FloatingMessenger";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/shipping-agent/dashboard", color: "from-blue-400 to-indigo-500" },
  { id: "requests",  label: "Requests",  icon: Truck,           href: "/shipping-agent/requests",  color: "from-amber-400 to-orange-500" },
  { id: "profile",   label: "Profile",   icon: User,            href: "/shipping-agent/profile",   color: "from-violet-400 to-purple-500" },
];

export default function ShippingAgentSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const activeItem = menuItems.find((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  async function handleLogout() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-purple-900/40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "linear-gradient(180deg, #2d0f6b 0%, #1e0a4a 60%, #150736 100%)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-purple-800/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 shadow-md">
            <Zap className="h-4 w-4 text-yellow-300" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">Apex Modular Construction</p>
            <p className="text-[10px] text-purple-300 font-semibold uppercase tracking-widest">Shipping Portal</p>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {menuItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.id} href={item.href} onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-white/15 text-white border border-white/15 shadow-sm"
                    : "text-purple-200 hover:text-white hover:bg-white/8"
                }`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${item.color} shadow-sm shrink-0 ${active ? "" : "opacity-70 group-hover:opacity-100"}`}>
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 text-white/50" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 border-t border-purple-800/50 pt-3">
          <button onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-purple-300 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">{activeItem?.label ?? "Dashboard"}</h1>
              <p className="text-xs text-gray-400">Shipping Agent Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: "#D4AF37" }} />
            <span className="text-xs text-gray-400 font-medium">Online</span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
      <FloatingMessenger />
    </div>
  );
}
