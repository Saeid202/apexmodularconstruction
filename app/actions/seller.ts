"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { Product, ProductImage, Category, Seller } from "@/types/database";
import type { CustomizationGroup, CustomizationOption } from "@/types";

/** Generate a unique slug for a product, appending a random suffix on collision. */
async function uniqueSlug(supabase: Awaited<ReturnType<typeof createServerClient>>, name: string, excludeId?: string): Promise<string> {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let slug = base;
  for (let i = 0; i < 5; i++) {
    let q = supabase.from("products").select("id").eq("slug", slug);
    if (excludeId) q = q.neq("id", excludeId);
    const { data } = await q.maybeSingle();
    if (!data) return slug;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return slug;
}

export interface SellerProduct extends Product {
  product_images: ProductImage[];
  categories: Category | null;
  product_customization_groups: (CustomizationGroup & {
    options: CustomizationOption[];
  })[];
}

// Combined function for dashboard - single auth call, parallel queries
export async function getSellerDashboardData(): Promise<{
  profile: Seller | null;
  products: SellerProduct[];
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { profile: null, products: [], error: "Not authenticated" };
    }

    // Parallel queries - only one auth call above
    const [profileResult, productsResult] = await Promise.all([
      supabase.from("sellers").select("*").eq("id", user.id).single(),
      supabase
        .from("products")
        .select(`
          *,
          product_images (*),
          categories (*),
          product_customization_groups (
            *,
            options:product_customization_options (*)
          )
        `)
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (profileResult.error) {
      return { profile: null, products: [], error: profileResult.error.message };
    }

    return {
      profile: profileResult.data,
      products: (productsResult.data as SellerProduct[]) || [],
      error: null,
    };
  } catch (err) {
    console.error("Error fetching seller dashboard data:", err);
    return { profile: null, products: [], error: "Failed to fetch data" };
  }
}

// Get current seller profile
export async function getSellerProfile(): Promise<{
  data: Seller | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("sellers")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Error fetching seller profile:", err);
    return { data: null, error: "Failed to fetch seller profile" };
  }
}

