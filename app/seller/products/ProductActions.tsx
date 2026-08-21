"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteProduct, toggleProductStatus } from "@/app/actions/seller";
import { Eye, FileDown, Pencil, Trash2, Loader2, Globe, EyeOff } from "lucide-react";

interface ProductActionsProps {
  productId: string;
  productName: string;
  productSlug: string;
  productStatus: string;
}

const PURPLE = "#4B1D8F";

export function ProductActions({ productId, productName, productSlug, productStatus }: ProductActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isTogglingStatus, startStatusTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  };

  const handleToggleStatus = () => {
    const newStatus = productStatus === "active" ? "pending" : "active";
    startStatusTransition(async () => {
      await toggleProductStatus(productId, newStatus);
      router.refresh();
    });
  };

  const handleDownloadPdf = () => {
    window.open(`/products/${productSlug}?print=1`, "_blank");
  };

  const isDraft = productStatus !== "active";

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Toggle draft/publish */}
      <button
        type="button"
        title={isDraft ? "Publish product" : "Set to draft"}
        onClick={handleToggleStatus}
        disabled={isTogglingStatus}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
          isDraft
            ? "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700"
            : "bg-green-100 text-green-700 hover:bg-gray-100 hover:text-gray-500"
        }`}
      >
        {isTogglingStatus ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : isDraft ? (
          <><EyeOff className="h-3 w-3" /> Draft</>
        ) : (
          <><Globe className="h-3 w-3" /> Live</>
        )}
      </button>

      <Link href={`/products/${productSlug}`} target="_blank" title="View listing"
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#EDE9F6]"
        style={{ color: PURPLE }}>
        <Eye className="h-4 w-4" />
      </Link>
      <button type="button" title="Download PDF" onClick={handleDownloadPdf}
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#EDE9F6]"
        style={{ color: PURPLE }}>
        <FileDown className="h-4 w-4" />
      </button>
      <Link href={`/seller/products/${productId}/edit`} title="Edit product"
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#EDE9F6]"
        style={{ color: PURPLE }}>
        <Pencil className="h-4 w-4" />
      </Link>
      <button type="button"
        title="Delete product"
        onClick={handleDelete}
        disabled={isPending}
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-red-50"
        style={{ color: "#ef4444" }}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
