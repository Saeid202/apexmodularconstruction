"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { syncCartWithSession } from "@/lib/cart/cartManager";

/**
 * Keeps the local cart reconciled with the Supabase session, app-wide.
 *
 * Mounted once in the root layout, so it survives client-side navigation and the
 * initial sync costs one call per full page load rather than one per route
 * change. `/cart` still runs its own sync because it needs to await the result
 * to decide when to stop showing its loading skeleton.
 *
 * Renders nothing.
 */
export function CartSessionSync() {
  useEffect(() => {
    let active = true;
    const supabase = createBrowserClient();

    void syncCartWithSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      // TOKEN_REFRESHED and USER_UPDATED do not change who owns the cart.
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT") return;
      if (!active) return;
      void syncCartWithSession();
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return null;
}
