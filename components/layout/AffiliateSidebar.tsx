"use client";

import { useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Link2,
  Tag,
  Coins,
  FolderOpen,
  CreditCard,
  Settings,
  ChevronRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface AffiliateSidebarProps {
  children: React.ReactNode;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/affiliate/dashboard?tab=dashboard" },
  { id: "links", label: "Referral Links", icon: Link2, href: "/affiliate/dashboard?tab=links" },
  { id: "coupons", label: "Coupons", icon: Tag, href: "/affiliate/dashboard?tab=coupons" },
  { id: "commissions", label: "Commissions", icon: Coins, href: "/affiliate/dashboard?tab=commissions" },
  { id: "marketing", label: "Marketing Assets", icon: FolderOpen, href: "/affiliate/dashboard?tab=marketing" },
  { id: "payouts", label: "Payouts", icon: CreditCard, href: "/affiliate/dashboard?tab=payouts" },
  { id: "settings", label: "Settings", icon: Settings, href: "/affiliate/dashboard?tab=settings" },
];

export default function AffiliateSidebar({ children }: AffiliateSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  return (
    <div className="h-screen flex bg-[#F4F6FA] overflow-hidden">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 bg-[#0F172A] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-white/10">
          <Link href="/affiliate/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "#4B1D8F" }}>
              <Sparkles className="h-4 w-4 text-[#D4AF37]" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              APEX<span style={{ color: "#D4AF37" }}>.</span> PARTNERS
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "text-white shadow-md shadow-purple-950/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
                style={isActive ? { backgroundColor: "#4B1D8F" } : {}}
              >
                <item.icon className="h-5 w-5 shrink-0" style={isActive ? { color: "#D4AF37" } : {}} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 text-[#D4AF37]" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Store
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="fixed inset-0 bg-black/50" />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold text-gray-800 lg:text-lg capitalize">
            {menuItems.find((i) => i.id === activeTab)?.label ?? "Dashboard"}
          </h1>
          <div id="affiliate-topbar-actions" />
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
