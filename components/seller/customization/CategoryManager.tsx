"use client";

import { useState } from "react";
import { Plus, X, Edit2, GripVertical, Settings } from "lucide-react";
import { createCustomizationGroup, updateCustomizationGroup, deleteCustomizationGroup } from "@/app/actions/customization";
import type { Database } from "@/types/database";

type CustomizationGroup = Database['public']['Tables']['product_customization_groups']['Row'];
type UpdateCustomizationGroup = Database['public']['Tables']['product_customization_groups']['Update'];

interface CategoryManagerProps {
  productId: string;
  categories: CustomizationGroup[];
  onCategoriesChange: (categories: CustomizationGroup[]) => void;
}

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

export function CategoryManager({ productId, categories, onCategoriesChange }: CategoryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryRequired, setNewCategoryRequired] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const result = await createCustomizationGroup({
        product_id: productId,
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || null,
        is_required: newCategoryRequired,
      });

      if (result.data) {
        onCategoriesChange([...categories, result.data]);
        // Reset form
        setNewCategoryName("");
        setNewCategoryDescription("");
        setNewCategoryRequired(false);
        setIsAddingNew(false);
      } else {
        console.error("Failed to create category:", result.error);
      }
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleUpdateCategory = async (id: string, updates: UpdateCustomizationGroup) => {
    try {
      const result = await updateCustomizationGroup(id, updates);
      if (result.data) {
        onCategoriesChange(categories.map(cat => cat.id === id ? result.data! : cat));
        setEditingId(null);
      } else {
        console.error("Failed to update category:", result.error);
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? This will also delete all options within it.")) {
      return;
    }

    try {
      const result = await deleteCustomizationGroup(id);
      if (!result.error) {
        onCategoriesChange(categories.filter(cat => cat.id !== id));
      } else {
        console.error("Failed to delete category:", result.error);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Customization Categories</h3>
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: PURPLE }}
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Existing Categories */}
      {categories.map((category, index) => (
        <div
          key={category.id}
          className="rounded-xl border p-4 transition-shadow hover:shadow-md"
          style={{ borderColor: `${PURPLE}22`, backgroundColor: "#FAFBFF" }}
        >
          {editingId === category.id ? (
            // Edit mode
            <div className="space-y-3">
              <input
                type="text"
                value={category.name}
                onChange={(e) => handleUpdateCategory(category.id, { name: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: `${PURPLE}44` }}
                placeholder="Category name"
              />
              <textarea
                value={category.description || ""}
                onChange={(e) => handleUpdateCategory(category.id, { description: e.target.value || null })}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                style={{ borderColor: `${PURPLE}44` }}
                placeholder="Category description (optional)"
                rows={2}
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={category.is_required}
                    onChange={(e) => handleUpdateCategory(category.id, { is_required: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  Required category
                </label>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingId(null)}
                  className="rounded-lg px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="rounded-lg px-3 py-1 text-sm font-medium text-white"
                  style={{ backgroundColor: PURPLE }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            // View mode
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <h4 className="font-semibold text-gray-900">{category.name}</h4>
                  {category.is_required && (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: `${GOLD}20`, color: GOLD }}
                    >
                      Required
                    </span>
                  )}
                </div>
                {category.description && (
                  <p className="mt-1 text-sm text-gray-600">{category.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingId(category.id)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  title="Edit category"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Delete category"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add New Category Form */}
      {isAddingNew && (
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: `${GOLD}44`, backgroundColor: `${GOLD}05` }}
        >
          <div className="space-y-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: `${PURPLE}44` }}
              placeholder="Category name (e.g., Doors, Windows, Flooring)"
              autoFocus
            />
            <textarea
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: `${PURPLE}44` }}
              placeholder="Category description (optional)"
              rows={2}
            />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={newCategoryRequired}
                  onChange={(e) => setNewCategoryRequired(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Required category
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setNewCategoryName("");
                  setNewCategoryDescription("");
                  setNewCategoryRequired(false);
                }}
                className="rounded-lg px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="rounded-lg px-3 py-1 text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: PURPLE }}
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {categories.length === 0 && !isAddingNew && (
        <div className="rounded-xl border-2 border-dashed p-8 text-center" style={{ borderColor: `${PURPLE}22` }}>
          <Settings className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customization categories yet</h3>
          <p className="text-sm text-gray-600 mb-4">
            Add categories like "Doors", "Windows", or "Flooring" to start building your customization options.
          </p>
          <button
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: PURPLE }}
          >
            <Plus className="h-4 w-4" />
            Add Your First Category
          </button>
        </div>
      )}
    </div>
  );
}
