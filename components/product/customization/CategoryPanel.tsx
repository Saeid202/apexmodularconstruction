"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Package, AlertCircle } from "lucide-react";
import { OptionCard } from "./OptionCard";
import type { Database } from "@/types/database";

type CustomizationGroup = Database['public']['Tables']['product_customization_groups']['Row'];
type CustomizationOption = Database['public']['Tables']['product_customization_options']['Row'];

interface CategoryPanelProps {
  category: CustomizationGroup & { options: CustomizationOption[] };
  selectedOptionId: string | null;
  onOptionSelect: (optionId: string) => void;
  disabled?: boolean;
}

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

export function CategoryPanel({ 
  category, 
  selectedOptionId, 
  onOptionSelect, 
  disabled = false 
}: CategoryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasSelectedOption = selectedOptionId && category.options.some(opt => opt.id === selectedOptionId);
  const selectedOption = category.options.find(opt => opt.id === selectedOptionId);

  return (
    <div className="border rounded-xl overflow-hidden transition-all duration-200" 
         style={{ 
           borderColor: hasSelectedOption ? GOLD : `${PURPLE}22`,
           backgroundColor: hasSelectedOption ? `${GOLD}05` : '#FAFBFF'
         }}>
      {/* Category Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer transition-colors"
        onClick={() => !disabled && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" 
               style={{ backgroundColor: hasSelectedOption ? `${GOLD}20` : `${PURPLE}15` }}>
            <Package className="h-4 w-4" style={{ color: hasSelectedOption ? GOLD : PURPLE }} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
              {category.is_required && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: `${PURPLE}15`, color: PURPLE }}
                >
                  Required
                </span>
              )}
            </div>
            
            {category.description && (
              <p className="text-sm text-gray-600 mt-1">{category.description}</p>
            )}
            
            {/* Selected option display */}
            {selectedOption && (
              <div className="flex items-center gap-2 mt-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: GOLD }}></div>
                <span className="text-sm font-medium" style={{ color: GOLD }}>
                  {selectedOption.name}
                  {selectedOption.price_modifier !== 0 && (
                    <> (+${selectedOption.price_modifier.toFixed(2)})</>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Required category indicator */}
          {category.is_required && !hasSelectedOption && (
            <div className="flex items-center gap-1 text-red-500">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Required</span>
            </div>
          )}
          
          {/* Expand/collapse button */}
          <button
            className="p-1 rounded-lg transition-colors"
            style={{ 
              backgroundColor: isExpanded ? `${PURPLE}15` : 'transparent',
              color: PURPLE 
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Options Content */}
      {isExpanded && (
        <div className="border-t p-4" style={{ borderColor: `${PURPLE}15` }}>
          {category.options.length === 0 ? (
            <div className="text-center py-4">
              <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">No options available</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {category.options.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  isSelected={selectedOptionId === option.id}
                  onSelect={() => !disabled && onOptionSelect(option.id)}
                  disabled={disabled}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
