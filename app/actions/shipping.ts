"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ShippingMethod, DocType, ShippingStatus } from "@/lib/shipping-constants";

export interface ShippingDocument {
  id: string;
  request_id: string;
  file_name: string;
  url: string;
  storage_path: string;
  doc_type: DocType;
  uploaded_at: string;
}

export interface ShippingRequest {
  id: string;
  user_id: string;
  order_reference: string;
  origin_city: string;
  destination_city: string;
  shipping_method: ShippingMethod;
  notes: string | null;
  status: ShippingStatus;
  created_at: string;
  updated_at: string;
  documents: ShippingDocument[];
}

export interface CreateShippingInput {
  order_reference: string;
  origin_city: string;
  destination_city: string;
  shipping_method: ShippingMethod;
  notes: string | null;
  documents: { name: string; base64: string; type: string; doc_type: DocType }[];
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createShippingRequest(
  input: CreateShippingInput
): Promise<{ id: string | null; error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { id: null, error: "Not authenticated" };

    const admin = createAdminClient();

    // Auto-assign to the first available shipping agent
    const { data: shippingAgent } = await admin
      .from("profiles")
      .select("id")
      .eq("role", "shipping_agent")
      .limit(1)
      .single();

    // Insert request
    const { data: req, error: reqErr } = await admin
      .from("shipping_requests")
      .insert({
        user_id: user.id,
        order_reference: input.order_reference,
        origin_city: input.origin_city,
        destination_city: input.destination_city,
        shipping_method: input.shipping_method,
        notes: input.notes || null,
        status: "pending",
        shipping_agent_id: shippingAgent?.id ?? null,
      })
      .select("id")
      .single();

    if (reqErr || !req) return { id: null, error: reqErr?.message ?? "Failed to create request" };

    // Upload documents
    for (const doc of input.documents) {
      const binary = atob(doc.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const storagePath = `${user.id}/${req.id}/${Date.now()}-${doc.name}`;
      const { error: uploadErr } = await admin.storage
        .from("shipping-documents")
        .upload(storagePath, bytes, { contentType: doc.type, upsert: false });

      if (!uploadErr) {
        const { data: { publicUrl } } = admin.storage
          .from("shipping-documents")
          .getPublicUrl(storagePath);

        await admin.from("shipping_documents").insert({
          request_id: req.id,
          file_name: doc.name,
          url: publicUrl,
          storage_path: storagePath,
          doc_type: doc.doc_type,
        });
      }
    }

    return { id: req.id, error: null };
  } catch (err: any) {
    return { id: null, error: err.message ?? "Failed to create shipping request" };
  }
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

export async function getMyShippingRequests(): Promise<{
  data: ShippingRequest[];
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: "Not authenticated" };

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("shipping_requests")
      .select("*, shipping_documents(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return { data: [], error: error.message };

    const requests: ShippingRequest[] = (data ?? []).map((r: any) => ({
      ...r,
      documents: r.shipping_documents ?? [],
    }));

    return { data: requests, error: null };
  } catch (err: any) {
    return { data: [], error: err.message ?? "Failed to fetch shipping requests" };
  }
}

export async function updateShippingRequest(
  id: string,
  input: {
    order_reference: string;
    origin_city: string;
    destination_city: string;
    shipping_method: ShippingMethod;
    notes: string | null;
  }
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const admin = createAdminClient();
    const { error } = await admin
      .from("shipping_requests")
      .update({
        order_reference: input.order_reference,
        origin_city: input.origin_city,
        destination_city: input.destination_city,
        shipping_method: input.shipping_method,
        notes: input.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err.message ?? "Failed to update request" };
  }
}

// ── Delete document ───────────────────────────────────────────────────────────

export async function deleteShippingDocument(
  docId: string,
  storagePath: string
): Promise<{ error: string | null }> {
  try {
    const admin = createAdminClient();
    await admin.storage.from("shipping-documents").remove([storagePath]);
    await admin.from("shipping_documents").delete().eq("id", docId);
    return { error: null };
  } catch (err: any) {
    return { error: err.message ?? "Failed to delete document" };
  }
}

// ── Add documents to existing request ────────────────────────────────────────

export async function addShippingDocuments(
  requestId: string,
  files: { name: string; base64: string; type: string; doc_type: DocType }[]
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const admin = createAdminClient();
    for (const file of files) {
      const binary = atob(file.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const storagePath = `${user.id}/${requestId}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await admin.storage
        .from("shipping-documents")
        .upload(storagePath, bytes, { contentType: file.type, upsert: false });

      if (!uploadErr) {
        const { data: { publicUrl } } = admin.storage
          .from("shipping-documents")
          .getPublicUrl(storagePath);
        await admin.from("shipping_documents").insert({
          request_id: requestId,
          file_name: file.name,
          url: publicUrl,
          storage_path: storagePath,
          doc_type: file.doc_type,
        });
      }
    }
    return { error: null };
  } catch (err: any) {
    return { error: err.message ?? "Failed to upload documents" };
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteShippingRequest(
  id: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const admin = createAdminClient();

    // Get documents to delete from storage
    const { data: docs } = await admin
      .from("shipping_documents")
      .select("storage_path")
      .eq("request_id", id);

    if (docs && docs.length > 0) {
      await admin.storage
        .from("shipping-documents")
        .remove(docs.map((d: any) => d.storage_path));
    }

    const { error } = await admin
      .from("shipping_requests")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err.message ?? "Failed to delete shipping request" };
  }
}
