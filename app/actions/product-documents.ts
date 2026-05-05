"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { type FileType } from "@/lib/detectFileType";

export interface ProductDocument {
  id: string;
  product_id: string;
  name: string;
  url: string;
  file_type: FileType;
  storage_path: string;
  position: number;
  created_at: string;
}

// ─── Save documents for a product (called on form submit) ─────────────────────
// Receives the full desired state: existing docs to keep + new docs to insert.
// Deletes removed docs from storage + DB, inserts new ones.
export async function saveProductDocuments(
  productId: string,
  docs: {
    id?: string;           // existing doc — keep it
    name: string;
    url: string;
    file_type: FileType;
    storage_path: string;
    position: number;
  }[]
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Verify ownership
    const { data: product } = await supabase
      .from("products")
      .select("seller_id")
      .eq("id", productId)
      .single();
    if (!product || product.seller_id !== user.id) {
      return { error: "Access denied" };
    }

    // Fetch current docs
    const { data: existing } = await supabase
      .from("product_documents")
      .select("id, storage_path")
      .eq("product_id", productId);

    const keepIds = new Set(docs.filter((d) => d.id).map((d) => d.id!));
    const toDelete = (existing ?? []).filter((d) => !keepIds.has(d.id));

    // Delete removed docs from storage + DB
    if (toDelete.length > 0) {
      const admin = createAdminClient();
      const paths = toDelete.map((d) => d.storage_path).filter(Boolean);
      if (paths.length > 0) {
        await admin.storage.from("product-images").remove(paths);
      }
      await supabase
        .from("product_documents")
        .delete()
        .in("id", toDelete.map((d) => d.id));
    }

    // Update positions of kept docs
    const kept = docs.filter((d) => d.id);
    for (const doc of kept) {
      await supabase
        .from("product_documents")
        .update({ name: doc.name, position: doc.position })
        .eq("id", doc.id!);
    }

    // Insert new docs
    const newDocs = docs.filter((d) => !d.id);
    if (newDocs.length > 0) {
      const rows = newDocs.map((d) => ({
        product_id: productId,
        name: d.name,
        url: d.url,
        file_type: d.file_type,
        storage_path: d.storage_path,
        position: d.position,
      }));
      const { error: insertErr } = await supabase
        .from("product_documents")
        .insert(rows);
      if (insertErr) return { error: insertErr.message };
    }

    revalidatePath(`/products`);
    return { error: null };
  } catch (err) {
    console.error("saveProductDocuments error:", err);
    return { error: "Failed to save documents" };
  }
}

// ─── Fetch documents for a product ────────────────────────────────────────────
export async function getProductDocuments(productId: string): Promise<{
  data: ProductDocument[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("product_documents")
      .select("*")
      .eq("product_id", productId)
      .order("position", { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: data as ProductDocument[], error: null };
  } catch (err) {
    return { data: null, error: "Failed to fetch documents" };
  }
}
