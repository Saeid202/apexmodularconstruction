"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ShippingMethod, DocType, ShippingStatus } from "@/lib/shipping-constants";

export interface ShippingAgentRequest {
  id: string;
  user_id: string;
  order_reference: string;
  origin_city: string;
  destination_city: string;
  shipping_method: ShippingMethod;
  notes: string | null;
  status: ShippingStatus;
  has_unread_response: boolean;
  shipping_agent_id: string | null;
  created_at: string;
  updated_at: string;
  buyer_name: string | null;
  buyer_email: string | null;
  documents: { id: string; file_name: string; url: string; doc_type: DocType }[];
  unread_count: number;
}

export interface ShippingMessage {
  id: string;
  request_id: string;
  sender_id: string | null;
  sender_role: "client" | "shipping_agent";
  message: string | null;
  is_read: boolean;
  created_at: string;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function getShippingAgentStats() {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("shipping_requests").select("status");
    const rows = data ?? [];
    return {
      total:       rows.length,
      pending:     rows.filter((r: any) => r.status === "pending").length,
      in_progress: rows.filter((r: any) => r.status === "in_progress").length,
      completed:   rows.filter((r: any) => r.status === "completed").length,
    };
  } catch {
    return { total: 0, pending: 0, in_progress: 0, completed: 0 };
  }
}

// ── All requests ──────────────────────────────────────────────────────────────

export async function getAllShippingRequestsForAgent(): Promise<{
  data: ShippingAgentRequest[];
  error: string | null;
}> {
  try {
    const admin = createAdminClient();

    const { data: requests, error } = await admin
      .from("shipping_requests")
      .select("*, shipping_documents(*)")
      .order("created_at", { ascending: false });

    if (error) return { data: [], error: error.message };

    // Fetch buyer profiles
    const userIds = [...new Set((requests ?? []).map((r: any) => r.user_id).filter(Boolean))];
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

    // Fetch unread message counts
    const { data: msgs } = await admin
      .from("shipping_request_messages")
      .select("request_id")
      .eq("sender_role", "client")
      .eq("is_read", false);

    const unreadMap = new Map<string, number>();
    (msgs ?? []).forEach((m: any) => {
      unreadMap.set(m.request_id, (unreadMap.get(m.request_id) ?? 0) + 1);
    });

    const data: ShippingAgentRequest[] = (requests ?? []).map((r: any) => {
      const profile = profileMap.get(r.user_id) as any;
      return {
        ...r,
        buyer_name: profile?.full_name ?? null,
        buyer_email: profile?.email ?? null,
        documents: r.shipping_documents ?? [],
        unread_count: unreadMap.get(r.id) ?? 0,
      };
    });

    return { data, error: null };
  } catch (err: any) {
    return { data: [], error: err.message ?? "Failed to fetch requests" };
  }
}

// ── Request detail ────────────────────────────────────────────────────────────

export async function getShippingRequestDetail(requestId: string): Promise<{
  request: ShippingAgentRequest | null;
  messages: ShippingMessage[];
  error: string | null;
}> {
  try {
    const admin = createAdminClient();

    const [reqResult, msgsResult] = await Promise.all([
      admin.from("shipping_requests").select("*, shipping_documents(*)").eq("id", requestId).single(),
      admin.from("shipping_request_messages").select("*").eq("request_id", requestId).order("created_at", { ascending: true }),
    ]);

    if (reqResult.error) return { request: null, messages: [], error: reqResult.error.message };

    const r = reqResult.data as any;
    const { data: profile } = await admin.from("profiles").select("full_name, email").eq("id", r.user_id).single();

    const request: ShippingAgentRequest = {
      ...r,
      buyer_name: (profile as any)?.full_name ?? null,
      buyer_email: (profile as any)?.email ?? null,
      documents: r.shipping_documents ?? [],
      unread_count: 0,
    };

    return { request, messages: msgsResult.data ?? [], error: null };
  } catch (err: any) {
    return { request: null, messages: [], error: err.message ?? "Failed to fetch detail" };
  }
}

