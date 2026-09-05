"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { User, ChevronDown, LogOut, LayoutDashboard, Store } from "lucide-react";

export function HeaderAuth() {
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
          className="inline-flex h-8 cursor-pointer items-center justify-center rounded-full px-3 text-[12.5px] font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          Login
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
        className="flex h-8 cursor-pointer items-center gap-2 rounded-full border border-neutral-300 px-3 text-[12.5px] font-medium text-neutral-800 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
      >
        <User className="h-3.5 w-3.5 text-[#4B1D8F]" />
        <span className="max-w-[110px] truncate">{name}</span>
        <ChevronDown className="h-3 w-3 text-neutral-400" />
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
