"use client";

import { useState } from "react";
import { Check, Info } from "lucide-react";
import type { CustomizationGroupWithRelations, CustomizationOption } from "@/types";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

interface Props {
  groups: CustomizationGroupWithRelations[];
  onSelectionChange: (selections: Record<string, CustomizationOption>) => void;
}

export function ProductCustomizer({ groups, onSelectionChange }: Props) {
  const [selections, setSelections] = useState<Record<string, CustomizationOption>>({});

  const handleSelect = (groupId: string, option: CustomizationOption) => {
    const isCurrentlySelected = selections[groupId]?.id === option.id;
    const newSelections = { ...selections };
    
    if (isCurrentlySelected) {
      delete newSelections[groupId];
    } else {
      newSelections[groupId] = option;
    }
    
    setSelections(newSelections);
    onSelectionChange(newSelections);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {groups.map((group, idx) => (
        <div key={group.id} className="group/category">
          <div className="flex items-center gap-3 mb-5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-white shadow-lg" style={{ backgroundColor: PURPLE }}>
              {(group.display_order ?? idx) + 1}
            </span>
            <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase">{group.name}</h3>
            {group.description && (
              <div className="relative group/info">
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-lg bg-gray-900 p-2 text-[10px] text-white opacity-0 transition-opacity group-hover/info:opacity-100 pointer-events-none z-20">
                  {group.description}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {group.options.map((option) => {
              const isSelected = selections[group.id]?.id === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(group.id, option)}
                  className="group relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 active:scale-[0.98] text-left"
                  style={{ 
                    borderColor: isSelected ? GOLD : "#E5E7EB",
                    backgroundColor: isSelected ? `${PURPLE}08` : "white",
                    boxShadow: isSelected ? `0 4px 20px ${PURPLE}15` : "none"
                  }}
                >
                  {/* Image Frame */}
                  <div 
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2"
                    style={{ borderColor: isSelected ? GOLD : "#F3F4F6" }}
                  >
                    {option.image_url ? (
                      <img 
                        src={option.image_url} 
                        alt={option.name} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-300">
                        No Image
                      </div>
                    )}
                    
                    {isSelected && (
                      <div 
                        className="absolute inset-0 bg-black/10 flex items-center justify-center"
                      >
                        <div className="rounded-full p-1 text-white shadow-lg" style={{ backgroundColor: PURPLE }}>
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info Row */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className={`text-base font-black tracking-tight transition-colors ${isSelected ? "text-purple-900" : "text-gray-900"}`}>
                          {option.name}
                        </h4>
                        {option.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 font-medium">
                            {option.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-black" style={{ color: PURPLE }}>
                            +${option.price_modifier.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Additional Cost</span>
                        </div>
                        
                        <div 
                          className={`hidden sm:flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${isSelected ? "bg-purple-700 border-purple-700" : "bg-transparent border-gray-200"}`}
                          style={{ 
                            backgroundColor: isSelected ? PURPLE : "transparent",
                            borderColor: isSelected ? PURPLE : "#E5E7EB"
                          }}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Hover Highlight */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none border-2 border-transparent transition-opacity"
                    style={{ borderColor: `${PURPLE}22` }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {groups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-gray-50 p-6">
            <Info className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Customizations Available</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">This product doesn't have any specific customization options yet.</p>
        </div>
      )}
    </div>
  );
}