// ── Update status ─────────────────────────────────────────────────────────────

export async function updateShippingRequestStatus(
  requestId: string,
  status: ShippingStatus
): Promise<{ error: string | null }> {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("shipping_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", requestId);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err.message ?? "Failed to update status" };
  }
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function getShippingMessages(requestId: string): Promise<ShippingMessage[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("shipping_request_messages")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: true });
    return data ?? [];
  } catch { return []; }
}

export async function sendShippingAgentMessage(
  requestId: string,
  message: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const admin = createAdminClient();
    const { error } = await admin.from("shipping_request_messages").insert({
      request_id: requestId,
      sender_id: user.id,
      sender_role: "shipping_agent",
      message,
      is_read: false,
    });
    if (error) return { error: error.message };

    // Mark unread for client
    await admin.from("shipping_requests")
      .update({ has_unread_response: true })
      .eq("id", requestId);

    return { error: null };
  } catch (err: any) {
    return { error: err.message ?? "Failed to send message" };
  }
}

export async function sendShippingClientMessage(
  requestId: string,
  message: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const admin = createAdminClient();
    const { error } = await admin.from("shipping_request_messages").insert({
      request_id: requestId,
      sender_id: user.id,
      sender_role: "client",
      message,
      is_read: false,
    });
    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err.message ?? "Failed to send message" };
  }
}

export async function markShippingMessagesRead(
  requestId: string,
  readerRole: "client" | "shipping_agent"
): Promise<void> {
  try {
    const admin = createAdminClient();
    const senderRole = readerRole === "client" ? "shipping_agent" : "client";
    await admin.from("shipping_request_messages")
      .update({ is_read: true })
      .eq("request_id", requestId)
      .eq("sender_role", senderRole);

    if (readerRole === "client") {
      await admin.from("shipping_requests")
        .update({ has_unread_response: false })
        .eq("id", requestId);
    }
  } catch {}
}

// ── Admin: create shipping agent ──────────────────────────────────────────────

export async function createShippingAgent(input: {
  email: string;
  password: string;
  full_name: string;
  phone?: string | null;
}): Promise<{ error: string | null }> {
  try {
    const admin = createAdminClient();
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { role: "shipping_agent", full_name: input.full_name },
    });
    if (authError) return { error: authError.message };
    if (!authData.user) return { error: "Failed to create user" };

    const { error: profileError } = await admin.from("profiles").insert({
      id: authData.user.id,
      email: input.email,
      full_name: input.full_name,
      phone: input.phone ?? null,
      role: "shipping_agent",
    });

    if (profileError) {
      // Clean up the auth user if profile insert failed
      await admin.auth.admin.deleteUser(authData.user.id);
      return { error: `Profile creation failed: ${profileError.message}` };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message ?? "Failed to create shipping agent" };
  }
}

export async function updateShippingAgent(id: string, input: {
  full_name: string;
  phone?: string | null;
  password?: string | null;
}): Promise<{ error: string | null }> {
  try {
    const admin = createAdminClient();

    // Update profile
    await admin.from("profiles").update({
      full_name: input.full_name,
      phone: input.phone ?? null,
    }).eq("id", id);

    // Update password if provided
    if (input.password && input.password.length >= 6) {
      const { error } = await admin.auth.admin.updateUserById(id, { password: input.password });
      if (error) return { error: error.message };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message ?? "Failed to update shipping agent" };
  }
}

export async function deleteShippingAgent(id: string): Promise<{ error: string | null }> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err.message ?? "Failed to delete shipping agent" };
  }
}

export async function listShippingAgents(): Promise<{ data: any[]; error: string | null }> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("id, full_name, email, phone, created_at")
      .eq("role", "shipping_agent")
      .order("created_at", { ascending: false });
    if (error) return { data: [], error: error.message };
    return { data: data ?? [], error: null };
  } catch (err: any) {
    return { data: [], error: err.message ?? "Failed to list shipping agents" };
  }
}
