"use server";

import { createServerClient } from "@/lib/supabase/server";
import { customizationsKey } from "@/lib/cart/canonicalJson";
import type { CartCustomizations } from "@/types/cart";

/**
 * `cart_items` stores "no variant" as '' and "no customizations" as '{}' rather
 * than NULL, so that both columns can take part in
 * `cart_items_line_identity_key` without COALESCE — see
 * supabase/migrations/059_cart_line_identity.sql.
 *
 * Every write and lookup below normalises to that representation.
 * `toCartItem` in lib/cart/cartManager.ts converts '' back to null on the way
 * out, so the rest of the app keeps its `string | null` variant type.
 */
function variantKey(variantCode: string | null | undefined): string {
  return variantCode ?? "";
}

function customizationsValue(
  customizations: CartCustomizations | null | undefined
): CartCustomizations {
  return customizations ?? {};
}

/**
 * Conflict target for `cart_items_line_identity_key`.
 *
 */
const CART_LINE_CONFLICT_TARGET =
  "user_id,product_id,variant_code,customizations_digest,configuration_id";

/**
 * Identity of a cart line, mirroring `cart_items_line_identity_key`
 */
function lineKey(
  productId: string,
  variantCode: string | null | undefined,
  customizations: CartCustomizations | null | undefined,
  configurationId: string | null | undefined
): string {
  return [
    productId,
    variantKey(variantCode),
    customizationsKey(customizations),
    configurationId ?? "",
  ].join("\u001f");
}

export interface CartItemRow {
  id: string;
  user_id: string;
  product_id: string;
  variant_code: string | null;
  variant_image_url: string | null;
  quantity: number;
  /**
   * NOT NULL in the database as of 059_cart_line_identity, defaulting
   * to '{}'. Still typed as nullable so this code is correct both before and
   * after that migration is applied; the null branch costs one `??` and every
   * reader normalises through `customizationsKey` anyway.
   */
  customizations: CartCustomizations | null;
  /**
   * sha256 of `customizations`, maintained by the database as a GENERATED ALWAYS
   * column so the line identity constraint can index a fixed 32 bytes instead of
   * an unbounded document — a btree tuple is capped at 2704 bytes and a realistic
   * payload passes that at roughly 40 customization groups.
   *
   * Returned because the query selects `*`. Never write it, and do not try to
   * recompute it in JS: matching Postgres would mean reproducing jsonb's internal
   * key ordering exactly. Use `customizationsKey` for application-side
   * comparison instead — that is the semantic check, the digest only bounds the
   * index.
   */
  readonly customizations_digest?: string;
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
    selections: unknown;
    total_price: number;
  } | null;
}

export interface GuestCartItem {
  product_id: string;
  variant_code: string | null;
  variant_image_url: string | null;
  quantity: number;
  customizations?: CartCustomizations;
  configuration_id?: string | null;
}

export async function addCartItem(
  productId: string,
  variantCode: string | null,
  variantImageUrl: string | null,
  quantity: number,
  customizations?: CartCustomizations,
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
      .eq("variant_code", variantKey(variantCode));

    const wantedCustomizations = customizationsKey(customizations);
    const existing = existingItems?.find(i =>
      customizationsKey(i.customizations) === wantedCustomizations &&
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
        variant_code: variantKey(variantCode),
        variant_image_url: variantImageUrl,
        quantity,
        customizations: customizationsValue(customizations),
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
  customizations?: CartCustomizations,
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
      .eq("variant_code", variantKey(variantCode));

    const wantedCustomizations = customizationsKey(customizations);
    const target = items?.find(i =>
      customizationsKey(i.customizations) === wantedCustomizations &&
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
  customizations?: CartCustomizations,
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
      .eq("variant_code", variantKey(variantCode));

    const wantedCustomizations = customizationsKey(customizations);
    const target = items?.find(i =>
      customizationsKey(i.customizations) === wantedCustomizations &&
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

/**
 * Folds a guest cart into the authenticated user's cart.
 *
 */
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

    // Fold the payload by line identity before anything else. Postgres rejects
    // an INSERT ... ON CONFLICT whose own rows collide with each other, so two
    // guest entries that resolve to the same line must be summed here, not sent separately.
    const folded = new Map<string, GuestCartItem>();
    for (const item of guestItems) {
      const key = lineKey(item.product_id, item.variant_code, item.customizations, item.configuration_id);
      const seen = folded.get(key);
      if (seen) {
        seen.quantity += item.quantity;
        seen.variant_image_url = seen.variant_image_url ?? item.variant_image_url;
      } else {
        folded.set(key, { ...item });
      }
    }

    // One read of what the user already has, to derive absolute targets.
    const { data: currentRows, error: readError } = await supabase
      .from("cart_items")
      .select("product_id, variant_code, quantity, customizations, configuration_id, variant_image_url")
      .eq("user_id", user.id);

    if (readError) return { error: readError.message };

    const current = new Map<string, { quantity: number; variant_image_url: string | null }>();
    for (const row of currentRows ?? []) {
      current.set(
        lineKey(row.product_id, row.variant_code, row.customizations, row.configuration_id),
        { quantity: row.quantity, variant_image_url: row.variant_image_url }
      );
    }

    // Every object must carry an identical key set: PostgREST builds one INSERT
    // from the array, so a missing key in any row would shift the columns.
    const now = new Date().toISOString();
    const rows = Array.from(folded, ([key, item]) => {
      const existing = current.get(key);
      return {
        user_id: user.id,
        product_id: item.product_id,
        variant_code: variantKey(item.variant_code),
        // Keep the image the server already had if the guest line has none,
        // rather than nulling it — an absolute upsert overwrites every column in
        // the payload.
        variant_image_url: item.variant_image_url ?? existing?.variant_image_url ?? null,
        quantity: (existing?.quantity ?? 0) + item.quantity,
        customizations: customizationsValue(item.customizations),
        configuration_id: item.configuration_id || null,
        updated_at: now,
      };
    });

    const { error } = await supabase
      .from("cart_items")
      .upsert(rows, { onConflict: CART_LINE_CONFLICT_TARGET });

    if (error) return { error: error.message };

    return { error: null };
  } catch (err) {
    console.error("Error merging guest cart items:", err);
    return { error: "Failed to merge cart" };
  }
}
