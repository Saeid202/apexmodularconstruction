import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSellerDashboardData } from "@/app/actions/seller";
import { Package, Plus, Sparkles } from "lucide-react";
import { ProductActions } from "./ProductActions";
import { LuxuryLinkButton } from "@/components/seller/LuxuryButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "My Products",
  description: "Manage your product listings on Apex Modular Construction.",
};

export default async function SellerProductsPage() {
  const { profile, products, error } = await getSellerDashboardData();

  // Only redirect if not authenticated, not on DB errors
  if (!profile && error === "Not authenticated") {
    redirect("/seller/login");
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-[1000] text-black tracking-tight">Product Catalog</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {products.length} product{products.length !== 1 ? "s" : ""} currently listed
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <LuxuryLinkButton href="/seller/import" size="md">
            <Sparkles className="h-4 w-4" />
            AI Bulk Import
          </LuxuryLinkButton>
          <LuxuryLinkButton href="/seller/products/new" size="md">
            <Plus className="h-4 w-4" />
            Add Product
          </LuxuryLinkButton>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ backgroundColor: "#EDE9F6" }}>
            <Package className="h-7 w-7" style={{ color: "#4B1D8F" }} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">No products yet</h2>
          <p className="text-sm text-gray-500 mb-5">Start adding products to sell on Apex Modular Construction.</p>
          <LuxuryLinkButton href="/seller/products/new" size="md">
            <Plus className="h-4 w-4" />
            Add Your First Product
          </LuxuryLinkButton>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#F5F4F7" }}>
                  {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === "Actions" ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0" style={{ backgroundColor: "#EDE9F6" }}>
                          {product.product_images[0] ? (
                            <img src={product.product_images[0].url} alt={product.name} className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-5 w-5" style={{ color: "#4B1D8F" }} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-400 truncate">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.categories?.name || "Uncategorized"}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={product.stock_quantity < 10 ? "text-red-600 font-semibold" : "text-gray-600"}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        product.status === "active" ? "bg-green-100 text-green-700"
                        : product.status === "pending" ? "bg-yellow-100 text-yellow-700"
                        : product.status === "rejected" ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ProductActions productId={product.id} productName={product.name} productSlug={product.slug} productStatus={product.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
