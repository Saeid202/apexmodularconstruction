"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { User, ChevronDown, LogOut, LayoutDashboard, Store } from "lucide-react";

export function HeaderAuth({ scrolled = true }: { scrolled?: boolean }) {
  const supabase = createBrowserClient();
  const [user, setUser] = useState<{ id?: string; email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch session - role is stored in auth metadata (no DB query needed)
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      setUserRole(sessionUser?.user_metadata?.role ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      
      // Try to get role from auth metadata first
      let role = sessionUser?.user_metadata?.role;
      
      // If no role in metadata, try to get from database
      if (!role && sessionUser?.id) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', sessionUser.id)
            .single();
          
          if (profileData?.role) {
            role = profileData.role;
            // Update auth metadata with role from database
            await supabase.auth.updateUser({
              data: { role: profileData.role }
            });
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      }
      
      setUserRole(role);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <div className="w-24 h-9" />;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: "login" }))}
          className="inline-flex h-9 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-4 text-sm font-semibold text-white transition-all hover:bg-white/20 cursor-pointer"
        >
          Login
        </button>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: "register" }))}
          className="inline-flex h-9 items-center justify-center rounded-full px-5 text-sm font-bold transition-all cursor-pointer bg-[#D4AF37] text-[#3b0764] font-black hover:brightness-110 hover:scale-105"
        >
          Get Quote
        </button>
      </div>
    );
  }

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Account";

  console.log('HeaderAuth - userRole:', userRole);
  console.log('HeaderAuth - user email:', user.email);

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-3 h-9 text-sm font-semibold text-white hover:bg-white/20 hover:border-[#D4AF37] transition-all cursor-pointer"
      >
        <User className="h-4 w-4 text-[#D4AF37]" />
        <span className="max-w-[120px] truncate">{name}</span>
        <ChevronDown className="h-3 w-3 text-white/50" />
      </button>

      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-gray-200 bg-white shadow-lg py-1">
            {/* Role-based dashboard link */}
            {userRole === "seller" ? (
              <Link
                href="/seller/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Store className="h-4 w-4" />
                Seller Dashboard
              </Link>
            ) : userRole === "admin" ? (
              <Link
                href="/admin/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Dashboard
              </Link>
            ) : userRole === "partner" ? (
              <Link
                href="/partner/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <LayoutDashboard className="h-4 w-4" />
                Partner Dashboard
              </Link>
            ) : userRole === "agent" ? (
              <Link
                href="/agent/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <LayoutDashboard className="h-4 w-4" />
                Agent Dashboard
              </Link>
            ) : userRole === "contractor" ? (
              <Link
                href="/contractor/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <LayoutDashboard className="h-4 w-4" />
                Contractor Dashboard
              </Link>
            ) : (
              // TEMPORARILY SHOW CONTRACTOR DASHBOARD LINK FOR ALL AUTHENTICATED USERS FOR TESTING
              <>
                <Link
                  href="/account/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  My Dashboard
                </Link>
                <Link
                  href="/contractor/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Contractor Dashboard (Test)
                </Link>
              </>
            )}
            {/* Only show orders/profile for buyers */}
            {userRole !== "seller" && userRole !== "admin" && userRole !== "partner" && (
              <>
                <Link
                  href="/account/orders"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  My Orders
                </Link>
                <Link
                  href="/account/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  My Profile
                </Link>
              </>
            )}
            {/* Seller-specific links */}
            {userRole === "seller" && (
              <Link
                href="/seller/products"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                My Products
              </Link>
            )}
            <hr className="my-1 border-gray-100" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
