'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { HouseAnchor, AnchorType } from '@/types/configurator';
import { 
  Save, 
  Trash2, 
  Square, 
  MousePointer2, 
  Layers, 
  DoorOpen, 
  Wind, 
  PaintBucket,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';

interface Props {
  product: { id: string; name: string };
  initialSettings: any;
  mainImage: string;
}

export default function CalibrationTool({ product, initialSettings, mainImage }: Props) {
  const [anchors, setAnchors] = useState<HouseAnchor[]>(initialSettings?.anchors || []);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createBrowserClient();

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    // Only draw if we're not clicking an existing anchor
    if ((e.target as HTMLElement).closest('.anchor-box')) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentPos({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCurrentPos({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Calculate dimensions
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    // Only add if it's big enough
    if (width > 1 && height > 1) {
      const newAnchor: HouseAnchor = {
        house_id: initialSettings?.id || '',
        anchor_type: 'door',
        label: `New Anchor ${anchors.length + 1}`,
        x_pos: x,
        y_pos: y,
        width,
        height,
        z_index: 10
      };
      setAnchors([...anchors, newAnchor]);
      setSelectedId(anchors.length);
    }
  };

  const updateAnchor = (index: number, updates: Partial<HouseAnchor>) => {
    const newAnchors = [...anchors];
    newAnchors[index] = { ...newAnchors[index], ...updates };
    setAnchors(newAnchors);
  };

  const deleteAnchor = (index: number) => {
    setAnchors(anchors.filter((_, i) => i !== index));
    setSelectedId(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let settingsId = initialSettings?.id;

      // 1. Ensure settings exist
      if (!settingsId) {
        const { data: newSettings, error: sError } = await supabase
          .from('house_configurator_settings')
          .insert({
            product_id: product.id,
            base_image_url: mainImage,
            lighting_metadata: { sun_direction: 'top-left', ambient: 'balanced' }
          })
          .select()
          .single();
        
        if (sError) throw sError;
        settingsId = newSettings.id;
      }

      // 2. Clear old anchors and insert new ones
      // In a real app, we might want to reconcile, but for a tool, clear & replace is safer for V1
      const { error: dError } = await supabase
        .from('house_anchors')
        .delete()
        .eq('house_id', settingsId);
      
      if (dError) throw dError;

      const anchorsToInsert = anchors.map(a => ({
        ...a,
        house_id: settingsId
      }));

      if (anchorsToInsert.length > 0) {
        const { error: iError } = await supabase
          .from('house_anchors')
          .insert(anchorsToInsert);
        if (iError) throw iError;
      }

      alert('Calibration saved successfully!');
    } catch (error: any) {
      console.error(error);
      alert('Error saving calibration: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar - Controls */}
      <div className="w-80 border-r bg-background flex flex-col p-4 gap-6 overflow-y-auto">
        <div className="flex items-center gap-2">
          <Link href="/admin/configurator/calibrate">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="font-bold truncate">{product.name}</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase text-muted-foreground font-bold">Anchors</Label>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{anchors.length}</span>
          </div>
          
          <div className="space-y-2">
            {anchors.map((anchor, i) => (
              <div 
                key={i}
                onClick={() => setSelectedId(i)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                  selectedId === i ? 'border-primary ring-1 ring-primary' : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {anchor.anchor_type === 'door' && <DoorOpen className="h-4 w-4 text-blue-500" />}
                  {anchor.anchor_type === 'window' && <Wind className="h-4 w-4 text-cyan-500" />}
                  {anchor.anchor_type === 'wall-mask' && <PaintBucket className="h-4 w-4 text-orange-500" />}
                  <span className="text-sm font-medium truncate">{anchor.label}</span>
                </div>
                <Trash2 
                  className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" 
                  onClick={(e) => { e.stopPropagation(); deleteAnchor(i); }}
                />
              </div>
            ))}
            {anchors.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <MousePointer2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs">Click and drag on the image to create an anchor.</p>
              </div>
            )}
          </div>
        </div>

        {selectedId !== null && anchors[selectedId] && (
          <div className="space-y-4 pt-6 border-t animate-in fade-in slide-in-from-bottom-2">
            <Label className="text-xs uppercase text-muted-foreground font-bold">Anchor Settings</Label>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="label">Label</Label>
                <Input 
                  id="label"
                  value={anchors[selectedId].label}
                  onChange={(e) => updateAnchor(selectedId, { label: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={anchors[selectedId].anchor_type}
                  onValueChange={(val: AnchorType) => updateAnchor(selectedId, { anchor_type: val })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="door">Door</SelectItem>
                    <SelectItem value="window">Window</SelectItem>
                    <SelectItem value="wall-mask">Wall Mask</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {anchors[selectedId].anchor_type === 'wall-mask' && (
                <div className="space-y-1.5">
                  <Label htmlFor="mask_url">Mask URL (PNG)</Label>
                  <Input 
                    id="mask_url"
                    value={anchors[selectedId].mask_url || ''}
                    placeholder="https://.../wall-mask.png"
                    onChange={(e) => updateAnchor(selectedId, { mask_url: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="z_index">Z-Index</Label>
                <Input 
                  id="z_index"
                  type="number"
                  value={anchors[selectedId].z_index}
                  onChange={(e) => updateAnchor(selectedId, { z_index: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 border-t">
          <Button className="w-full" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Configuration
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Area - Canvas */}
      <div className="flex-1 bg-muted relative overflow-hidden flex items-center justify-center p-8">
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="relative bg-white shadow-2xl overflow-hidden cursor-crosshair select-none max-w-full max-h-full aspect-[16/9]"
          style={{ backgroundImage: `url(${mainImage})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}
        >
          {/* Overlay Image - using an img tag inside to ensure it scales correctly */}
          <img 
            src={mainImage} 
            alt="Calibration" 
            className="w-full h-full object-contain pointer-events-none" 
          />

          {/* Existing Anchors */}
          {anchors.map((anchor, i) => (
            <div
              key={i}
              className={`absolute border-2 anchor-box transition-all ${
                selectedId === i 
                  ? 'border-primary bg-primary/20 z-50 shadow-lg' 
                  : 'border-blue-500/50 bg-blue-500/10 hover:border-blue-500'
              }`}
              style={{
                left: `${anchor.x_pos}%`,
                top: `${anchor.y_pos}%`,
                width: `${anchor.width}%`,
                height: `${anchor.height}%`,
                zIndex: anchor.z_index
              }}
              onClick={() => setSelectedId(i)}
            >
              <div className="absolute -top-6 left-0 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm whitespace-nowrap">
                {anchor.anchor_type === 'door' && <DoorOpen className="h-3 w-3" />}
                {anchor.anchor_type === 'window' && <Wind className="h-3 w-3" />}
                {anchor.label}
              </div>
            </div>
          ))}

          {/* Drawing Preview */}
          {isDrawing && (
            <div 
              className="absolute border-2 border-dashed border-primary bg-primary/10 z-[100]"
              style={{
                left: `${Math.min(startPos.x, currentPos.x)}%`,
                top: `${Math.min(startPos.y, currentPos.y)}%`,
                width: `${Math.abs(currentPos.x - startPos.x)}%`,
                height: `${Math.abs(currentPos.y - startPos.y)}%`
              }}
            />
          )}
        </div>

        {/* Instructions Overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur px-4 py-2 rounded-full border shadow-sm text-xs flex items-center gap-4">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded border">Click + Drag</kbd>
            <span>Create Anchor</span>
          </div>
          <div className="w-px h-3 bg-muted" />
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded border">Click</kbd>
            <span>Select/Edit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
