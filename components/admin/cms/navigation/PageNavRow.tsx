"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
import { updatePageNavAssignment } from "@/app/actions/cms-navigation";
import type { PageContentRow } from "@/types/cms";

interface PageNavRowProps {
  page: PageContentRow;
  onChanged: () => void;
  showNavControls?: boolean;
}

export function PageNavRow({ page, onChanged, showNavControls = true }: PageNavRowProps) {
  const [toggling, setToggling] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(page.nav_label ?? "");
  const [editingPosition, setEditingPosition] = useState(false);
  const [positionValue, setPositionValue] = useState(String(page.nav_position ?? ""));

  async function handleToggleNav(val: boolean) {
    setToggling(true);
    await updatePageNavAssignment(page.slug, { show_in_nav: val });
    setToggling(false);
    onChanged();
  }

  async function handleLabelBlur() {
    setEditingLabel(false);
    const trimmed = labelValue.trim();
    const newVal = trimmed === "" ? null : trimmed;
    if (newVal !== page.nav_label) {
      await updatePageNavAssignment(page.slug, { nav_label: newVal });
      onChanged();
    }
  }

  async function handlePositionBlur() {
    setEditingPosition(false);
    const parsed = positionValue.trim() === "" ? null : parseInt(positionValue) || 0;
    if (parsed !== page.nav_position) {
      await updatePageNavAssignment(page.slug, { nav_position: parsed });
      onChanged();
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm">
      {/* Title + label */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 text-sm">{page.title}</span>
          {page.parent_id && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-gray-800">
              child
            </span>
          )}
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 font-mono">
            /{page.slug}
          </span>
        </div>

        {/* Inline editable nav_label */}
        {showNavControls && (
          <div className="mt-1 flex items-center gap-2">
            {editingLabel ? (
              <input
                autoFocus
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                onBlur={handleLabelBlur}
                onKeyDown={(e) => e.key === "Enter" && handleLabelBlur()}
                placeholder="Nav label (optional)"
                className="rounded border border-blue-400 px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-40"
              />
            ) : (
              <button
                onClick={() => setEditingLabel(true)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                <Pencil className="h-3 w-3" />
                {page.nav_label ? (
                  <span className="text-gray-600">{page.nav_label}</span>
                ) : (
                  <span className="italic">Set nav label</span>
                )}
              </button>
            )}

            <span className="text-gray-200">·</span>

            {/* Inline editable nav_position */}
            {editingPosition ? (
              <input
                autoFocus
                type="number"
                value={positionValue}
                onChange={(e) => setPositionValue(e.target.value)}
                onBlur={handlePositionBlur}
                onKeyDown={(e) => e.key === "Enter" && handlePositionBlur()}
                className="rounded border border-blue-400 px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-16"
              />
            ) : (
              <button
                onClick={() => setEditingPosition(true)}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                pos: {page.nav_position ?? "—"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {showNavControls && (
          <Toggle
            checked={page.show_in_nav}
            onChange={handleToggleNav}
            disabled={toggling}
            label="In nav"
          />
        )}
        {!showNavControls && (
          <Toggle
            checked={page.show_in_nav}
            onChange={handleToggleNav}
            disabled={toggling}
          />
        )}
        <Link
          href={`/admin/cms/pages/${page.slug}`}
          className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors"
          title="Edit page"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
