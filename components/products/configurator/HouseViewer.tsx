'use client';

import React, { useMemo } from 'react';
import { HouseConfiguratorSettings, HouseAnchor } from '@/types/configurator';
import { cn } from '@/lib/utils';

interface HouseViewerProps {
  settings: HouseConfiguratorSettings;
  selectedOptions: Record<string, string>; // anchorId -> productId (or image_url)
  className?: string;
  onAnchorClick?: (anchor: HouseAnchor) => void;
}

/**
 * HouseViewer - The "Realism-First" Layered Compositing Engine
 * Renders: Base -> Wall Layers (Masked) -> Windows -> Doors
 */
export default function HouseViewer({ 
  settings, 
  selectedOptions, 
  className,
  onAnchorClick 
}: HouseViewerProps) {
  
  // Categorize anchors for layered rendering
  const layers = useMemo(() => {
    const sorted = [...settings.anchors].sort((a, b) => (a.z_index || 0) - (b.z_index || 0));
    return {
      walls: sorted.filter(a => a.anchor_type === 'wall-mask'),
      windows: sorted.filter(a => a.anchor_type === 'window'),
      doors: sorted.filter(a => a.anchor_type === 'door'),
    };
  }, [settings.anchors]);

  return (
    <div className={cn("relative w-full aspect-[16/9] bg-muted overflow-hidden group", className)}>
      {/* 1. Base Layer (Fixed lighting, environment) */}
      <img 
        src={settings.base_image_url} 
        alt="House Base" 
        className="absolute inset-0 w-full h-full object-contain z-0"
      />

      {/* 2. Wall Layers (Masked Material Overlays) */}
      {layers.walls.map((anchor) => {
        const selectedTexture = selectedOptions[anchor.id!];
        if (!selectedTexture) return null;

        return (
          <div 
            key={anchor.id}
            className="absolute z-10 transition-all duration-500 ease-in-out pointer-events-none"
            style={{
              left: `${anchor.x_pos}%`,
              top: `${anchor.y_pos}%`,
              width: `${anchor.width}%`,
              height: `${anchor.height}%`,
              // Using CSS mask to apply the texture only to the masked area
              // The 'selectedTexture' would be a seamless texture image
              WebkitMaskImage: `url(${anchor.mask_url})`, 
              maskImage: `url(${anchor.mask_url})`,
              WebkitMaskSize: '100% 100%',
              maskSize: '100% 100%',
              backgroundImage: `url(${selectedTexture})`,
              backgroundSize: 'cover',
              backgroundRepeat: 'repeat',
            }}
          />
        );
      })}

      {/* 3. Window Layers (Transparent Overlays with baked-in depth) */}
      {layers.windows.map((anchor) => {
        const selectedAsset = selectedOptions[anchor.id!];
        if (!selectedAsset) return null;

        return (
          <div 
            key={anchor.id}
            className="absolute z-20 transition-all duration-500 ease-in-out cursor-pointer hover:ring-2 hover:ring-primary/50"
            style={{
              left: `${anchor.x_pos}%`,
              top: `${anchor.y_pos}%`,
              width: `${anchor.width}%`,
              height: `${anchor.height}%`,
              zIndex: anchor.z_index
            }}
            onClick={() => onAnchorClick?.(anchor)}
          >
            <img 
              src={selectedAsset} 
              alt={anchor.label} 
              className="w-full h-full object-contain drop-shadow-sm" 
            />
          </div>
        );
      })}

      {/* 4. Door Layers (Transparent Overlays with baked-in depth) */}
      {layers.doors.map((anchor) => {
        const selectedAsset = selectedOptions[anchor.id!];
        if (!selectedAsset) return null;

        return (
          <div 
            key={anchor.id}
            className="absolute z-30 transition-all duration-500 ease-in-out cursor-pointer hover:ring-2 hover:ring-primary/50"
            style={{
              left: `${anchor.x_pos}%`,
              top: `${anchor.y_pos}%`,
              width: `${anchor.width}%`,
              height: `${anchor.height}%`,
              zIndex: anchor.z_index
            }}
            onClick={() => onAnchorClick?.(anchor)}
          >
            <img 
              src={selectedAsset} 
              alt={anchor.label} 
              className="w-full h-full object-contain drop-shadow-md" 
            />
          </div>
        );
      })}

      {/* Lighting/Overlay Hints (Optional - for that premium feel) */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/5 to-transparent z-40 opacity-30" />
    </div>
  );
}
