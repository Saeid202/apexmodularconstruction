"use server";

import { createServerClient } from "@/lib/supabase/server";

export interface CartItemRow {
  id: string;
  user_id: string;
  product_id: string;
  variant_code: string | null;
  variant_image_url: string | null;
  quantity: number;
  configuration_id: string | null;
  created_at: string;
  updated_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    slug: string;
    stock_quantity: number;
  } | null;
  house_configurations?: {
    id: string;
    selections: any;
    total_price: number;
  } | null;
}

export interface GuestCartItem {
  product_id: string;
  variant_code: string | null;
  variant_image_url: string | null;
  quantity: number;
  customizations?: any;
  configuration_id?: string | null;
}

export async function addCartItem(
  productId: string,
  variantCode: string | null,
  variantImageUrl: string | null,
  quantity: number,
  customizations?: any,
  configurationId?: string | null
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Check stock before inserting
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", productId)
      .single();

    if (productError || !product) return { error: "Product not found" };
    if (product.stock_quantity <= 0) return { error: "Out of stock" };

    // Check if item already exists for this user/product/variant/configuration
    const { data: existingItems } = await supabase
      .from("cart_items")
      .select("id, quantity, customizations, configuration_id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .is("variant_code", variantCode);

    const existing = existingItems?.find(i => 
      JSON.stringify(i.customizations || {}) === JSON.stringify(customizations || {}) &&
      (i.configuration_id || null) === (configurationId || null)
    );

    if (existing) {
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity: existing.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (updateError) return { error: updateError.message };
    } else {
      const { error: insertError } = await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: productId,
        variant_code: variantCode,
        variant_image_url: variantImageUrl,
        quantity,
        customizations: customizations || null,
        configuration_id: configurationId || null,
      });
      if (insertError) return { error: insertError.message };
    }

    return { error: null };
  } catch (err) {
    console.error("Error adding cart item:", err);
    return { error: "Failed to add item to cart" };
  }
}

export async function removeCartItem(
  productId: string,
  variantCode: string | null,
  customizations?: any,
  configurationId?: string | null
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // We must find the specific row to delete because of JSON customizations and configurationId
    const { data: items } = await supabase
      .from("cart_items")
      .select("id, customizations, configuration_id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .is("variant_code", variantCode);

    const target = items?.find(i => 
      JSON.stringify(i.customizations || {}) === JSON.stringify(customizations || {}) &&
      (i.configuration_id || null) === (configurationId || null)
    );

    if (target) {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", target.id);
      if (error) return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    console.error("Error removing cart item:", err);
    return { error: "Failed to remove item from cart" };
  }
}

export async function updateCartItemQuantity(
  productId: string,
  variantCode: string | null,
  quantity: number,
  customizations?: any,
  configurationId?: string | null
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: items } = await supabase
      .from("cart_items")
      .select("id, customizations, configuration_id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .is("variant_code", variantCode);

    const target = items?.find(i => 
      JSON.stringify(i.customizations || {}) === JSON.stringify(customizations || {}) &&
      (i.configuration_id || null) === (configurationId || null)
    );

    if (target) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq("id", target.id);
      if (error) return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    console.error("Error updating cart item quantity:", err);
    return { error: "Failed to update cart item" };
  }
}

export async function getCartItems(): Promise<{
  data: CartItemRow[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        *,
        products (
          id,
          name,
          price,
          slug,
          stock_quantity
        ),
        house_configurations (
          id,
          selections,
          total_price
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as CartItemRow[], error: null };
  } catch (err) {
    console.error("Error fetching cart items:", err);
    return { data: null, error: "Failed to fetch cart items" };
  }
}

export async function clearCartItems(): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    console.error("Error clearing cart items:", err);
    return { error: "Failed to clear cart" };
  }
}

export async function mergeGuestCartItems(
  guestItems: GuestCartItem[]
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    if (!guestItems || guestItems.length === 0) return { error: null };

    for (const item of guestItems) {
      const { data: existingItems } = await supabase
        .from("cart_items")
        .select("id, quantity, customizations, configuration_id")
        .eq("user_id", user.id)
        .eq("product_id", item.product_id)
        .is("variant_code", item.variant_code);

      const existing = existingItems?.find(i => 
        JSON.stringify(i.customizations || {}) === JSON.stringify(item.customizations || {}) &&
        (i.configuration_id || null) === (item.configuration_id || null)
      );

      if (existing) {
        await supabase
          .from("cart_items")
          .update({
            quantity: existing.quantity + item.quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: item.product_id,
          variant_code: item.variant_code,
          variant_image_url: item.variant_image_url,
          quantity: item.quantity,
          customizations: item.customizations || null,
          configuration_id: item.configuration_id || null,
        });
      }
    }

    return { error: null };
  } catch (err) {
    console.error("Error merging guest cart items:", err);
    return { error: "Failed to merge cart" };
  }
}
