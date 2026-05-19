import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSellerProfile, getCategories } from "@/app/actions/seller";
import { NewProductForm } from "./NewProductForm";
import { ArrowLeft, Package } from "lucide-react";

export const metadata: Metadata = {
  title: "Add New Product",
  description: "Add a new product to your Apex Modular Construction seller account.",
};

export default async function NewProductPage() {
  const profileResult = await getSellerProfile();

  if (!profileResult.data && profileResult.error === "Not authenticated") {
    redirect("/seller/login");
  }

  const categoriesResult = await getCategories();
  const categories = categoriesResult || [];

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

      {/* Outer luxury frame */}
      <div
        className="max-w-7xl mx-auto rounded-2xl overflow-hidden"
        style={{
          boxShadow: "0 0 0 1px #4B1D8F, 0 0 0 4px #D4AF37, 0 0 0 5px #4B1D8F, 0 8px 32px rgba(75,29,143,0.18)",
        }}
      >
        {/* Header band */}
        <div
          className="relative px-8 py-6"
          style={{ background: "linear-gradient(135deg, #4B1D8F 0%, #3a1570 100%)" }}
        >
          {/* Gold corner accents */}
          <span className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-yellow-400 rounded-tl-md" />
          <span className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-yellow-400 rounded-tr-md" />

          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: "#D4AF37" }}
            >
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Add New Product</h1>
              <p className="text-sm text-purple-200 mt-0.5">
                Fill in the details below. Products are reviewed before going live.
              </p>
            </div>
          </div>
        </div>

        {/* Form body */}
        <div className="bg-white px-8 py-8">
          <NewProductForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
