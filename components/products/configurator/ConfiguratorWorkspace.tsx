'use client';

import React, { useState, useMemo } from 'react';
import HouseViewer from './HouseViewer';
import { HouseConfiguratorSettings, HouseAnchor, AllowedProduct } from '@/types/configurator';
import { ProductWithRelations } from '@/app/actions/products';
import { 
  ChevronRight, 
  Info, 
  ShoppingCart, 
  ArrowLeft,
  CheckCircle2,
  Package,
  Layers,
  DoorOpen,
  Wind
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { saveConfiguration } from '@/app/actions/configurator';
import { addCartItem } from '@/app/actions/cart';
import { useRouter } from 'next/navigation';

interface Props {
  product: ProductWithRelations;
  configurator: any; // Using 'any' for the combined type for now
}

export default function ConfiguratorWorkspace({ product, configurator }: Props) {
  // Initialize selections with default products if available
  const [selections, setSelections] = useState<Record<string, AllowedProduct>>(() => {
    const initial: Record<string, AllowedProduct> = {};
    configurator.anchors.forEach((anchor: any) => {
      const defaultProd = anchor.allowedProducts.find((p: any) => p.is_default);
      if (defaultProd) {
        initial[anchor.id] = defaultProd;
      }
    });
    return initial;
  });

  const [activeAnchorId, setActiveAnchorId] = useState<string | null>(
    configurator.anchors[0]?.id || null
  );
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Calculate Total Price
  const totalPrice = useMemo(() => {
    const optionsTotal = Object.values(selections).reduce(
      (sum, sel) => sum + (Number(sel.product?.price) || 0), 
      0
    );
    return Number(product.price) + optionsTotal;
  }, [product.price, selections]);

  // Map selections to image URLs for the HouseViewer
  const viewerOptions = useMemo(() => {
    const options: Record<string, string> = {};
    Object.entries(selections).forEach(([anchorId, selection]) => {
      options[anchorId] = (selection.product as any).image_url || '';
    });
    return options;
  }, [selections]);

  const handleAddToQuote = async () => {
    setIsSaving(true);
    try {
      // Map selections to just product IDs for the DB
      const selectionIds: Record<string, string> = {};
      Object.entries(selections).forEach(([anchorId, sel]) => {
        selectionIds[anchorId] = sel.product_id;
      });

      const { data, error } = await saveConfiguration({
        productId: product.id,
        selections: selectionIds,
        totalPrice: totalPrice
      });

      if (error) throw error;

      // Add configured product to the user's cart in DB
      const { error: cartError } = await addCartItem(
        product.id,
        null, // variantCode
        (product as any).images?.[0]?.url || null, // variantImageUrl
        1, // quantity
        undefined, // customizations
        data.id // configurationId
      );

      if (cartError) throw new Error(cartError);

      alert('Configuration added to your cart!');
      router.push('/cart');
    } catch (error: any) {
      alert(error.message || 'Error saving configuration. Please ensure you are logged in.');
    } finally {
      setIsSaving(false);
    }
  };

  const activeAnchor = configurator.anchors.find((a: any) => a.id === activeAnchorId);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* 1. Sidebar - Options Selection */}
      <div className="w-[400px] border-r bg-white flex flex-col z-50 shadow-xl">
        <div className="p-6 border-b">
          <Link 
            href={`/products/${product.slug}`}
            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to product
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="font-mono">Configurable</Badge>
            <span className="text-sm text-muted-foreground">Premium Prefab</span>
          </div>
        </div>

        {/* Step Selector (Anchors) */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-4">
              Select Component
            </label>
            <div className="grid grid-cols-3 gap-2">
              {configurator.anchors.map((anchor: any) => (
                <button
                  key={anchor.id}
                  onClick={() => setActiveAnchorId(anchor.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1.5 ${
                    activeAnchorId === anchor.id 
                      ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                      : 'border-transparent hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {anchor.anchor_type === 'door' && <DoorOpen className="h-5 w-5" />}
                  {anchor.anchor_type === 'window' && <Wind className="h-5 w-5" />}
                  {anchor.anchor_type === 'wall-mask' && <Package className="h-5 w-5" />}
                  <span className="text-[10px] font-bold uppercase truncate w-full text-center">
                    {anchor.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {activeAnchor && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{activeAnchor.label} Options</h3>
                <span className="text-xs text-muted-foreground">{activeAnchor.allowedProducts.length} Available</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {activeAnchor.allowedProducts.map((ap: any) => {
                  const isSelected = selections[activeAnchor.id]?.id === ap.id;
                  return (
                    <div
                      key={ap.id}
                      onClick={() => setSelections({...selections, [activeAnchor.id]: ap})}
                      className={`group relative flex items-center p-3 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md ${
                        isSelected 
                          ? 'border-primary bg-primary/[0.02]' 
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="w-20 h-20 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                        <img 
                          src={ap.product.image_url} 
                          alt={ap.product.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-900">{ap.product.name}</h4>
                          {isSelected && <CheckCircle2 className="h-5 w-5 text-primary animate-in zoom-in" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          Ref: {ap.product.id.split('-')[0]}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-bold text-primary">${ap.product.price.toLocaleString()}</span>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] opacity-0 group-hover:opacity-100">
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom - Pricing & Actions */}
        <div className="p-6 border-t bg-slate-50/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Estimated Total</p>
              <p className="text-3xl font-black tracking-tight text-slate-900">
                ${totalPrice.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                In Stock
              </Badge>
              <p className="text-[10px] text-muted-foreground mt-1">Excl. Shipping & Tax</p>
            </div>
          </div>
          <Button 
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
            onClick={handleAddToQuote}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Quote
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 2. Main Viewport - The Realism-First Engine */}
      <div className="flex-1 bg-slate-100 relative">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="w-full max-w-6xl relative group">
            <HouseViewer 
              settings={configurator} 
              selectedOptions={viewerOptions}
              className="rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] ring-1 ring-black/5"
              onAnchorClick={(anchor) => setActiveAnchorId(anchor.id!)}
            />
            
            {/* Visual HUD */}
            <div className="absolute top-6 left-6 flex items-center gap-3">
              <div className="bg-white/90 backdrop-blur border px-4 py-2 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-700">Real-time Visualization Active</span>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur border p-4 rounded-[24px] shadow-xl max-w-xs animate-in fade-in slide-in-from-bottom-4">
              <p className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Configuration Note
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                All components are standard-sized for this model. Final installation may require localized reinforcement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
