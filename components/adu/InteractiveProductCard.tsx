"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { ArrowRight, Tag, ExternalLink, Loader2 } from "lucide-react";

interface ProductCardProps {
  slug: string;
}

const CP_PURPLE = "#4B1D8F";
const CP_GOLD = "#D4AF37";

export function InteractiveProductCard({ slug }: ProductCardProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createBrowserClient();
      
      // Fetch product details and its first image
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, name, price, slug,
          product_images (url)
        `)
        .eq("slug", slug)
        .single();

      if (data) {
        setProduct(data);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 animate-pulse">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!product) return null;

  const imageUrl = product.product_images?.[0]?.url || "/placeholder-product.jpg";

  return (
    <div className="my-6 group animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link 
        href={`/products/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white border-2 rounded-[40px] overflow-hidden shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1"
        style={{ borderColor: `${CP_PURPLE}15` }}
      >
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="w-full md:w-1/3 aspect-square relative overflow-hidden bg-gray-100">
            <img 
              src={imageUrl} 
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest shadow-sm" style={{ color: CP_PURPLE }}>
              Prefab Model
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 p-8 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-[1000] text-black tracking-tighter leading-none">{product.name}</h3>
                <ExternalLink className="w-5 h-5 text-gray-200 group-hover:text-black transition-colors" />
              </div>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Apex Modular Construction Engineered Modular Unit</p>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Master Price</span>
                <div className="text-2xl font-[1000] text-black">
                  ${product.price?.toLocaleString()} <span className="text-xs text-gray-400">CAD</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 px-6 py-3 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-xl transition-all group-hover:scale-105" style={{ backgroundColor: CP_PURPLE }}>
                <span>View Details</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
