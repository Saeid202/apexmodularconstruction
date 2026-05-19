import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getEditProductData } from "@/app/actions/seller";
import { EditProductForm } from "./EditProductForm";
import { ArrowLeft, Pencil } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Product",
  description: "Edit your product listing on Apex Modular Construction.",
};

// Always fetch fresh — no stale cache
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const { profile, product, categories, documents, error } = await getEditProductData(id);

  if (!profile && error === "Not authenticated") {
    redirect("/seller/login");
  }

  if (!product) notFound();

  return (
    <div className="min-h-full py-8 px-4" style={{ backgroundColor: "#F5F4F7" }}>
      {/* Back link */}
      <div className="max-w-7xl mx-auto mb-5">
        <Link
          href="/seller/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "#4B1D8F" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </div>

      {/* Luxury frame */}
      <div
        className="max-w-7xl mx-auto rounded-2xl overflow-hidden"
        style={{
          boxShadow:
            "0 0 0 1px #4B1D8F, 0 0 0 4px #D4AF37, 0 0 0 5px #4B1D8F, 0 8px 32px rgba(75,29,143,0.18)",
        }}
      >
        {/* Header band */}
        <div
          className="relative px-8 py-6"
          style={{ background: "linear-gradient(135deg, #4B1D8F 0%, #3a1570 100%)" }}
        >
          <span className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-yellow-400 rounded-tl-md" />
          <span className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-yellow-400 rounded-tr-md" />

          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: "#D4AF37" }}
            >
              <Pencil className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Edit Product
              </h1>
              <p className="text-sm text-purple-200 mt-0.5">
                {product!.name} — update details below
              </p>
            </div>
          </div>
        </div>

        {/* Form body */}
        <div className="bg-white px-8 py-8">
          <EditProductForm 
            product={product!} 
            categories={categories} 
            initialDocuments={documents}
            userId={profile?.id || ""} 
          />
        </div>
      </div>
    </div>
  );
}
