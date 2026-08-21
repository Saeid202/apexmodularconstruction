"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendPushNotification } from "@/lib/push/sendPushNotification";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AgentOrderItem {
  id: string;
  product_name: string;
  category: string;
  specification: string | null;
  quantity: number;
  unit: string;
  target_price: number | null;
  reference_link: string | null;
  priority: "high" | "medium" | "low";
  position: number;
}

export interface AgentOrder {
  id: string;
  user_id: string;
  order_name: string;
  notes: string | null;
  status: "pending" | "in_progress" | "quoted" | "completed";
  has_unread_response: boolean;
  created_at: string;
  items: AgentOrderItem[];
  buyer_name: string | null;
  buyer_email: string | null;
}

export interface AgentResponse {
  id: string;
  order_id: string;
  agent_id: string | null;
  supplier_name: string | null;
  unit_price: number | null;
  lead_time_days: number | null;
  notes: string | null;
  status_update: string;
  created_at: string;
  updated_at: string;
  files: { id: string; file_name: string; url: string; storage_path: string }[];
}

export interface AgentMessage {
  id: string;
  order_id: string;
  sender_id: string | null;
  sender_role: "buyer" | "agent";
  message: string | null;
  is_read: boolean;
  created_at: string;
  files: { id: string; file_name: string; url: string }[];
}

// ── Dashboard stats ───────────────────────────────────────────────────────────

export async function getAgentDashboardStats() {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("consolidation_orders").select("status");
    const orders = data ?? [];
    return {
      total: orders.length,
      pending: orders.filter((o: any) => o.status === "pending").length,
      in_progress: orders.filter((o: any) => o.status === "in_progress").length,
      quoted: orders.filter((o: any) => o.status === "quoted").length,
      completed: orders.filter((o: any) => o.status === "completed").length,
    };
  } catch { return { total: 0, pending: 0, in_progress: 0, quoted: 0, completed: 0 }; }
}

// ── All orders ────────────────────────────────────────────────────────────────

export async function getAllOrdersForAgent(): Promise<{ data: AgentOrder[]; error: string | null }> {
  try {
    const admin = createAdminClient();
    const { data: orders, error } = await admin
      .from("consolidation_orders")
      .select("*, consolidation_order_items(*)")
      .order("created_at", { ascending: false });

    if (error) return { data: [], error: error.message };

    // Fetch buyer profiles
    const userIds = [...new Set((orders ?? []).map((o: any) => o.user_id).filter(Boolean))];
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

    const data: AgentOrder[] = (orders ?? []).map((o: any) => {
      const profile = profileMap.get(o.user_id) as any;
      return {
        ...o,
        items: (o.consolidation_order_items ?? []).sort((a: any, b: any) => a.position - b.position),
        buyer_name: profile?.full_name ?? null,
        buyer_email: profile?.email ?? null,
      };
    });

    return { data, error: null };
  } catch { return { data: [], error: "Failed to fetch orders" }; }
}

// ── Order detail ──────────────────────────────────────────────────────────────

export async function getOrderDetailForAgent(orderId: string): Promise<{
  order: AgentOrder | null;
  response: AgentResponse | null;
  images: any[];
  attachments: any[];
  error: string | null;
}> {
  try {
    const admin = createAdminClient();

    // First fetch the order to get user_id, then fan out everything in parallel
    const { data: orderData, error: orderError } = await admin
      .from("consolidation_orders")
      .select("*, consolidation_order_items(*)")
      .eq("id", orderId)
      .single();

    if (orderError) return { order: null, response: null, images: [], attachments: [], error: orderError.message };

    const o = orderData as any;

    // All remaining queries in parallel — including the profile lookup
    const [responseResult, imagesResult, attachmentsResult, profileResult] = await Promise.all([
      admin.from("consolidation_order_responses").select("*, consolidation_response_files(*)").eq("order_id", orderId).maybeSingle(),
      admin.from("consolidation_item_images").select("*").eq("order_id", orderId),
      admin.from("consolidation_order_attachments").select("*").eq("order_id", orderId).order("uploaded_at", { ascending: true }),
      admin.from("profiles").select("full_name, email, phone").eq("id", o.user_id).single(),
    ]);

    const profile = profileResult.data as any;

    const order: AgentOrder = {
      ...o,
      items: (o.consolidation_order_items ?? []).sort((a: any, b: any) => a.position - b.position),
      buyer_name: profile?.full_name ?? null,
      buyer_email: profile?.email ?? null,
      buyer_phone: profile?.phone ?? null,
    };

    const resp = responseResult.data as any;
    const response: AgentResponse | null = resp ? {
      ...resp,
      files: resp.consolidation_response_files ?? [],
    } : null;

    return { order, response, images: imagesResult.data ?? [], attachments: attachmentsResult.data ?? [], error: null };
  } catch { return { order: null, response: null, images: [], attachments: [], error: "Failed to fetch order" }; }
}

// ── Update order status ───────────────────────────────────────────────────────

export async function updateOrderStatus(orderId: string, status: string): Promise<{ error: string | null }> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("consolidation_orders").update({ status }).eq("id", orderId);
    if (error) return { error: error.message };
    revalidatePath("/agent/orders");
    // Fetch user_id for push notification
    const { data: order } = await admin.from("consolidation_orders").select("user_id").eq("id", orderId).single();
    if (order?.user_id) {
      void sendPushNotification(order.user_id, {
        title: "Order Update",
        body: "Your order status has been updated. Tap to view.",
        data: { url: "/account/consolidation" },
      });
    }
    return { error: null };
  } catch { return { error: "Failed to update status" }; }
}

