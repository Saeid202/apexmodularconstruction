"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deletePage } from "@/app/actions/cms-pages";
import type { PageContentRow } from "@/types/cms";

interface PageTreeNodeProps {
  page: PageContentRow;
  isChild?: boolean;
  onEdit: (slug: string) => void;
  onDeleted: () => void;
  onAddChild?: (parentId: string) => void;
}

export function PageTreeNode({ page, isChild, onEdit, onDeleted, onAddChild }: PageTreeNodeProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await deletePage(page.slug);
    setDeleting(false);
    setConfirmOpen(false);
    onDeleted();
  }

  const updatedAt = new Date(page.updated_at).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <div className={`flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm ${isChild ? "ml-4 border-l-2 border-l-gray-200" : ""}`}>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 text-sm">{page.title}</span>
            {isChild && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-gray-800">
                child
              </span>
            )}
            {page.is_protected && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                protected
              </span>
            )}
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 font-mono">
              /{page.slug}
            </span>
            {/* Nav visibility dot */}
            <span
              className={`h-2 w-2 rounded-full ${page.show_in_nav ? "bg-green-500" : "bg-gray-300"}`}
              title={page.show_in_nav ? "Visible in nav" : "Hidden from nav"}
            />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Updated {updatedAt}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isChild && !page.is_protected && onAddChild && (
            <button
              onClick={() => onAddChild(page.id)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors"
              title="Add child page"
            >
              <Plus className="h-3 w-3" />
              Child
            </button>
          )}
          <Link
            href={`/admin/cms/pages/${page.slug}`}
            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors"
            title="Edit page content"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => !page.is_protected && setConfirmOpen(true)}
            disabled={page.is_protected || deleting}
            title={page.is_protected ? "Protected — cannot delete" : "Delete page"}
            className={`rounded-lg border border-gray-200 p-1.5 transition-colors ${
              page.is_protected
                ? "cursor-not-allowed text-gray-300"
                : "text-gray-500 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Page"
        message={`Delete "${page.title}" (/${page.slug})? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
