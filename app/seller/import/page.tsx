"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Upload, FileText, Database, 
  Sparkles, ArrowRight, Loader2, 
  CheckCircle2, AlertCircle, RefreshCcw 
} from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { processCatalogFile } from "@/app/actions/catalog-ingestion";

const CP_PURPLE = "#4B1D8F";
const CP_GOLD = "#D4AF37";

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{batchId: string, count: number} | null>(null);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createBrowserClient();
      
      // 1. Upload to Storage (Private Bucket)
      const fileExt = file.name.split('.').pop();
      const filePath = `catalogs/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("temp-catalogs")
        .upload(filePath, file);

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // 2. Call AI with the storage path
      const result = await processCatalogFile(filePath, file.name, file.type);
      
      if (result.success) {
        setSuccess({ batchId: result.batchId!, count: result.count! });
      } else {
        setError(result.error || "Failed to process file.");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex flex-col space-y-4 mb-12">
        <div className="inline-flex items-center space-x-3 px-6 py-2 rounded-full border shadow-sm w-fit" style={{ borderColor: CP_GOLD, backgroundColor: `${CP_GOLD}10` }}>
          <Sparkles className="w-4 h-4" style={{ color: CP_GOLD }} />
          <span className="text-[11px] font-[900] uppercase tracking-[0.3em]" style={{ color: CP_PURPLE }}>Apex Modular Construction Seller Intelligence</span>
        </div>
        <h1 className="text-5xl font-[1000] text-black tracking-tighter">Bulk Product <span style={{ color: CP_PURPLE }}>Ingestion.</span></h1>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em]">Scan Catalogs • Extract Specs • Mass Publish</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: Uploader */}
        <div className="md:col-span-2 space-y-6">
          <div 
            className={`relative border-4 border-dashed rounded-[48px] p-16 transition-all flex flex-col items-center justify-center text-center space-y-6 ${file ? 'border-purple-200 bg-purple-50/30' : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-purple-200'}`}
          >
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer z-0" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.xlsx,.doc,.docx,.txt"
            />
            
            <div className="w-20 h-20 rounded-[32px] flex items-center justify-center shadow-xl text-white group-hover:scale-110 transition-transform" style={{ backgroundColor: CP_PURPLE }}>
              <Upload className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-[1000] text-black">{file ? file.name : "Drop Supplier Catalog Here"}</h3>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Supports PDF, Excel, and Word files</p>
            </div>

            {file && !loading && !success && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                className="relative z-10 px-10 py-5 rounded-[24px] text-white font-black text-sm tracking-widest uppercase shadow-2xl transition-all active:scale-95 flex items-center space-x-3 hover:brightness-110"
                style={{ backgroundColor: CP_PURPLE }}
              >
                <span>Process with AI</span>
                <Sparkles className="w-5 h-5" />
              </button>
            )}

            {loading && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: CP_PURPLE }} />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Segmenting Products & Translating Specs...</p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-6 rounded-[32px] bg-red-50 border-2 border-red-100 flex items-center space-x-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-sm font-bold text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-8 rounded-[48px] bg-green-50 border-2 border-green-100 flex flex-col items-center text-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-[1000] text-green-900">Scan Complete!</h3>
                <p className="text-green-700 font-bold uppercase text-[10px] tracking-widest">{success.count} Product Drafts Extracted</p>
              </div>
              <button 
                onClick={() => router.push(`/seller/import/${success.batchId}`)}
                className="px-8 py-4 rounded-[20px] bg-black text-white font-black text-xs tracking-widest uppercase flex items-center space-x-3 hover:scale-105 transition-transform"
              >
                <span>Enter Review Board</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Info/Stats */}
        <div className="space-y-6">
          <div className="p-8 rounded-[40px] bg-white border-2 border-gray-100 shadow-sm space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: CP_PURPLE }}>Ingestion Logic</h4>
            <div className="space-y-4">
              {[
                { title: "Smart Slicing", desc: "AI automatically identifies product boundaries in multi-page catalogs." },
                { title: "Auto-Translate", desc: "Technical specs in Chinese are converted to English business terms." },
                { title: "Draft-Safe", desc: "Nothing goes live without your manual approval." }
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${CP_PURPLE}10` }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CP_PURPLE }} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-black text-black">{item.title}</p>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[40px] border-2 border-dashed border-gray-200 flex flex-col items-center text-center space-y-4">
            <Database className="w-8 h-8 text-gray-300" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Connected to Supabase Product Core</p>
          </div>
        </div>

      </div>
    </div>
  );
}
