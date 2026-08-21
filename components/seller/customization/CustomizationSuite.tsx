"use client";

import { useState, useEffect } from "react";
import { Settings, ToggleLeft, ToggleRight } from "lucide-react";
import { CategoryManager } from "./CategoryManager";
import { OptionManager } from "./OptionManager";
import { getCustomizationGroups } from "@/app/actions/customization";
import type { Database } from "@/types/database";

type CustomizationGroup = Database['public']['Tables']['product_customization_groups']['Row'];
type CustomizationOption = Database['public']['Tables']['product_customization_options']['Row'];

interface CustomizationSuiteProps {
  productId: string;
  userId: string;
  initialEnabled?: boolean;
}

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

export function CustomizationSuite({ productId, userId, initialEnabled = false }: CustomizationSuiteProps) {
  // TEMPORARILY DISABLED FOR DEBUGGING
  return (
    <div className="rounded-xl border-2 border-dashed border-red-300 bg-red-50 p-8 text-center">
      <Settings className="mx-auto h-12 w-12 text-red-400 mb-3" />
      <h3 className="text-lg font-medium text-red-900 mb-2">Customization Suite Temporarily Disabled</h3>
      <p className="text-sm text-red-600">
        This component has been temporarily disabled for debugging purposes.
      </p>
    </div>
  );

  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [categories, setCategories] = useState<(CustomizationGroup & { options: CustomizationOption[] })[]>([]);
  const [loading, setLoading] = useState(false);

  // Load customization data when enabled
  useEffect(() => {
    if (isEnabled) {
      loadCustomizationData();
    } else {
      setCategories([]);
    }
  }, [isEnabled, productId]);

  const loadCustomizationData = async () => {
    setLoading(true);
    try {
      const result = await getCustomizationGroups(productId);
      if (result.data) {
        setCategories(result.data);
      } else {
        console.error("Failed to load customization data:", result.error);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error loading customization data:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoriesChange = (updatedCategories: CustomizationGroup[]) => {
    // Update categories and reload full data to get options
    // Convert to the expected type temporarily, then reload
    setCategories(updatedCategories.map(cat => ({ ...cat, options: [] })));
    loadCustomizationData();
  };

  const handleOptionsChange = (categoryId: string, updatedOptions: CustomizationOption[]) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, options: updatedOptions }
          : cat
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "#EDE9F6" }}>
            <Settings className="h-4 w-4" style={{ color: PURPLE }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Customization Suite</h3>
            <p className="text-sm text-gray-600">
              Allow buyers to select custom doors, windows, flooring, etc. (Like toppings on a pizza!)
            </p>
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => setIsEnabled(!isEnabled)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor: isEnabled ? `${PURPLE}15` : "#F3F4F6",
            color: isEnabled ? PURPLE : "#6B7280",
            border: `2px solid ${isEnabled ? PURPLE : "#E5E7EB"}`,
          }}
        >
          {isEnabled ? (
            <>
              <ToggleRight className="h-4 w-4" />
              Enabled
            </>
          ) : (
            <>
              <ToggleLeft className="h-4 w-4" />
              Disabled
            </>
          )}
        </button>
      </div>

      {/* Customization Content */}
      {isEnabled && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full"></div>
              <span className="ml-2 text-sm text-gray-600">Loading customization data...</span>
            </div>
          ) : (
            <>
              {/* Categories Management */}
              <CategoryManager
                productId={productId}
                categories={categories}
                onCategoriesChange={handleCategoriesChange}
              />

              {/* Options Management for each category */}
              {categories.map((category) => (
                <div key={category.id} className="border-t pt-6" style={{ borderColor: `${PURPLE}22` }}>
                  <OptionManager
                    categoryId={category.id}
                    categoryName={category.name}
                    options={category.options || []}
                    onOptionsChange={(options) => handleOptionsChange(category.id, options)}
                    userId={userId}
                  />
                </div>
              ))}

              {/* Summary */}
              {categories.length > 0 && (
                <div
                  className="rounded-xl p-4 border"
                  style={{ borderColor: `${GOLD}44`, backgroundColor: `${GOLD}05` }}
                >
                  <h4 className="font-semibold text-gray-900 mb-3">Customization Summary</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Categories:</span>
                      <span className="ml-2 font-medium">{categories.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Options:</span>
                      <span className="ml-2 font-medium">
                        {categories.reduce((total, cat) => total + (cat.options?.length || 0), 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Required Categories:</span>
                      <span className="ml-2 font-medium">
                        {categories.filter(cat => cat.is_required).length}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Categories with Images:</span>
                      <span className="ml-2 font-medium">
                        {categories.filter(cat => 
                          cat.options?.some(opt => opt.image_url || opt.additional_images?.length)
                        ).length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Disabled State */}
      {!isEnabled && (
        <div
          className="rounded-xl border-2 border-dashed p-8 text-center"
          style={{ borderColor: `${PURPLE}22` }}
        >
          <Settings className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Customization Suite Disabled</h3>
          <p className="text-sm text-gray-600 mb-4">
            Enable the customization suite to allow buyers to customize your products with different options.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Create unlimited categories (Doors, Windows, Flooring, etc.)</p>
            <p>• Add multiple options per category with images</p>
            <p>• Set price modifiers and track inventory</p>
            <p>• Customers use visual builder to select options</p>
          </div>
        </div>
      )}
    </div>
  );
}
