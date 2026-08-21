import { createBrowserClient } from "@/lib/supabase/client";

/**
 * Uploads a product document (PDF/Excel/Word) directly from the browser
 * to Supabase Storage under the product-images bucket, documents/ prefix.
 * Returns { url, storagePath }.
 */
export async function uploadProductDocument(
  file: File,
  userId: string
): Promise<{ url: string; storagePath: string }> {
  const supabase = createBrowserClient();

  const ext = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase()
    : "bin";
  const storagePath = `documents/${userId}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(`Document upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(storagePath);

  return { url: data.publicUrl, storagePath };
}
