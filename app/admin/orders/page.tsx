import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getAllOrders } from "@/app/actions/admin-orders";
import { OrdersTable } from "./OrdersTable";

export const dynamic = "force-dynamic";

const PURPLE = "#1F2937";

export default async function AdminOrdersPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data: orders, error } = await getAllOrders();

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ color: PURPLE, fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Orders</h1>
        <p style={{ color: "#6b7280", marginTop: 4, fontSize: 14 }}>
          {orders?.length ?? 0} total order{orders?.length !== 1 ? "s" : ""}
        </p>
      </div>

      {error && (
        <div style={{ padding: "1rem", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 12, color: "#b91c1c", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <OrdersTable orders={orders ?? []} />
    </div>
  );
}
