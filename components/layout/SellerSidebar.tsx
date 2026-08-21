"use client";

import { useState } from "react";
import { Menu, X, Home, Package2, Settings, Users, ShoppingCart, ChevronRight, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SellerSidebarProps {
  children: React.ReactNode;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, href: "/seller/dashboard" },
  { id: "profile", label: "Profile", icon: Users, href: "/seller/profile" },
  { id: "products", label: "Products", icon: Package2, href: "/seller/products" },
  { id: "orders", label: "Orders", icon: ShoppingCart, href: "/seller/orders" },
  { id: "settings", label: "Settings", icon: Settings, href: "/seller/settings" },
];

export default function SellerSidebar({ children }: SellerSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const activeSection = (() => {
    const segments = pathname.split("/");
    return segments[2] || "dashboard";
  })();

  return (
    <div className="h-screen flex bg-[#F5F4F7] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 bg-[#4B1D8F] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-white/10">
          <Link href="/seller/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "#D4AF37" }}>
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Seller Centre</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-purple-200 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive =
              activeSection === item.id ||
              (item.id === "dashboard" && (pathname === "/seller" || pathname === "/seller/dashboard"));
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "text-white shadow-md"
                    : "text-purple-200 hover:bg-white/10 hover:text-white"
                }`}
                style={isActive ? { backgroundColor: "#D4AF37", color: "#1a1a2e" } : {}}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-purple-300 hover:text-white transition-colors"
          >
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="fixed inset-0 bg-black/50" />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
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
          <div id="seller-topbar-actions" />
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