// ── Submit / update agent response ────────────────────────────────────────────

export interface SubmitResponseInput {
  supplier_name?: string | null;
  unit_price?: number | null;
  lead_time_days?: number | null;
  notes?: string | null;
  status_update: string;
}

export async function submitAgentResponse(
  orderId: string,
  input: SubmitResponseInput,
  files: { name: string; base64: string; type: string }[]
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const admin = createAdminClient();

    // Upsert response
    const { data: resp, error: respError } = await admin
      .from("consolidation_order_responses")
      .upsert({
        order_id: orderId,
        agent_id: user.id,
        supplier_name: input.supplier_name ?? null,
        unit_price: input.unit_price ?? null,
        lead_time_days: input.lead_time_days ?? null,
        notes: input.notes ?? null,
        status_update: input.status_update,
        updated_at: new Date().toISOString(),
      }, { onConflict: "order_id" })
      .select("id")
      .single();

    if (respError || !resp) return { error: respError?.message ?? "Failed to save response" };

    // Update order status + set unread flag for buyer
    await admin.from("consolidation_orders").update({
      status: input.status_update,
      has_unread_response: true,
    }).eq("id", orderId);

    // Fetch buyer user_id for push notification
    const { data: orderRow } = await admin.from("consolidation_orders").select("user_id").eq("id", orderId).single();

    // Upload files
    for (const file of files) {
      const storagePath = `${user.id}/${orderId}/${Date.now()}-${file.name}`;
      const binary = atob(file.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const { error: uploadError } = await admin.storage
        .from("consolidation-responses")
        .upload(storagePath, bytes, { contentType: file.type, upsert: false });

      if (!uploadError) {
        const { data: { publicUrl } } = admin.storage.from("consolidation-responses").getPublicUrl(storagePath);
        await admin.from("consolidation_response_files").insert({
          response_id: resp.id,
          file_name: file.name,
          storage_path: storagePath,
          url: publicUrl,
        });
      }
    }

    revalidatePath("/agent/orders");
    // Fire-and-forget push notification to buyer
    if (orderRow?.user_id) {
      void sendPushNotification(orderRow.user_id, {
        title: "Quote Ready",
        body: "Your consolidation order quote is ready. Tap to view.",
        data: { url: "/account/consolidation" },
      });
    }
    return { error: null };
  } catch { return { error: "Failed to submit response" }; }
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function getOrderMessages(orderId: string): Promise<AgentMessage[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("consolidation_order_messages")
      .select("*, consolidation_message_files(*)")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    return (data ?? []).map((m: any) => ({
      ...m,
      files: (m.consolidation_message_files ?? []).map((f: any) => ({
        id: f.id, file_name: f.file_name, url: f.url,
      })),
    }));
  } catch { return []; }
}

export async function sendAgentMessage(
  orderId: string,
  message: string | null,
  files: { name: string; base64: string; type: string }[]
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const admin = createAdminClient();
    const { data: msg, error: msgError } = await admin
      .from("consolidation_order_messages")
      .insert({ order_id: orderId, sender_id: user.id, sender_role: "agent", message, is_read: false })
      .select("id").single();

    if (msgError || !msg) return { error: msgError?.message ?? "Failed to send" };

    // Mark unread for buyer
    await admin.from("consolidation_orders").update({ has_unread_response: true }).eq("id", orderId);

    // Fetch buyer user_id for push notification
    const { data: orderRow } = await admin.from("consolidation_orders").select("user_id").eq("id", orderId).single();
    if (orderRow?.user_id) {
      void sendPushNotification(orderRow.user_id, {
        title: "New Message",
        body: "Your agent has sent you a new message. Tap to view.",
        data: { url: "/account/consolidation" },
      });
    }

    // Upload files
    for (const file of files) {
      const storagePath = `messages/${user.id}/${msg.id}/${file.name}`;
      const binary = atob(file.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const { error: uploadError } = await admin.storage
        .from("consolidation-responses")
        .upload(storagePath, bytes, { contentType: file.type, upsert: false });

      if (!uploadError) {
        const { data: { publicUrl } } = admin.storage.from("consolidation-responses").getPublicUrl(storagePath);
        await admin.from("consolidation_message_files").insert({
          message_id: msg.id, file_name: file.name, storage_path: storagePath, url: publicUrl,
        });
      }
    }

    return { error: null };
  } catch { return { error: "Failed to send message" }; }
}

export async function markOrderMessagesRead(orderId: string): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("consolidation_order_messages")
      .update({ is_read: true })
      .eq("order_id", orderId)
      .eq("sender_role", "buyer");
  } catch {}
}

// ── Admin: create/list agents ─────────────────────────────────────────────────

export interface CreateAgentInput {
  email: string;
  password: string;
  full_name: string;
  phone?: string | null;
}

export async function createAgent(input: CreateAgentInput): Promise<{ error: string | null }> {
  try {
    const admin = createAdminClient();
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { role: "agent", full_name: input.full_name },
    });
    if (authError) return { error: authError.message };
    if (!authData.user) return { error: "Failed to create user" };

    await admin.from("profiles").insert({
      id: authData.user.id,
      email: input.email,
      full_name: input.full_name,
      phone: input.phone ?? null,
      role: "agent",
    });

    return { error: null };
  } catch { return { error: "Failed to create agent" }; }
}

export async function listAgents(): Promise<{ data: any[]; error: string | null }> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("id, full_name, email, phone, created_at")
      .eq("role", "agent")
      .order("created_at", { ascending: false });
    if (error) return { data: [], error: error.message };
    return { data: data ?? [], error: null };
  } catch { return { data: [], error: "Failed to list agents" }; }
}
