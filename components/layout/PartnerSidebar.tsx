"use client";

import { useState } from "react";
import { Menu, X, LayoutDashboard, FolderOpen, User, ChevronRight, LogOut, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { FloatingMessenger } from "@/components/messenger/FloatingMessenger";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/partner/dashboard" },
  { id: "projects", label: "Projects", icon: FolderOpen, href: "/partner/projects" },
  { id: "profile", label: "Profile", icon: User, href: "/partner/profile" },
];

export default function PartnerSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const activeId = menuItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  )?.id ?? "dashboard";

  const activeLabel = menuItems.find((item) => item.id === activeId)?.label ?? "";

  async function handleLogout() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="h-screen flex bg-gray-950 overflow-hidden">

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col
        bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950
        border-r border-white/5
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">Apex Modular Construction</p>
            <p className="text-[10px] text-blue-400 font-medium uppercase tracking-widest">Partner Portal</p>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden text-gray-500 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {menuItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-gray-500 group-hover:text-white"}`} />
                {item.label}
                {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto text-white/70" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5 border-t border-white/5 pt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">

        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">{activeLabel}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Partner Portal</p>
            </div>
          </div>
          {/* Accent bar */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-500 font-medium">Online</span>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      <FloatingMessenger />
    </div>
  );
}