// Get seller's products - optimized to accept optional userId
export async function getSellerProducts(userId?: string): Promise<{
  data: SellerProduct[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    
    // Use provided userId or fetch user
    let uid = userId;
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: "Not authenticated" };
      }
      uid = user.id;
    }

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images (*),
        categories (*),
        product_customization_groups (
          *,
          options:product_customization_options (*)
        )
      `)
      .eq("seller_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as SellerProduct[], error: null };
  } catch (err) {
    console.error("Error fetching seller products:", err);
    return { data: null, error: "Failed to fetch products" };
  }
}

// Get a single product by ID for editing
export async function getSellerProductById(productId: string, userId?: string): Promise<{
  data: SellerProduct | null;
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
      .from("products")
      .select(`
        *,
        product_images (*),
        categories (*),
        product_customization_groups (
          *,
          options:product_customization_options (*)
        )
      `)
      .eq("id", productId)
      .eq("seller_id", uid)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as SellerProduct, error: null };
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    return { data: null, error: "Failed to fetch product" };
  }
}

// Get all data needed for the edit product page in one go
export async function getEditProductData(productId: string): Promise<{
  profile: Seller | null;
  product: SellerProduct | null;
  categories: Category[];
  documents: any[];
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { profile: null, product: null, categories: [], error: "Not authenticated" };
    }

    const [profileResult, productResult, categoriesResult, documentsResult] = await Promise.all([
      supabase.from("sellers").select("*").eq("id", user.id).single(),
      supabase
        .from("products")
        .select(`
          *,
          product_images (*),
          categories (*),
          product_customization_groups (
            *,
            options:product_customization_options (*)
          )
        `)
        .eq("id", productId)
        .eq("seller_id", user.id)
        .single(),
      supabase.from("categories").select("*").order("name"),
      supabase.from("product_documents").select("*").eq("product_id", productId).order("position"),
    ]);

    if (profileResult.error) {
      return { profile: null, product: null, categories: [], documents: [], error: profileResult.error.message };
    }

    return {
      profile: profileResult.data,
      product: productResult.data as SellerProduct,
      categories: categoriesResult.data || [],
      documents: documentsResult.data || [],
      error: null,
    };
  } catch (err) {
    console.error("Error fetching edit product data:", err);
    return { profile: null, product: null, categories: [], error: "Failed to fetch data" };
  }
}

// Create a new product
export async function createProduct(formData: FormData): Promise<{
  data: Product | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }

    // Verify user is a seller via auth metadata (faster than a DB query)
    const role = user.user_metadata?.role;
    if (role !== "seller") {
      return { data: null, error: "Not a seller account" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const priceType = (formData.get("priceType") as string) || "unit";
    const compareAtPrice = formData.get("compareAtPrice") ? parseFloat(formData.get("compareAtPrice") as string) : null;
    const stockQuantity = parseInt(formData.get("stockQuantity") as string);
    const categoryId = formData.get("categoryId") as string;
    const specificationsStr = formData.get("specifications") as string;
    
    // Generate unique slug
    const slug = await uniqueSlug(supabase, name);

    // Parse specifications JSON
    let specifications = {};
    try {
      if (specificationsStr) {
        specifications = JSON.parse(specificationsStr);
      }
    } catch {
      // If not valid JSON, try key=value format
      const lines = specificationsStr.split("\n").filter(Boolean);
      for (const line of lines) {
        const [key, value] = line.split(":").map(s => s.trim());
        if (key && value) {
          specifications[key] = value;
        }
      }
    }

    // Create product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        description,
        price,
        price_type: priceType,
        compare_at_price: compareAtPrice,
        stock_quantity: stockQuantity,
        category_id: categoryId,
        seller_id: user.id,
        specifications,
        require_order_request: formData.get("requireOrderRequest") === "true",
        show_stock: formData.get("showStock") !== "false",
        youtube_url: (formData.get("youtubeUrl") as string | null) || null,
        status: formData.get("publishStatus") === "draft" ? "pending" : "active",
        configurator_type: (formData.get("configuratorType") as string | null) || "none",
      })
      .select()
      .single();

    if (productError) {
      return { data: null, error: productError.message };
    }

    // Images are uploaded client-side before this action is called.
    // variantsJson contains { url, code, price, isMaster } for each variant.
    const variantsJson = formData.get("variantsJson") as string | null;
    let variants: { url: string; code: string; price?: number | null; isMaster: boolean }[] = [];
    try {
      if (variantsJson) variants = JSON.parse(variantsJson);
    } catch { /* ignore */ }

    if (variants.length > 0) {
      const rows = variants.map((v, i) => ({
        product_id: product.id,
        url: v.url,
        alt_text: v.code || product.name,
        position: i,
        variant_code: v.code || null,
        variant_price: v.price ?? null,
        is_master: v.isMaster,
      }));
      const { error: batchErr } = await supabase.from("product_images").insert(rows);
      if (batchErr) console.error("Batch image insert error:", batchErr.message);
    }

    // 4. Handle Customizations
    const customizationsJson = formData.get("customizationsJson") as string | null;
    if (customizationsJson) {
      try {
        const groups = JSON.parse(customizationsJson);
        if (groups.length > 0) {
          // Mark product as having customizations
          await supabase.from("products").update({ has_customization: true }).eq("id", product.id);

          for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            const { data: g, error: gErr } = await supabase
              .from("product_customization_groups")
              .insert({
                product_id: product.id,
                name: group.name,
                display_order: i,
              })
              .select()
              .single();

            if (g && group.options?.length > 0) {
              const optRows = group.options.map((o: any, idx: number) => ({
                group_id: g.id,
                name: o.name,
                price_modifier: parseFloat(o.priceModifier || "0"),
                image_url: o.imageUrl,
                display_order: idx,
              }));
              await supabase.from("product_customization_options").insert(optRows);
            }
          }
        }
      } catch (err) {
        console.error("Error saving customizations:", err);
      }
    }

    revalidatePath("/seller/products");
    return { data: product, error: null };
  } catch (err) {
    console.error("Error creating product:", err);
    return { data: null, error: "Failed to create product" };
  }
}

// Update an existing product
export async function updateProduct(productId: string, formData: FormData): Promise<{
  data: Product | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }

    // Verify ownership
    const { data: existingProduct } = await supabase
      .from("products")
      .select("seller_id")
      .eq("id", productId)
      .single();

    if (!existingProduct || existingProduct.seller_id !== user.id) {
      return { data: null, error: "Product not found or access denied" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const priceType = (formData.get("priceType") as string) || "unit";
    const compareAtPrice = formData.get("compareAtPrice") ? parseFloat(formData.get("compareAtPrice") as string) : null;
    const stockQuantity = parseInt(formData.get("stockQuantity") as string);
    const categoryId = formData.get("categoryId") as string;
    const specificationsStr = formData.get("specifications") as string;
    
    // Generate unique slug (exclude current product to allow same name on update)
    const slug = await uniqueSlug(supabase, name, productId);

    // Parse specifications
    let specifications = {};
    try {
      if (specificationsStr) {
        specifications = JSON.parse(specificationsStr);
      }
    } catch {
      const lines = specificationsStr.split("\n").filter(Boolean);
      for (const line of lines) {
        const [key, value] = line.split(":").map(s => s.trim());
        if (key && value) {
          specifications[key] = value;
        }
      }
    }

    const requireOrderRequest = formData.get("requireOrderRequest") === "true";
    const showStock = formData.get("showStock") !== "false"; // default true
    const youtubeUrl = (formData.get("youtubeUrl") as string | null) || null;
    const hasCustomization = formData.get("hasCustomization") === "true";

    const { data: product, error: productError } = await supabase
      .from("products")
      .update({
        name,
        slug,
        description,
        price,
        price_type: priceType,
        compare_at_price: compareAtPrice,
        stock_quantity: stockQuantity,
        category_id: categoryId,
        specifications,
        require_order_request: requireOrderRequest,
        show_stock: showStock,
        youtube_url: youtubeUrl,
        has_customization: hasCustomization,
        configurator_type: (formData.get("configuratorType") as string | null) || "none",
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select()
      .single();

    if (productError) {
      return { data: null, error: productError.message };
    }

    // Images are uploaded client-side before this action is called.
    // variantsJson contains { url, code, price, isMaster, existingUrl } for each variant.
    const variantsJson = formData.get("variantsJson") as string | null;
    let variants: { url?: string; code: string; price?: number | null; isMaster: boolean; existingUrl?: string }[] = [];
    try {
      if (variantsJson) variants = JSON.parse(variantsJson);
    } catch { /* ignore */ }

    const storageClient = createAdminClient() || supabase;

    if (variantsJson) {
      // 1. Fetch current images from DB to see what might need storage cleanup
      const { data: oldImages } = await supabase
        .from("product_images")
        .select("url")
        .eq("product_id", productId);

      if (oldImages && oldImages.length > 0) {
        // Get the storage paths of all NEW images we want to keep
        const newPaths = new Set(
          variants
            .map(v => (v.url || v.existingUrl)?.split("/product-images/")[1])
            .filter(Boolean)
        );

        // Get the storage paths of OLD images that are no longer in the new set
        const pathsToDelete = oldImages
          .map(img => img.url.split("/product-images/")[1])
          .filter(path => path && !newPaths.has(path)) as string[];

        // Only remove if we have something to delete
        if (pathsToDelete.length > 0) {
          // Safety: Don't delete anything that was just uploaded in this request
          // (This is redundant if newPaths is correct, but good for peace of mind)
          await storageClient.storage.from("product-images").remove(pathsToDelete);
        }
      }

      // 2. Refresh the database rows
      await supabase.from("product_images").delete().eq("product_id", productId);

      const rows = variants
        .map((v, i) => {
          const resolvedUrl = v.url ?? v.existingUrl ?? null;
          if (!resolvedUrl) return null;
          return {
            product_id: productId,
            url: resolvedUrl,
            alt_text: v.code || name,
            position: i,
            variant_code: v.code || null,
            variant_price: v.price ?? null,
            is_master: v.isMaster,
          };
        })
        .filter(Boolean) as any[];

      if (rows.length > 0) {
        const { error: batchErr } = await supabase.from("product_images").insert(rows);
        if (batchErr) console.error("Batch update image insert error:", batchErr.message);
      }
    }

    // Handle Customizations Update
    const customizationsJson = formData.get("customizationsJson") as string | null;
    if (customizationsJson) {
      try {
        const groups = JSON.parse(customizationsJson);
        
        // Always clear old customizations first
        await supabase.from("product_customization_groups").delete().eq("product_id", productId);
        
        if (groups.length > 0) {
          await supabase.from("products").update({ has_customization: true }).eq("id", productId);

          for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            const { data: g } = await supabase
              .from("product_customization_groups")
              .insert({
                product_id: productId,
                name: group.name,
                display_order: i,
              })
              .select()
              .single();

            if (g && group.options?.length > 0) {
              const optRows = group.options.map((o: any, idx: number) => ({
                group_id: g.id,
                name: o.name,
                price_modifier: parseFloat(o.priceModifier || "0"),
                image_url: o.imageUrl,
                display_order: idx,
              }));
              await supabase.from("product_customization_options").insert(optRows);
            }
          }
        } else {
          await supabase.from("products").update({ has_customization: false }).eq("id", productId);
        }
      } catch (err) {
        console.error("Error updating customizations:", err);
      }
    }

    revalidatePath("/seller/products");
    return { data: product, error: null };
  } catch (err) {
    console.error("Error updating product:", err);
    return { data: null, error: "Failed to update product" };
  }
}

// Toggle product status between active and pending (draft)
export async function toggleProductStatus(productId: string, newStatus: "active" | "pending"): Promise<{
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("products")
      .update({ status: newStatus })
      .eq("id", productId)
      .eq("seller_id", user.id);

    if (error) return { error: error.message };
    revalidatePath("/seller/products");
    return { error: null };
  } catch {
    return { error: "Failed to update status" };
  }
}

// Delete a product
export async function deleteProduct(productId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify ownership + fetch images in one query
    const { data: product } = await supabase
      .from("products")
      .select("seller_id, product_images(url)")
      .eq("id", productId)
      .single();

    if (!product || product.seller_id !== user.id) {
      return { success: false, error: "Product not found or access denied" };
    }

    // Delete all storage images in parallel (one batch call)
    const paths = (product.product_images ?? [])
      .map((img: any) => img.url.split("/product-images/")[1])
      .filter(Boolean);

    if (paths.length > 0) {
      await supabase.storage.from("product-images").remove(paths);
    }

    // Delete product (cascade will delete images rows)
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/seller/products");
    return { success: true, error: null };
  } catch (err) {
    console.error("Error deleting product:", err);
    return { success: false, error: "Failed to delete product" };
  }
}

// Register as a seller
export async function registerSeller(formData: FormData): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const businessName = formData.get("businessName") as string;
    const businessPhone = formData.get("businessPhone") as string;
    const businessAddress = formData.get("businessAddress") as string;
    const description = formData.get("description") as string;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "seller",
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: "Failed to create account" };
    }

    // Create profile
    await supabase.from("profiles").insert({
      id: authData.user.id,
      email,
      role: "seller",
    });

    // Create seller profile
    const { error: sellerError } = await supabase.from("sellers").insert({
      id: authData.user.id,
      business_name: businessName,
      business_email: email,
      business_phone: businessPhone || null,
      business_address: businessAddress || null,
      description: description || null,
      status: "active", // Auto-approved, no admin review needed
    });
    
    return { success: true, error: null };
  } catch (err) {
    console.error("Error registering seller:", err);
    return { success: false, error: "Failed to register seller" };
  }
}

// Update seller profile
export async function updateSellerProfile(data: {
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  description: string;
}): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
      .from("sellers")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/seller/profile");
    return { success: true, error: null };
  } catch (err) {
    console.error("Error updating seller profile:", err);
    return { success: false, error: "Failed to update profile" };
  }
}

// Get categories for product form
export async function getCategories() {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url, parent_id, created_at")
      .order("name");
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
