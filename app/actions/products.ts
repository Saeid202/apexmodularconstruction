"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { Product, ProductImage, Category, Seller } from "@/types/database";

export interface ProductWithRelations extends Product {
  product_images: ProductImage[];
  categories: Category | null;
  sellers: Seller | null;
}

export interface GetProductsOptions {
  limit?: number;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
}

export async function getProducts(options: GetProductsOptions = {}): Promise<{
  data: ProductWithRelations[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    const { limit = 20, categorySlug, minPrice, maxPrice, searchQuery } = options;

    let query = supabase
      .from("products")
      .select(`
        *,
        product_images (*),
        categories (*),
        sellers (*)
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit);

    // Filter by category slug
    if (categorySlug) {
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .single();

      if (categoryError) {
        return { data: null, error: `Category not found: ${categorySlug}` };
      }

      if (category) {
        query = query.eq("category_id", category.id);
      }
    }

    if (minPrice !== undefined) query = query.gte("price", minPrice);
    if (maxPrice !== undefined) query = query.lte("price", maxPrice);
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    // Race against a 3s timeout so we fail fast and fall back to mock data
    const result = await Promise.race([
      query,
      new Promise<{ data: null; error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: "timeout" } }), 3000)
      ),
    ]);

    if (result.error) {
      console.error("Error fetching products:", result.error);
      return { data: null, error: result.error.message };
    }

    return { data: result.data as ProductWithRelations[], error: null };
  } catch (err) {
    console.error("Unexpected error fetching products:", err);
    return { data: null, error: "Failed to fetch products" };
  }
}

export async function getProductBySlug(slug: string): Promise<{
  data: ProductWithRelations | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    if (!supabase) return { data: null, error: "Supabase not configured" };

    const query = supabase
      .from("products")
      .select(`
        *,
        product_images (*),
        categories (*),
        sellers (*),
        product_documents (*),
        product_customization_groups (
          *,
          options:product_customization_options (*)
        )
      `)
      .eq("slug", slug)
      .single();

    // Race against a 3s timeout
    const result = await Promise.race([
      query,
      new Promise<{ data: null; error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: "timeout" } }), 3000)
      ),
    ]);

    if (result.error) {
      if ((result.error as any).code === "PGRST116") {
        return { data: null, error: "Product not found" };
      }
      console.error("Error fetching product:", result.error);
      return { data: null, error: result.error.message };
    }

    const product = result.data as ProductWithRelations;
    
    // Check status
    if (product.status !== "active") {
      console.warn(`Product found but status is ${product.status}: ${slug}`);
      return { data: null, error: `Product is ${product.status}` };
    }

    return { data: product, error: null };
  } catch (err) {
    console.error("Unexpected error fetching product:", err);
    return { data: null, error: "Failed to fetch product" };
  }
}

export async function getCategories(): Promise<{
  data: Category[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    if (!supabase) return { data: null, error: "Supabase not configured" };

    const result = await Promise.race([
      supabase.from("categories").select("*").order("name", { ascending: true }),
      new Promise<{ data: null; error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: "timeout" } }), 3000)
      ),
    ]);

    if (result.error) {
      console.error("Error fetching categories:", result.error);
      return { data: null, error: result.error.message };
    }

    return { data: result.data, error: null };
  } catch (err) {
    console.error("Unexpected error fetching categories:", err);
    return { data: null, error: "Failed to fetch categories" };
  }
}
