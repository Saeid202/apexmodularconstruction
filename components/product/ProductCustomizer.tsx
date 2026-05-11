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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {group.options.map((option) => {
              const isSelected = selections[group.id]?.id === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(group.id, option)}
                  className="group relative flex flex-col items-stretch text-left transition-all duration-300 active:scale-95"
                >
                  <div 
                    className="relative aspect-square overflow-hidden rounded-2xl border-2 transition-all duration-300 group-hover:shadow-xl"
                    style={{ 
                      borderColor: isSelected ? GOLD : "#f3f4f6",
                      boxShadow: isSelected ? `0 0 20px ${GOLD}33` : "none",
                      transform: isSelected ? "scale(1.02)" : "scale(1)"
                    }}
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
                    
                    {/* Selection Indicator */}
                    <div 
                      className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300"
                      style={{ opacity: isSelected ? 1 : 0 }}
                    />
                    
                    {isSelected && (
                      <div 
                        className="absolute right-2 top-2 rounded-full p-1 text-white shadow-lg"
                        style={{ backgroundColor: PURPLE }}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}

                    {/* Price Tag Overlay */}
                    {option.price_modifier > 0 && (
                      <div className="absolute bottom-2 left-2 rounded-lg bg-white/95 px-2 py-1 text-[10px] font-black shadow-sm" style={{ color: PURPLE }}>
                        +${option.price_modifier.toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 px-1">
                    <p className={`text-xs font-black transition-colors ${isSelected ? "text-purple-900" : "text-gray-700"}`}>
                      {option.name}
                    </p>
                    {option.description && (
                      <p className="mt-0.5 text-[9px] leading-tight text-gray-400 line-clamp-2">
                        {option.description}
                      </p>
                    )}
                  </div>
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
