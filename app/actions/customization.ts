"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CustomizationGroup = Database['public']['Tables']['product_customization_groups']['Row'];
type CustomizationOption = Database['public']['Tables']['product_customization_options']['Row'];
type InsertCustomizationGroup = Database['public']['Tables']['product_customization_groups']['Insert'];
type InsertCustomizationOption = Database['public']['Tables']['product_customization_options']['Insert'];
type UpdateCustomizationGroup = Database['public']['Tables']['product_customization_groups']['Update'];
type UpdateCustomizationOption = Database['public']['Tables']['product_customization_options']['Update'];

// ===== CUSTOMIZATION GROUPS (CATEGORIES) =====

export async function getCustomizationGroups(productId: string): Promise<{
  data: (CustomizationGroup & { options: CustomizationOption[] })[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    if (!supabase) return { data: null, error: "Supabase not configured" };

    const { data: groups, error: groupsError } = await supabase
      .from("product_customization_groups")
      .select(`
        *,
        options:product_customization_options(*)
      `)
      .eq("product_id", productId)
      .order("display_order");

    if (groupsError) throw groupsError;

    return { data: groups || [], error: null };
  } catch (error) {
    console.error("getCustomizationGroups error:", error);
    return { data: null, error: "Failed to fetch customization groups" };
  }
}

export async function createCustomizationGroup(groupData: InsertCustomizationGroup): Promise<{
  data: CustomizationGroup | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    if (!supabase) return { data: null, error: "Supabase not configured" };

    // Get the highest display_order for this product
    const { data: maxOrder } = await supabase
      .from("product_customization_groups")
      .select("display_order")
      .eq("product_id", groupData.product_id)
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    const displayOrder = maxOrder ? maxOrder.display_order + 1 : 0;

    const { data, error } = await supabase
      .from("product_customization_groups")
      .insert({
        ...groupData,
        display_order: displayOrder,
      })
      .select()
      .single();

    if (error) throw error;

    // Update product to indicate it has customization
    await supabase
      .from("products")
      .update({ has_customization: true })
      .eq("id", groupData.product_id);

    return { data, error: null };
  } catch (error) {
    console.error("createCustomizationGroup error:", error);
    return { data: null, error: "Failed to create customization group" };
  }
}

export async function updateCustomizationGroup(
  id: string,
  groupData: UpdateCustomizationGroup
): Promise<{
  data: CustomizationGroup | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    if (!supabase) return { data: null, error: "Supabase not configured" };

    const { data, error } = await supabase
      .from("product_customization_groups")
      .update({
        ...groupData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("updateCustomizationGroup error:", error);
    return { data: null, error: "Failed to update customization group" };
  }
}

export async function deleteCustomizationGroup(id: string): Promise<{
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    if (!supabase) return { error: "Supabase not configured" };

    const { error } = await supabase
      .from("product_customization_groups")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error("deleteCustomizationGroup error:", error);
    return { error: "Failed to delete customization group" };
  }
}

// ===== CUSTOMIZATION OPTIONS =====

export async function createCustomizationOption(optionData: InsertCustomizationOption): Promise<{
  data: CustomizationOption | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    if (!supabase) return { data: null, error: "Supabase not configured" };

    // Get the highest display_order for this group
    const { data: maxOrder } = await supabase
      .from("product_customization_options")
      .select("display_order")
      .eq("group_id", optionData.group_id)
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    const displayOrder = maxOrder ? maxOrder.display_order + 1 : 0;

    const { data, error } = await supabase
      .from("product_customization_options")
      .insert({
        ...optionData,
        display_order: displayOrder,
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("createCustomizationOption error:", error);
    return { data: null, error: "Failed to create customization option" };
  }
}

export async function updateCustomizationOption(
  id: string,
  optionData: UpdateCustomizationOption
): Promise<{
  data: CustomizationOption | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    if (!supabase) return { data: null, error: "Supabase not configured" };

    const { data, error } = await supabase
      .from("product_customization_options")
      .update({
        ...optionData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("updateCustomizationOption error:", error);
    return { data: null, error: "Failed to update customization option" };
  }
}

export async function deleteCustomizationOption(id: string): Promise<{
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    if (!supabase) return { error: "Supabase not configured" };

    const { error } = await supabase
      .from("product_customization_options")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error("deleteCustomizationOption error:", error);
    return { error: "Failed to delete customization option" };
  }
}

// ===== BULK OPERATIONS =====

export async function saveProductCustomizations(
  productId: string,
  groups: (InsertCustomizationGroup & {
    options: (InsertCustomizationOption & { id?: string })[];
  })[]
): Promise<{
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    if (!supabase) return { error: "Supabase not configured" };

    // Start a transaction by using RPC
    const { error } = await supabase.rpc('save_product_customizations', {
      p_product_id: productId,
      p_groups: groups
    });

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error("saveProductCustomizations error:", error);
    return { error: "Failed to save product customizations" };
  }
}

// ===== REORDERING =====

export async function reorderCustomizationGroups(
  productId: string,
  groupIds: string[]
): Promise<{
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    if (!supabase) return { error: "Supabase not configured" };

    const updates = groupIds.map((id, index) => ({
      id,
      display_order: index,
    }));

    const { error } = await supabase
      .from("product_customization_groups")
      .upsert(updates);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error("reorderCustomizationGroups error:", error);
    return { error: "Failed to reorder customization groups" };
  }
}

export async function reorderCustomizationOptions(
  groupId: string,
  optionIds: string[]
): Promise<{
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    if (!supabase) return { error: "Supabase not configured" };

    const updates = optionIds.map((id, index) => ({
      id,
      display_order: index,
    }));

    const { error } = await supabase
      .from("product_customization_options")
      .upsert(updates);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error("reorderCustomizationOptions error:", error);
    return { error: "Failed to reorder customization options" };
  }
}
