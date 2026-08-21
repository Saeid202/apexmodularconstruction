"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { 
  CheckCircle2, AlertCircle, Trash2, 
  ChevronRight, Save, Rocket, Loader2,
  Table, LayoutGrid, Filter, Search as SearchIcon, Image as ImageIcon, Upload
} from "lucide-react";

const CP_PURPLE = "#4B1D8F";
const CP_GOLD = "#D4AF37";

export default function IngestionReviewPage() {
  const { batchId } = useParams();
  const [drafts, setDrafts] = useState<any[]>([]);
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createBrowserClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const { data: batchData } = await supabase.from("ingestion_batches").select("*").eq("id", batchId).single();
      const { data: draftData } = await supabase.from("product_drafts").select("*").eq("batch_id", batchId);
      
      setBatch(batchData);
      setDrafts(draftData || []);
      setLoading(false);
    }
    fetchData();
  }, [batchId]);

  const updateDraft = (id: string, field: string, value: any) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const publishAll = async () => {
    setSaving(true);
    try {
      // First save any edits made to the drafts
      for (const draft of drafts) {
        await supabase.from("product_drafts").update({
          name: draft.name,
          price: draft.price,
          category_slug: draft.category_slug
        }).eq("id", draft.id);
      }

      // Then move them to live products
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");
      
      const liveProducts = drafts.map(d => ({
        seller_id: userData.user!.id,
        name: d.name,
        description: d.description || d.ai_metadata?.image_description || '',
        price: d.price || 0,
        category_slug: d.category_slug || 'general',
        main_image_url: d.main_image_url || null,
        specifications: d.specifications || {},
        status: 'published'
      }));

      const { error: insertError } = await supabase.from("products").insert(liveProducts);
      if (insertError) throw insertError;

      // Update batch and draft statuses
      await supabase.from("product_drafts").update({ status: 'published' }).eq("batch_id", batchId);
      await supabase.from("ingestion_batches").update({ status: 'published' }).eq("id", batchId);

      alert(`Successfully published ${drafts.length} products to the live store!`);
      router.push("/seller/products");
    } catch (err: any) {
      console.error(err);
      alert("Failed to publish: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: CP_PURPLE }} />
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Loading Extraction Results...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest text-gray-400">
            <span>Import Center</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-black">Review Board</span>
          </div>
          <h1 className="text-4xl font-[1000] text-black tracking-tighter">
            Reviewing <span style={{ color: CP_PURPLE }}>{batch?.file_name}</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em]">
            {drafts.length} Products Found • {batch?.status === 'completed' ? 'Extraction Ready' : 'Processing...'}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-6 py-3 border-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors">
            <Trash2 className="w-4 h-4" />
            <span>Discard Batch</span>
          </button>
          <button 
            onClick={publishAll}
            disabled={saving || drafts.length === 0}
            className="flex items-center space-x-3 px-10 py-5 rounded-[24px] text-white font-black text-xs tracking-widest uppercase shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
            style={{ backgroundColor: CP_PURPLE }}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
            <span>Publish All to Live Store</span>
          </button>
        </div>
      </div>

      {/* Review Grid */}
      <div className="bg-white border-2 rounded-[48px] overflow-hidden shadow-sm" style={{ borderColor: `${CP_PURPLE}08` }}>
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white border px-4 py-2 rounded-xl text-xs font-bold text-gray-600">
              <Table className="w-4 h-4" />
              <span>Table View</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-gray-400">
              <LayoutGrid className="w-4 h-4" />
              <span>Grid View</span>
            </div>
          </div>
          <div className="relative">
             <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input type="text" placeholder="Search extracted items..." className="pl-12 pr-6 py-2 rounded-xl border border-gray-200 text-xs focus:ring-purple-200" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Image</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Product Name</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Category</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Price (CAD)</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {drafts.map((draft) => (
                <tr key={draft.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                       <CheckCircle2 className="w-4 h-4 text-green-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Extracted</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {draft.main_image_url ? (
                      <img src={draft.main_image_url} alt="Product" className="w-16 h-16 object-cover rounded-xl border-2 border-gray-100" />
                    ) : (
                      <label className="flex flex-col items-center justify-center w-16 h-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors group/upload">
                        <Upload className="w-4 h-4 text-gray-400 group-hover/upload:text-purple-500 mb-1" />
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Upload</span>
                        {/* In a real implementation, you'd add an input[type="file"] here and upload to Supabase storage */}
                      </label>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-[10px] font-black text-purple-600">PAGE {draft.page_number}</span>
                        <input 
                          type="text" 
                          className="flex-1 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-purple-500 focus:ring-0 font-black text-lg p-1 text-black placeholder:text-gray-200 transition-colors"
                          value={draft.name || ''}
                          onChange={(e) => updateDraft(draft.id, 'name', e.target.value)}
                          placeholder="Enter product name..."
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 italic font-medium line-clamp-2">AI Vision: "{draft.ai_metadata?.image_description}"</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-lg bg-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500 cursor-pointer hover:bg-gray-200">
                      {draft.category_slug || 'General'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300 font-black">$</span>
                      <input 
                        type="number" 
                        className="w-24 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-purple-500 focus:ring-0 font-black text-lg p-1 text-black transition-colors"
                        value={draft.price || ''}
                        onChange={(e) => updateDraft(draft.id, 'price', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button className="p-2 rounded-lg text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {drafts.length === 0 && (
           <div className="p-20 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-gray-200 mx-auto" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No products found in this batch.</p>
           </div>
        )}
      </div>

    </div>
  );
}
