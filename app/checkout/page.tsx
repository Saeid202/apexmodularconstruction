import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { CheckoutFlow } from "./CheckoutFlow";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?returnUrl=/checkout");
  }

  // Try to get profile data for pre-population
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const userEmail = profile?.email ?? user.email ?? "";
  const userName = (profile as any)?.full_name ?? user.user_metadata?.full_name ?? "";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFBEB" }}>
      <CheckoutFlow userEmail={userEmail} userName={userName} />
    </div>
  );
}
