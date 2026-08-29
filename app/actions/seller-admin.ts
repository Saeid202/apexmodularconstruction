"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Seller } from "@/types/database";

export interface CreateSellerInput {
  email: string;
  password: string;
  business_name: string;
  business_phone?: string | null;
  business_address?: string | null;
  description?: string | null;
}

export async function createSeller(
  input: CreateSellerInput
): Promise<{ data: Seller | null; error: string | null }> {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return { data: null, error: "Failed to initialize admin database client" };
    }

    // 1. Create auth user with seller role in user_metadata
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { role: "seller" },
    });

    if (authError) {
      return { data: null, error: authError.message };
    }

    if (!authData.user) {
      return { data: null, error: "Failed to create auth user" };
    }

    // 2. Upsert profiles row (role = 'seller')
    const { error: profileError } = await admin
      .from("profiles")
      .upsert({
        id: authData.user.id,
        email: input.email,
        full_name: input.business_name,
        role: "seller",
      });

    if (profileError) {
      // Clean up the auth user if profile upsert fails
      await admin.auth.admin.deleteUser(authData.user.id);
      return { data: null, error: `Profile creation failed: ${profileError.message}` };
    }

    // 3. Insert seller profile row - status 'active'
    const { data: seller, error: sellerError } = await admin
      .from("sellers")
      .insert({
        id: authData.user.id,
        business_name: input.business_name,
        business_email: input.email,
        business_phone: input.business_phone ?? null,
        business_address: input.business_address ?? null,
        description: input.description ?? null,
        status: "active",
      })
      .select()
      .single();

    if (sellerError) {
      // Clean up both auth user and profile if seller insert fails
      await admin.from("profiles").delete().eq("id", authData.user.id);
      await admin.auth.admin.deleteUser(authData.user.id);
      return { data: null, error: `Seller record creation failed: ${sellerError.message}` };
    }

    return { data: seller as Seller, error: null };
  } catch (err: any) {
    console.error("createSeller error:", err);
    return { data: null, error: err.message ?? "Failed to create seller account" };
  }
}

export async function listSellers(): Promise<{
  data: Seller[];
  error: string | null;
}> {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return { data: [], error: "Failed to initialize admin database client" };
    }

    const { data, error } = await admin
      .from("sellers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return { data: [], error: error.message };
    return { data: (data ?? []) as Seller[], error: null };
  } catch (err: any) {
    console.error("listSellers error:", err);
    return { data: [], error: err.message ?? "Failed to list sellers" };
  }
}

export async function updateSellerStatus(
  id: string,
  status: "active" | "suspended" | "pending"
): Promise<{ error: string | null }> {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return { error: "Failed to initialize admin database client" };
    }

    const { error } = await admin
      .from("sellers")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    console.error("updateSellerStatus error:", err);
    return { error: err.message ?? "Failed to update seller status" };
  }
}
