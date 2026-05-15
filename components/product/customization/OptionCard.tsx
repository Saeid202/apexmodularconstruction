"use client";

import { useState } from "react";
import { Check, Image as ImageIcon, Package, DollarSign, AlertCircle } from "lucide-react";
import type { Database } from "@/types/database";

type CustomizationOption = Database['public']['Tables']['product_customization_options']['Row'];

interface OptionCardProps {
  option: CustomizationOption;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

export function OptionCard({ option, isSelected, onSelect, disabled = false }: OptionCardProps) {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get all images for this option
  const allImages = option.image_url 
    ? [option.image_url, ...(option.additional_images || [])]
    : (option.additional_images || []);

  const currentImage = allImages[currentImageIndex] || null;

  const hasMultipleImages = allImages.length > 1;
  const isOutOfStock = option.track_inventory && option.stock_quantity !== null && option.stock_quantity <= 0;

  const handleSelect = () => {
    if (!disabled && !isOutOfStock) {
      onSelect();
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div
      className={`
        relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'border-2 shadow-lg' 
          : 'border-2 hover:shadow-md'
        }
        ${disabled || isOutOfStock ? 'opacity-60 cursor-not-allowed' : ''}
      `}
      style={{
        borderColor: isSelected 
          ? GOLD 
          : (disabled || isOutOfStock) 
            ? '#E5E7EB' 
            : `${PURPLE}22`,
        backgroundColor: isSelected 
          ? `${GOLD}10` 
          : (disabled || isOutOfStock)
            ? '#F9FAFB'
            : 'white'
      }}
      onClick={handleSelect}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div 
            className="h-6 w-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: GOLD }}
          >
            <Check className="h-4 w-4 text-white" />
          </div>
        </div>
      )}

      {/* Out of stock indicator */}
      {isOutOfStock && (
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Out of Stock</span>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {/* Image Section */}
        <div className="relative">
          <div className="w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0" 
               style={{ borderColor: `${PURPLE}22` }}>
            {currentImage && !imageError ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentImage}
                  alt={option.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
                
                {/* Image navigation for multiple images */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white p-1 opacity-0 hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white p-1 opacity-0 hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    
                    {/* Image counter */}
                    <div className="absolute bottom-1 right-1 rounded-full bg-black/50 text-white px-1.5 py-0.5 text-xs">
                      {currentImageIndex + 1}/{allImages.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{option.name}</h4>
              
              {option.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{option.description}</p>
              )}

              {/* Price modifier */}
              {option.price_modifier !== 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <DollarSign className="h-3 w-3 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    {option.price_modifier > 0 ? '+' : ''}${option.price_modifier.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Stock information */}
              {option.track_inventory && (
                <div className="flex items-center gap-1 mt-1">
                  <Package className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    {option.stock_quantity !== null 
                      ? `${option.stock_quantity} available`
                      : 'Unlimited stock'
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      {!disabled && !isOutOfStock && (
        <div className="absolute inset-0 rounded-lg border-2 pointer-events-none transition-opacity duration-200 opacity-0 hover:opacity-100"
             style={{ borderColor: GOLD, backgroundColor: `${GOLD}10` }}>
        </div>
      )}
    </div>
  );
}
