"use client";

import { createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/architect/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}
