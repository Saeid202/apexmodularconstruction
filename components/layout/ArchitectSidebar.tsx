"use client";

import { useState } from "react";
import { Menu, X, User, FolderKanban, LayoutTemplate, Settings, ChevronRight, Compass, Wand2, Globe } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ArchitectSidebarProps {
  children: React.ReactNode;
}

const menuItems = [
  { id: "profile", label: "Profile", icon: User, href: "/architect/profile" },
  { id: "projects", label: "Projects", icon: FolderKanban, href: "/architect/projects" },
  { id: "page-builder", label: "Page Builder", icon: Wand2, href: "/architect/page-builder" },
  { id: "domains", label: "Domains", icon: Globe, href: "/architect/domains" },
];

export default function ArchitectSidebar({ children }: ArchitectSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const activeSection = (() => {
    const segments = pathname.split("/");
    return segments[2] || "dashboard";
  })();

  return (
    <div className="h-screen flex bg-[#F4F6FA] overflow-hidden">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 bg-[#0F172A] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-white/10">
          <Link href="/architect/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "#10B981" }}>
              <Compass className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Architect Studio</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "text-slate-900 shadow-md"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
                style={isActive ? { backgroundColor: "#10B981" } : {}}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4" />}
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
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold text-gray-800 lg:text-lg">
            {menuItems.find((i) => i.id === activeSection)?.label ?? "Dashboard"}
          </h1>
          <div id="architect-topbar-actions" />
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
