"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface OrderRequestInput {
  productId: string;
  sellerId: string;
  productName: string;
  productPrice: number;
  variantCode: string | null;
  quantity: number;
  message: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  shippingAddress: {
    addressLine1: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  customizations?: any;
}

export interface OrderRequestRow {
  id: string;
  request_number: string;
  product_id: string | null;
  seller_id: string | null;
  buyer_id: string | null;
  quantity: number;
  message: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  shipping_address: Record<string, unknown>;
  status: "pending" | "accepted" | "rejected";
  product_name: string;
  product_price: number | null;
  variant_code: string | null;
  customizations: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

function generateRequestNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `RQ-${date}-${suffix}`;
}

// ─── Submit a new order request (buyer) ───────────────────────────────────────
export async function submitOrderRequest(input: OrderRequestInput): Promise<{
  requestNumber: string | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { requestNumber: null, error: "You must be logged in to submit an order request." };

    // Generate unique request number
    let requestNumber = generateRequestNumber();
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: existing } = await supabase
        .from("order_requests")
        .select("id")
        .eq("request_number", requestNumber)
        .maybeSingle();
      if (!existing) break;
      requestNumber = generateRequestNumber();
    }

    const { data: req, error: insertError } = await supabase
      .from("order_requests")
      .insert({
        request_number: requestNumber,
        product_id: input.productId,
        seller_id: input.sellerId,
        buyer_id: user.id,
        quantity: input.quantity,
        message: input.message || null,
        contact_name: input.contactName,
        contact_email: input.contactEmail,
        contact_phone: input.contactPhone || null,
        shipping_address: input.shippingAddress,
        status: "pending",
        product_name: input.productName,
        product_price: input.productPrice,
        variant_code: input.variantCode,
        customizations: input.customizations || null,
      })
      .select("id, request_number")
      .single();

    if (insertError || !req) {
      console.error("submitOrderRequest insert error:", insertError?.message);
      return { requestNumber: null, error: "Failed to submit request. Please try again." };
    }

    // Send push notification to seller
    try {
      await notifySellerNewRequest(input.sellerId, input.productName, requestNumber);
    } catch (e) {
      console.error("Push notification failed (non-fatal):", e);
    }

    revalidatePath("/account/orders");
    revalidatePath("/seller/orders");

    return { requestNumber: req.request_number, error: null };
  } catch (err) {
    console.error("submitOrderRequest unexpected error:", err);
    return { requestNumber: null, error: "An unexpected error occurred." };
  }
}

// ─── Fetch buyer's own order requests ─────────────────────────────────────────
export async function getBuyerOrderRequests(): Promise<{
  data: OrderRequestRow[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("order_requests")
      .select("*")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as OrderRequestRow[], error: null };
  } catch (err) {
    console.error("getBuyerOrderRequests error:", err);
    return { data: null, error: "Failed to fetch order requests" };
  }
}

// ─── Fetch seller's order requests ────────────────────────────────────────────
export async function getSellerOrderRequests(userId?: string): Promise<{
  data: OrderRequestRow[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    
    let uid = userId;
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: "Not authenticated" };
      uid = user.id;
    }

    const { data, error } = await supabase
      .from("order_requests")
      .select("*")
      .eq("seller_id", uid)
      .order("created_at", { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as OrderRequestRow[], error: null };
  } catch (err) {
    console.error("getSellerOrderRequests error:", err);
    return { data: null, error: "Failed to fetch order requests" };
  }
}

// ─── Update request status (seller) ──────────────────────────────────────────
export async function updateOrderRequestStatus(
  requestId: string,
  status: "accepted" | "rejected"
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("order_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", requestId)
      .eq("seller_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/seller/orders");
    return { error: null };
  } catch (err) {
    console.error("updateOrderRequestStatus error:", err);
    return { error: "Failed to update status" };
  }
}

// ─── Push notification helper ─────────────────────────────────────────────────
async function notifySellerNewRequest(
  sellerId: string,
  productName: string,
  requestNumber: string
): Promise<void> {
  const admin = createAdminClient();

  // Fetch seller's push subscriptions
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", sellerId);

  if (!subs || subs.length === 0) return;

  // Dynamic import to avoid bundling web-push in client chunks
  const webpush = await import("web-push");

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL ?? "mailto:info@cargoplus.site";

  if (!vapidPublic || !vapidPrivate) {
    console.warn("VAPID keys not configured — skipping push notification");
    return;
  }

  webpush.default.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

  const payload = JSON.stringify({
    title: "New Order Request",
    body: `${requestNumber} — ${productName}`,
    url: "/seller/orders",
  });

  await Promise.allSettled(
    subs.map((sub) =>
      webpush.default.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    )
  );
}
