"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { LayoutDashboard, Users, Package, MessageSquare, ShoppingBag, LogOut, ChevronRight, Store, Briefcase, Image, Menu, FileText, Truck, Settings } from "lucide-react";

const navItems = [
  { href: "/admin/dashboard",        label: "Dashboard",        icon: LayoutDashboard },
  { href: "/admin/partners",         label: "Partners",         icon: Users },
  { href: "/admin/agents",           label: "Agents",           icon: Briefcase },
  { href: "/admin/shipping-agents",  label: "Shipping Agents",  icon: Truck },
  { href: "/admin/engineering",      label: "Engineering",      icon: Package },
  { href: "/admin/sellers",          label: "Sellers",          icon: Store },
  { href: "/admin/orders",           label: "Orders",           icon: ShoppingBag },
  { href: "/admin/inquiries",        label: "Inquiries",        icon: MessageSquare },
];

const contentNavItems = [
  { href: "/admin/cms/sliders",    label: "Sliders",    icon: Image },
  { href: "/admin/cms/navigation", label: "Navigation", icon: Menu },
  { href: "/admin/cms/pages",      label: "Pages",      icon: FileText },
  { href: "/admin/cms/settings",   label: "Branding Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? "");
    });
  }, []);

  async function handleLogout() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 shrink-0 bg-gray-900 flex flex-col">
        <div className="p-5 border-b border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Admin Panel</p>
          <p className="text-sm font-semibold text-white truncate">{email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Operations</p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {active && <ChevronRight className="h-3 w-3 ml-auto" />}
              </Link>
            );
          })}

          <div className="my-2 border-t border-gray-700" />
          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Content</p>
          {contentNavItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {active && <ChevronRight className="h-3 w-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-gray-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}