"use client";

import { useState, useEffect } from "react";
import { Settings, Package, DollarSign, AlertCircle, Check } from "lucide-react";
import { CategoryPanel } from "./CategoryPanel";
import type { Database } from "@/types/database";

type CustomizationGroup = Database['public']['Tables']['product_customization_groups']['Row'];
type CustomizationOption = Database['public']['Tables']['product_customization_options']['Row'];

interface VisualBuilderProps {
  categories: (CustomizationGroup & { options: CustomizationOption[] })[];
  basePrice: number;
  onSelectionChange?: (selections: Record<string, string>, totalPrice: number) => void;
  disabled?: boolean;
}

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

interface SelectionState {
  [categoryId: string]: string; // categoryId -> optionId
}

export function VisualBuilder({ 
  categories, 
  basePrice, 
  onSelectionChange, 
  disabled = false 
}: VisualBuilderProps) {
  const [selections, setSelections] = useState<SelectionState>({});
  const [totalPrice, setTotalPrice] = useState(basePrice);

  // Calculate total price whenever selections change
  useEffect(() => {
    let priceModifier = 0;
    
    Object.entries(selections).forEach(([categoryId, optionId]) => {
      const category = categories.find(cat => cat.id === categoryId);
      const option = category?.options.find(opt => opt.id === optionId);
      if (option) {
        priceModifier += option.price_modifier;
      }
    });

    const newTotalPrice = basePrice + priceModifier;
    setTotalPrice(newTotalPrice);
    
    // Notify parent of changes
    if (onSelectionChange) {
      onSelectionChange(selections, newTotalPrice);
    }
  }, [selections, categories, basePrice, onSelectionChange]);

  const handleOptionSelect = (categoryId: string, optionId: string) => {
    setSelections(prev => ({
      ...prev,
      [categoryId]: optionId
    }));
  };

  const handleOptionRemove = (categoryId: string) => {
    setSelections(prev => {
      const newSelections = { ...prev };
      delete newSelections[categoryId];
      return newSelections;
    });
  };

  // Validate required categories
  const getValidationStatus = () => {
    const requiredCategories = categories.filter(cat => cat.is_required);
    const missingRequired = requiredCategories.filter(cat => !selections[cat.id]);
    
    return {
      isValid: missingRequired.length === 0,
      missingRequired,
      totalRequired: requiredCategories.length,
      selectedRequired: requiredCategories.filter(cat => selections[cat.id]).length
    };
  };

  const validation = getValidationStatus();
  const hasSelections = Object.keys(selections).length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${PURPLE}15` }}>
          <Settings className="h-4 w-4" style={{ color: PURPLE }} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Customize Your Product</h3>
          <p className="text-sm text-gray-600">
            Select options to customize your product to your exact needs
          </p>
        </div>
      </div>

      {/* Categories */}
      {categories.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-8 text-center" style={{ borderColor: `${PURPLE}22` }}>
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Customization Options</h3>
          <p className="text-sm text-gray-600">
            This product doesn't have any customization options available.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <CategoryPanel
              key={category.id}
              category={category}
              selectedOptionId={selections[category.id] || null}
              onOptionSelect={(optionId) => handleOptionSelect(category.id, optionId)}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Price Summary */}
      <div
        className="rounded-xl p-4 border"
        style={{ borderColor: `${GOLD}44`, backgroundColor: `${GOLD}05` }}
      >
        <h4 className="font-semibold text-gray-900 mb-3">Price Summary</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Base Price:</span>
            <span className="font-medium">${basePrice.toFixed(2)}</span>
          </div>
          
          {Object.entries(selections).map(([categoryId, optionId]) => {
            const category = categories.find(cat => cat.id === categoryId);
            const option = category?.options.find(opt => opt.id === optionId);
            
            if (!option || option.price_modifier === 0) return null;
            
            return (
              <div key={categoryId} className="flex justify-between text-sm">
                <span className="text-gray-600">{option.name}:</span>
                <span className="font-medium text-green-600">
                  +${option.price_modifier.toFixed(2)}
                </span>
              </div>
            );
          })}
          
          <div className="border-t pt-2 mt-2" style={{ borderColor: `${GOLD}44` }}>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total Price:</span>
              <span className="font-bold text-lg" style={{ color: GOLD }}>
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Options Summary */}
      {hasSelections && (
        <div className="rounded-xl p-4 border" style={{ borderColor: `${PURPLE}22`, backgroundColor: '#FAFBFF' }}>
          <h4 className="font-semibold text-gray-900 mb-3">Your Selections</h4>
          
          <div className="space-y-2">
            {Object.entries(selections).map(([categoryId, optionId]) => {
              const category = categories.find(cat => cat.id === categoryId);
              const option = category?.options.find(opt => opt.id === optionId);
              
              if (!option) return null;
              
              return (
                <div key={categoryId} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white border" style={{ borderColor: `${PURPLE}22` }}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: GOLD }}></div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{option.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({category?.name})</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {option.price_modifier !== 0 && (
                      <span className="text-sm font-medium text-green-600">
                        +${option.price_modifier.toFixed(2)}
                      </span>
                    )}
                    {!disabled && (
                      <button
                        onClick={() => handleOptionRemove(categoryId)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Validation Status */}
      {!validation.isValid && (
        <div className="rounded-xl p-4 border border-red-200 bg-red-50">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900">Required Selections Missing</h4>
              <p className="text-sm text-red-700 mt-1">
                Please select an option for the following required categories:
              </p>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {validation.missingRequired.map((category) => (
                  <li key={category.id}>{category.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Success Status */}
      {validation.isValid && hasSelections && (
        <div className="rounded-xl p-4 border border-green-200 bg-green-50">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-green-900">Customization Complete</h4>
              <p className="text-sm text-green-700 mt-1">
                Your product is fully configured with {Object.keys(selections).length} customization{Object.keys(selections).length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
