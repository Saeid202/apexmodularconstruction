"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface OrderItem {
  id?: string;
  product_name: string;
  category: string;
  specification?: string | null;
  quantity: number;
  unit: string;
  target_price?: number | null;
  reference_link?: string | null;
  priority: "high" | "medium" | "low";
  position: number;
}

export interface ConsolidationOrder {
  id: string;
  user_id: string;
  order_name: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export async function getMyOrders(): Promise<{ data: ConsolidationOrder[]; error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: "Not authenticated" };

    const { data: orders, error } = await supabase
      .from("consolidation_orders")
      .select("*, consolidation_order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return { data: [], error: error.message };

    return {
      data: (orders ?? []).map((o: any) => ({
        ...o,
        items: (o.consolidation_order_items ?? []).sort((a: any, b: any) => a.position - b.position),
      })),
      error: null,
    };
  } catch {
    return { data: [], error: "Failed to fetch orders" };
  }
}

export async function createOrder(
  orderName: string,
  notes: string | null,
  items: OrderItem[]
): Promise<{ id: string | null; error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { id: null, error: "Not authenticated" };

    const { data: order, error: orderError } = await supabase
      .from("consolidation_orders")
      .insert({ user_id: user.id, order_name: orderName, notes })
      .select("id")
      .single();

    if (orderError || !order) return { id: null, error: orderError?.message ?? "Failed to create order" };

    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from("consolidation_order_items")
        .insert(items.map((item, i) => ({ ...item, order_id: order.id, position: i })));
      if (itemsError) return { id: null, error: itemsError.message };
    }

    revalidatePath("/account/consolidation");
    return { id: order.id, error: null };
  } catch {
    return { id: null, error: "Failed to create order" };
  }
}

export async function updateOrder(
  orderId: string,
  orderName: string,
  notes: string | null,
  items: OrderItem[]
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error: orderError } = await supabase
      .from("consolidation_orders")
      .update({ order_name: orderName, notes, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("user_id", user.id);

    if (orderError) return { error: orderError.message };

    // Replace all items
    await supabase.from("consolidation_order_items").delete().eq("order_id", orderId);

    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from("consolidation_order_items")
        .insert(items.map((item, i) => ({ ...item, id: undefined, order_id: orderId, position: i })));
      if (itemsError) return { error: itemsError.message };
    }

    revalidatePath("/account/consolidation");
    return { error: null };
  } catch {
    return { error: "Failed to update order" };
  }
}

export async function deleteOrder(orderId: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("consolidation_orders")
      .delete()
      .eq("id", orderId)
      .eq("user_id", user.id);

    if (error) return { error: error.message };
    revalidatePath("/account/consolidation");
    return { error: null };
  } catch {
    return { error: "Failed to delete order" };
  }
}

export async function updateOrderNotes(orderId: string, notes: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("consolidation_orders")
      .update({ notes, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("user_id", user.id);

    if (error) return { error: error.message };
    return { error: null };
  } catch {
    return { error: "Failed to update notes" };
  }
}

export interface ItemImage {
  id: string;
  order_id: string;
  item_index: number;
  file_name: string;
  storage_path: string;
  url: string;
}

export async function getOrderImages(orderId: string): Promise<ItemImage[]> {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("consolidation_item_images")
      .select("*")
      .eq("order_id", orderId)
      .order("uploaded_at", { ascending: true });
    return (data ?? []) as ItemImage[];
  } catch { return []; }
}

export async function uploadItemImages(
  orderId: string,
  itemIndex: number,
  files: { name: string; base64: string; type: string }[]
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    for (const file of files) {
      const storagePath = `${user.id}/${orderId}/${itemIndex}/${Date.now()}-${file.name}`;
      const binary = atob(file.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const { error: uploadError } = await supabase.storage
        .from("consolidation-images")
        .upload(storagePath, bytes, { contentType: file.type, upsert: false });

      if (uploadError) { console.error("Image upload error:", uploadError.message); continue; }

      const { data: { publicUrl } } = supabase.storage
        .from("consolidation-images")
        .getPublicUrl(storagePath);

      await supabase.from("consolidation_item_images").insert({
        order_id: orderId,
        item_index: itemIndex,
        file_name: file.name,
        storage_path: storagePath,
        url: publicUrl,
      });
    }
    return { error: null };
  } catch { return { error: "Failed to upload images" }; }
}

export async function deleteItemImage(imageId: string, storagePath: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    await supabase.storage.from("consolidation-images").remove([storagePath]);
    await supabase.from("consolidation_item_images").delete().eq("id", imageId);
    return { error: null };
  } catch { return { error: "Failed to delete image" }; }
}

// ── Order attachments (PDF / Excel) ──────────────────────────────────────────

export interface OrderAttachment {
  id: string;
  order_id: string;
  file_name: string;
  storage_path: string;
  url: string;
  file_type: string;
  uploaded_at: string;
}

export async function getOrderAttachments(orderId: string): Promise<OrderAttachment[]> {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("consolidation_order_attachments")
      .select("*")
      .eq("order_id", orderId)
      .order("uploaded_at", { ascending: true });
    return (data ?? []) as OrderAttachment[];
  } catch { return []; }
}

export async function uploadOrderAttachments(
  orderId: string,
  files: { name: string; base64: string; type: string }[]
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    for (const file of files) {
      const storagePath = `${user.id}/${orderId}/${Date.now()}-${file.name}`;
      const binary = atob(file.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const { error: uploadError } = await supabase.storage
        .from("consolidation-attachments")
        .upload(storagePath, bytes, { contentType: file.type, upsert: false });

      if (uploadError) { console.error("Attachment upload error:", uploadError.message); continue; }

      const { data: { publicUrl } } = supabase.storage
        .from("consolidation-attachments")
        .getPublicUrl(storagePath);

      await supabase.from("consolidation_order_attachments").insert({
        order_id: orderId,
        file_name: file.name,
        storage_path: storagePath,
        url: publicUrl,
        file_type: file.type,
      });
    }
    return { error: null };
  } catch { return { error: "Failed to upload attachments" }; }
}

export async function deleteOrderAttachment(attachmentId: string, storagePath: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    await supabase.storage.from("consolidation-attachments").remove([storagePath]);
    await supabase.from("consolidation_order_attachments").delete().eq("id", attachmentId);
    return { error: null };
  } catch { return { error: "Failed to delete attachment" }; }
}
