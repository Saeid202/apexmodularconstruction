"use client";

import { useState, useEffect } from "react";
import { 
  Upload, 
  Sparkles, 
  Calculator, 
  Building, 
  Layers, 
  CheckCircle, 
  ArrowRight, 
  Printer, 
  RefreshCw, 
  PhoneCall, 
  AlertCircle,
  FileText,
  Trash2,
  DollarSign
} from "lucide-react";
import { getEstimationTakeoff, type TakeoffResult } from "@/app/actions/estimator";

interface MarketplaceProduct {
  id: string;
  name: string;
  category: "wall_panel" | "roofing" | "window" | "door" | "flooring";
  supplier: string;
  price: number;
  unit: string;
  specification: string;
  leadTime: string;
}

const MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
  // Wall Panels
  {
    id: "wall-80mm-eps",
    name: "80mm EPS Sandwich Wall Panel",
    category: "wall_panel",
    supplier: "Apex Modular Materials",
    price: 20.00,
    unit: "sq ft",
    specification: "80mm Expanded Polystyrene core, double-sided galvanized steel sheet",
    leadTime: "4-6 weeks"
  },
  {
    id: "wall-100mm-pu",
    name: "100mm Polyurethane Wall Panel",
    category: "wall_panel",
    supplier: "Apex Modular Materials",
    price: 24.00,
    unit: "sq ft",
    specification: "100mm PU rigid foam core, high thermal performance (R-30)",
    leadTime: "4-6 weeks"
  },
  {
    id: "wall-120mm-rockwool",
    name: "120mm Rockwool Wall Panel",
    category: "wall_panel",
    supplier: "Z-Modular Supply",
    price: 28.50,
    unit: "sq ft",
    specification: "120mm Mineral Rockwool core, A-grade fire protection (2-hour rating)",
    leadTime: "5-7 weeks"
  },
  // Roofing
  {
    id: "roof-asphalt",
    name: "IKO Cambridge Shingle System",
    category: "roofing",
    supplier: "IKO Industries Canada",
    price: 4.50,
    unit: "sq ft",
    specification: "Heavy-duty fiberglass architectural asphalt shingles, Class A fire rating",
    leadTime: "1-2 weeks"
  },
  {
    id: "roof-standing-seam",
    name: "Standing Seam Metal Roofing System",
    category: "roofing",
    supplier: "MetalClad Canada",
    price: 12.00,
    unit: "sq ft",
    specification: "24-Gauge Galvalume steel panels, concealed clip fasteners, 50-year warranty",
    leadTime: "3-4 weeks"
  },
  // Windows
  {
    id: "win-double-vinyl",
    name: "JELD-WEN Double-Pane Vinyl Casement",
    category: "window",
    supplier: "JELD-WEN Windows & Doors",
    price: 35.00,
    unit: "sq ft",
    specification: "Argon-filled double glazing, Low-E glass, Energy Star compliant",
    leadTime: "3 weeks"
  },
  {
    id: "win-triple-alu",
    name: "Alumicor Triple-Pane Architectural Window",
    category: "window",
    supplier: "Alumicor Canada",
    price: 65.00,
    unit: "sq ft",
    specification: "Thermally broken heavy aluminum frame, triple-pane structural glass",
    leadTime: "6-8 weeks"
  },
  // Doors
  {
    id: "door-fiberglass",
    name: "Masonite Insulated Entry Door",
    category: "door",
    supplier: "Masonite Canada",
    price: 480.00,
    unit: "unit",
    specification: "Fiberglass textured entry door, polyurethane insulating core, steel lock blocks",
    leadTime: "2-3 weeks"
  },
  {
    id: "door-sliding-patio",
    name: "Sliding Patio Aluminum Door",
    category: "door",
    supplier: "JELD-WEN Windows & Doors",
    price: 950.00,
    unit: "unit",
    specification: "Dual-pane tempered safety glass, sliding screen, thermal frame",
    leadTime: "3 weeks"
  },
  // Flooring
  {
    id: "floor-engineered-oak",
    name: "Shaw Engineered Oak Plank",
    category: "flooring",
    supplier: "Shaw Floors",
    price: 8.50,
    unit: "sq ft",
    specification: "7-inch wide planks, wire-brushed finish, multi-ply hardwood core",
    leadTime: "2 weeks"
  },
  {
    id: "floor-spc-vinyl",
    name: "Torlys SPC Rigid Vinyl Flooring",
    category: "flooring",
    supplier: "Torlys Flooring",
    price: 4.99,
    unit: "sq ft",
    specification: "5mm thick rigid stone-plastic composite core, waterproof, IXPE backing",
    leadTime: "1-2 weeks"
  }
];

export default function GetQuotePage() {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [wallHeight, setWallHeight] = useState<number>(9);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing AI vision engine...");
  const [error, setError] = useState<string | null>(null);
  
  // Results State
  const [takeoff, setTakeoff] = useState<TakeoffResult | null>(null);
  
  // Marketplace Selection State
  const [selectedWallPanel, setSelectedWallPanel] = useState<string>("wall-80mm-eps");
  const [selectedRoof, setSelectedRoof] = useState<string>("roof-asphalt");
  const [selectedWindow, setSelectedWindow] = useState<string>("win-double-vinyl");
  const [selectedDoor, setSelectedDoor] = useState<string>("door-fiberglass");
  const [selectedFlooring, setSelectedFlooring] = useState<string>("floor-spc-vinyl");

  // Detailed Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });

  // Simulated progressive loader messages
  useEffect(() => {
    if (!loading) return;
    const messages = [
      { time: 0, text: "Connecting to Gemini 3.5 Flash Vision..." },
      { time: 2500, text: "Analyzing architectural drawings & footprint footprint..." },
      { time: 5500, text: "Extracting interior partition walls & room counts..." },
      { time: 8500, text: "Deducting window & exterior door areas..." },
      { time: 11000, text: "Computing Ontario-compliant takeoff waste factors..." },
      { time: 13500, text: "Querying live Apex Marketplace seller catalog..." }
    ];

    const timeouts = messages.map(msg => 
      setTimeout(() => setLoadingMessage(msg.text), msg.time)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/") && selectedFile.type !== "application/pdf") {
      setError("Please upload an image (PNG, JPG, WebP) or architectural PDF.");
      return;
    }

    setFile(selectedFile);

    // Create a local object URL for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setError(null);
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    if (!droppedFile.type.startsWith("image/") && droppedFile.type !== "application/pdf") {
      setError("Please upload an image (PNG, JPG, WebP) or architectural PDF.");
      return;
    }

    setFile(droppedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(droppedFile);
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    setError(null);
  };

  const triggerEstimation = async () => {
    if (!filePreview) return;
    setLoading(true);
    setError(null);

    try {
      const response = await getEstimationTakeoff(filePreview, wallHeight);
      if (response.success && response.data) {
        setTakeoff(response.data);
      } else {
        throw new Error(response.error || "Estimation failed.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during plan analysis.");
    } finally {
      setLoading(false);
    }
  };

  // Reset all
  const resetEstimator = () => {
    setFile(null);
    setFilePreview(null);
    setTakeoff(null);
    setError(null);
  };

  // Calculations
  const getProduct = (id: string) => MARKETPLACE_PRODUCTS.find(p => p.id === id)!;

  const wallPanel = getProduct(selectedWallPanel);
  const roofing = getProduct(selectedRoof);
  const windowProduct = getProduct(selectedWindow);
  const doorProduct = getProduct(selectedDoor);
  const flooring = getProduct(selectedFlooring);

  // Waste percentages (Ontario villa defaults)
  const WALL_WASTE = 1.07; // 7%
  const ROOF_WASTE = 1.10; // 10%
  const FLOOR_WASTE = 1.08; // 8%

  // Takeoff quantities
  const netWallArea = takeoff?.exterior_walls.net_area_sqft || 0;
  const wallQuantityOrdered = Math.ceil(netWallArea * WALL_WASTE);
  const wallTotal = wallQuantityOrdered * wallPanel.price;

  // Let's assume roof footprint is roughly footprint area * 1.15 for slope
  const floorArea = takeoff?.footprint.total_area_sqft || 0;
  const roofArea = Math.ceil(floorArea * 1.15);
  const roofQuantityOrdered = Math.ceil(roofArea * ROOF_WASTE);
  const roofTotal = roofQuantityOrdered * roofing.price;

  const windowArea = takeoff?.openings.windows.total_area_sqft || 0;
  const windowTotal = windowArea * windowProduct.price;

  const doorCount = takeoff?.openings.doors.count || 0;
  const doorTotal = doorCount * doorProduct.price;

  const flooringQuantityOrdered = Math.ceil(floorArea * FLOOR_WASTE);
  const flooringTotal = flooringQuantityOrdered * flooring.price;

  // Totals
  const subtotal = wallTotal + roofTotal + windowTotal + doorTotal + flooringTotal;
  const shippingCost = subtotal > 15000 ? 2500 : 1500;
  const hstTax = (subtotal + shippingCost) * 0.13; // Ontario 13% HST
  const grandTotal = subtotal + shippingCost + hstTax;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewModalOpen(false);
      setReviewSubmitted(false);
      setContactForm({ name: "", email: "", phone: "", notes: "" });
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden print:bg-white print:text-black">
      {/* Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-900/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12 print:hidden">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered Estimator
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent">
            Apex AI Construction Estimator
          </h1>
          <p className="mt-3 text-lg text-slate-400 max-w-2xl mx-auto">
            Upload an architectural floor plan, enter the building height, and receive a preliminary marketplace-matched construction quote instantly.
          </p>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="mb-8 p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-200 flex items-start gap-3 max-w-3xl mx-auto print:hidden">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-400" />
            <div>
              <h3 className="font-bold text-red-300">Estimation Error</h3>
              <p className="text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="max-w-md mx-auto my-16 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center backdrop-blur-md shadow-2xl relative overflow-hidden print:hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-yellow-500/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-100 mb-2">Analyzing Floor Plan</h3>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mb-4 overflow-hidden">
                <div className="bg-purple-600 h-1.5 rounded-full animate-progress" style={{ width: "60%" }} />
              </div>
              <p className="text-sm text-slate-400 font-mono italic animate-pulse">{loadingMessage}</p>
            </div>
          </div>
        )}

        {/* STEP 1: UPLOAD & INPUT */}
        {!loading && !takeoff && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:hidden">
            {/* Left: Drag & Drop Zone */}
            <div className="lg:col-span-7">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 relative group overflow-hidden ${
                  file 
                    ? "border-purple-500/40 bg-purple-950/5" 
                    : "border-slate-800 bg-slate-900/50 hover:border-purple-500/20 hover:bg-slate-900/80"
                }`}
              >
                {filePreview ? (
                  <div className="relative">
                    <img 
                      src={filePreview} 
                      alt="Floor plan preview" 
                      className="max-h-[400px] mx-auto rounded-xl object-contain shadow-lg border border-slate-800/80"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={removeFile}
                        className="p-2 rounded-lg bg-red-600/90 text-white hover:bg-red-700 transition-colors shadow-md"
                        title="Remove plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                     <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-300 font-medium bg-slate-900/90 px-4 py-2 rounded-full w-max mx-auto border border-slate-800">
                      <FileText className="w-4 h-4 text-purple-400" />
                      {file?.name}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-purple-950/50 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-200">Upload Architectural Plan</h3>
                    <p className="text-sm text-slate-400 mt-1 max-w-sm">
                      Drag & drop your floor plan here, or click to browse. Supports PNG, JPG, WebP, or PDF.
                    </p>
                    <label className="mt-6 inline-flex items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-sm font-bold text-white transition-all cursor-pointer hover:scale-105 shadow-lg shadow-purple-600/20">
                      Browse Files
                      <input 
                        id="plan-file-upload" 
                        type="file" 
                        accept="image/*,application/pdf" 
                        className="hidden" 
                        onChange={handleFileChange} 
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Parameters Form */}
            <div className="lg:col-span-5 bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md shadow-xl">
              <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2 mb-6">
                <Calculator className="w-5 h-5 text-[#D4AF37]" /> Build Parameters
              </h2>

              <div className="space-y-6">
                {/* Height Input */}
                <div>
                  <label htmlFor="wall-height-input" className="block text-sm font-semibold text-slate-300 mb-2">
                    Exterior Wall Height (feet)
                  </label>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button" 
                      onClick={() => setWallHeight(prev => Math.max(8, prev - 1))}
                      className="w-11 h-11 border border-slate-850 rounded-xl bg-slate-950 text-lg hover:bg-slate-900 active:scale-95 transition-all text-slate-300"
                    >
                      -
                    </button>
                    <input 
                      id="wall-height-input"
                      type="number" 
                      min="8" 
                      max="20"
                      value={wallHeight}
                      onChange={(e) => setWallHeight(Number(e.target.value))}
                      className="flex-1 h-11 bg-slate-950 border border-slate-800 rounded-xl text-center font-bold text-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                    <button 
                      type="button" 
                      onClick={() => setWallHeight(prev => Math.min(20, prev + 1))}
                      className="w-11 h-11 border border-slate-850 rounded-xl bg-slate-950 text-lg hover:bg-slate-900 active:scale-95 transition-all text-slate-300"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Standard residential code range: 8 ft to 12 ft. 9 ft is recommended for Ontario Villas.
                  </p>
                </div>

                {/* Construction Assembly assumptions */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                  <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-[#D4AF37]" /> Ontario Villa Defaults
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-1.5">
                    <li className="flex justify-between">
                      <span>Roof slope expansion:</span>
                      <span className="font-medium text-slate-200">15% slope factor</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Wall Panel waste factor:</span>
                      <span className="font-medium text-slate-200">7% waste allowance</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Roof Shingles waste factor:</span>
                      <span className="font-medium text-slate-200">10% waste allowance</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Flooring waste factor:</span>
                      <span className="font-medium text-slate-200">8% waste allowance</span>
                    </li>
                  </ul>
                </div>

                {/* Submit Action */}
                <button
                  type="button"
                  disabled={!file}
                  onClick={triggerEstimation}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    file 
                      ? "bg-gradient-to-r from-purple-600 to-[#4B1D8F] text-white hover:scale-[1.02] shadow-lg shadow-purple-600/20 active:scale-[0.98]" 
                      : "bg-slate-850 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <Sparkles className="w-5 h-5" /> Generate AI Estimate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DISPLAY ESTIMATION RESULTS */}
        {takeoff && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Top info and reset bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-slate-900/50 border border-slate-800/80 rounded-3xl gap-4 print:border-none print:bg-transparent print:p-0">
              <div>
                <span className="text-xs font-mono text-purple-400 uppercase tracking-wider print:hidden">Analysis Complete</span>
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2 print:text-black">
                  <Layers className="w-6 h-6 text-[#D4AF37]" /> Preliminary Structural Takeoff
                </h2>
                <p className="text-xs text-slate-400 print:text-slate-500 mt-1">
                  Confidence Score: <span className={`font-bold ${takeoff.confidence_score > 75 ? 'text-green-400' : 'text-yellow-400'}`}>{takeoff.confidence_score}%</span> | Model: Gemini 3.5 Flash Vision
                </p>
              </div>
              <div className="flex gap-3 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="inline-flex h-10 items-center justify-center gap-1.5 px-4 rounded-xl border border-slate-700 bg-slate-800 text-sm font-semibold hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print PDF
                </button>
                <button
                  onClick={resetEstimator}
                  className="inline-flex h-10 items-center justify-center gap-1.5 px-4 rounded-xl border border-purple-500/20 bg-purple-600/10 text-purple-400 text-sm font-semibold hover:bg-purple-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Re-estimate
                </button>
              </div>
            </div>

            {/* Structured AI Takeoff details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-4">
              <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/80 print:bg-white print:border print:text-black">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Building Footprint</p>
                <p className="text-2xl font-black text-slate-100 mt-1 print:text-black">
                  {takeoff.footprint.length_ft} &times; {takeoff.footprint.width_ft} <span className="text-sm font-normal text-slate-400">ft</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">{takeoff.footprint.total_area_sqft} sq ft floor area</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/80 print:bg-white print:border print:text-black">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Net Wall Area</p>
                <p className="text-2xl font-black text-[#D4AF37] mt-1">
                  {takeoff.exterior_walls.net_area_sqft} <span className="text-sm font-normal text-slate-400">sq ft</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">Gross wall: {takeoff.exterior_walls.gross_area_sqft} sq ft</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/80 print:bg-white print:border print:text-black">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Openings Deducted</p>
                <p className="text-2xl font-black text-slate-100 mt-1 print:text-black">
                  -{windowArea + doorCount * 20} <span className="text-sm font-normal text-slate-400">sq ft</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">{takeoff.openings.windows.count} Windows, {takeoff.openings.doors.count} Doors</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/80 print:bg-white print:border print:text-black">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Room Breakdown</p>
                <p className="text-2xl font-black text-slate-100 mt-1 print:text-black">
                  {takeoff.rooms.bedrooms}B / {takeoff.rooms.bathrooms}Ba
                </p>
                <p className="text-xs text-slate-400 mt-1">Includes {takeoff.rooms.powder_rooms} Powder, {takeoff.rooms.other_rooms_count} Living areas</p>
              </div>
            </div>

            {/* Calculations & Product Match Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Product Match Configuration */}
              <div className="lg:col-span-8 space-y-6 print:col-span-12">
                <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2 print:text-black print:border-black">
                  <Building className="w-5 h-5 text-purple-400" /> Match Marketplace Materials
                </h3>

                {/* 1. Wall System */}
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4 print:bg-white print:border print:text-black">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="font-bold text-slate-200 text-lg print:text-black">1. Exterior Wall Panel System</h4>
                      <p className="text-xs text-slate-400">Matched via Net Wall Area: {netWallArea} sq ft + 7% waste = {wallQuantityOrdered} sq ft required</p>
                    </div>
                    <div className="text-right print:text-left mt-2 sm:mt-0">
                      <span className="text-sm font-semibold text-slate-400">Est. Cost: </span>
                      <span className="text-xl font-black text-[#D4AF37]">${wallTotal.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2 border-t border-slate-800/50 print:grid-cols-1">
                    <div>
                      <label htmlFor="wall-panel-select" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 print:hidden">Select Product Specification</label>
                      <select
                        id="wall-panel-select"
                        value={selectedWallPanel}
                        onChange={(e) => setSelectedWallPanel(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-850 text-sm font-semibold text-slate-200 focus:outline-none focus:border-purple-500 print:hidden"
                      >
                        {MARKETPLACE_PRODUCTS.filter(p => p.category === "wall_panel").map(p => (
                          <option key={p.id} value={p.id}>{p.name} — ${p.price}/{p.unit}</option>
                        ))}
                      </select>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-850/80 text-xs text-slate-400 space-y-1 print:bg-slate-50 print:text-black">
                      <div className="flex justify-between"><span className="font-bold text-slate-300 print:text-black">Selected:</span><span className="text-purple-400 font-semibold">{wallPanel.name}</span></div>
                      <div className="flex justify-between"><span>Supplier:</span><span className="text-slate-300 font-medium print:text-black">{wallPanel.supplier}</span></div>
                      <div className="flex justify-between"><span>Spec:</span><span className="text-slate-300 font-medium truncate max-w-[200px] print:text-black" title={wallPanel.specification}>{wallPanel.specification}</span></div>
                    </div>
                  </div>
                </div>

                {/* 2. Roof System */}
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4 print:bg-white print:border print:text-black">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="font-bold text-slate-200 text-lg print:text-black">2. Roof Shingle / Sheathing System</h4>
                      <p className="text-xs text-slate-400">Estimated roof footprint: {roofArea} sq ft + 10% waste = {roofQuantityOrdered} sq ft required</p>
                    </div>
                    <div className="text-right print:text-left mt-2 sm:mt-0">
                      <span className="text-sm font-semibold text-slate-400">Est. Cost: </span>
                      <span className="text-xl font-black text-[#D4AF37]">${roofTotal.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2 border-t border-slate-800/50 print:grid-cols-1">
                    <div>
                      <label htmlFor="roof-select" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 print:hidden">Select Roofing System</label>
                      <select
                        id="roof-select"
                        value={selectedRoof}
                        onChange={(e) => setSelectedRoof(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-850 text-sm font-semibold text-slate-200 focus:outline-none focus:border-purple-500 print:hidden"
                      >
                        {MARKETPLACE_PRODUCTS.filter(p => p.category === "roofing").map(p => (
                          <option key={p.id} value={p.id}>{p.name} — ${p.price}/{p.unit}</option>
                        ))}
                      </select>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-850/80 text-xs text-slate-400 space-y-1 print:bg-slate-50 print:text-black">
                      <div className="flex justify-between"><span className="font-bold text-slate-300 print:text-black">Selected:</span><span className="text-purple-400 font-semibold">{roofing.name}</span></div>
                      <div className="flex justify-between"><span>Supplier:</span><span className="text-slate-300 font-medium print:text-black">{roofing.supplier}</span></div>
                      <div className="flex justify-between"><span>Spec:</span><span className="text-slate-300 font-medium truncate max-w-[200px] print:text-black" title={roofing.specification}>{roofing.specification}</span></div>
                    </div>
                  </div>
                </div>

                {/* 3. Windows */}
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4 print:bg-white print:border print:text-black">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="font-bold text-slate-200 text-lg print:text-black">3. Window Units</h4>
                      <p className="text-xs text-slate-400">Total detected window openings: {takeoff.openings.windows.count} windows ({windowArea} sq ft total area)</p>
                    </div>
                    <div className="text-right print:text-left mt-2 sm:mt-0">
                      <span className="text-sm font-semibold text-slate-400">Est. Cost: </span>
                      <span className="text-xl font-black text-[#D4AF37]">${windowTotal.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2 border-t border-slate-800/50 print:grid-cols-1">
                    <div>
                      <label htmlFor="window-select" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 print:hidden">Select Glazing Spec</label>
                      <select
                        id="window-select"
                        value={selectedWindow}
                        onChange={(e) => setSelectedWindow(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-850 text-sm font-semibold text-slate-200 focus:outline-none focus:border-purple-500 print:hidden"
                      >
                        {MARKETPLACE_PRODUCTS.filter(p => p.category === "window").map(p => (
                          <option key={p.id} value={p.id}>{p.name} — ${p.price}/{p.unit}</option>
                        ))}
                      </select>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-850/80 text-xs text-slate-400 space-y-1 print:bg-slate-50 print:text-black">
                      <div className="flex justify-between"><span className="font-bold text-slate-300 print:text-black">Selected:</span><span className="text-purple-400 font-semibold">{windowProduct.name}</span></div>
                      <div className="flex justify-between"><span>Supplier:</span><span className="text-slate-300 font-medium print:text-black">{windowProduct.supplier}</span></div>
                      <div className="flex justify-between"><span>Spec:</span><span className="text-slate-300 font-medium truncate max-w-[200px] print:text-black" title={windowProduct.specification}>{windowProduct.specification}</span></div>
                    </div>
                  </div>
                </div>

                {/* 4. Exterior Doors */}
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4 print:bg-white print:border print:text-black">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="font-bold text-slate-200 text-lg print:text-black">4. Exterior Doors</h4>
                      <p className="text-xs text-slate-400">Total detected exterior doors: {doorCount} doors</p>
                    </div>
                    <div className="text-right print:text-left mt-2 sm:mt-0">
                      <span className="text-sm font-semibold text-slate-400">Est. Cost: </span>
                      <span className="text-xl font-black text-[#D4AF37]">${doorTotal.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2 border-t border-slate-800/50 print:grid-cols-1">
                    <div>
                      <label htmlFor="door-select" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 print:hidden">Select Door System</label>
                      <select
                        id="door-select"
                        value={selectedDoor}
                        onChange={(e) => setSelectedDoor(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-850 text-sm font-semibold text-slate-200 focus:outline-none focus:border-purple-500 print:hidden"
                      >
                        {MARKETPLACE_PRODUCTS.filter(p => p.category === "door").map(p => (
                          <option key={p.id} value={p.id}>{p.name} — ${p.price}/{p.unit}</option>
                        ))}
                      </select>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-850/80 text-xs text-slate-400 space-y-1 print:bg-slate-50 print:text-black">
                      <div className="flex justify-between"><span className="font-bold text-slate-300 print:text-black">Selected:</span><span className="text-purple-400 font-semibold">{doorProduct.name}</span></div>
                      <div className="flex justify-between"><span>Supplier:</span><span className="text-slate-300 font-medium print:text-black">{doorProduct.supplier}</span></div>
                      <div className="flex justify-between"><span>Spec:</span><span className="text-slate-300 font-medium truncate max-w-[200px] print:text-black" title={doorProduct.specification}>{doorProduct.specification}</span></div>
                    </div>
                  </div>
                </div>

                {/* 5. Interior Flooring */}
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4 print:bg-white print:border print:text-black">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="font-bold text-slate-200 text-lg print:text-black">5. Floor Covering System</h4>
                      <p className="text-xs text-slate-400">Total interior floor area: {floorArea} sq ft + 8% waste = {flooringQuantityOrdered} sq ft required</p>
                    </div>
                    <div className="text-right print:text-left mt-2 sm:mt-0">
                      <span className="text-sm font-semibold text-slate-400">Est. Cost: </span>
                      <span className="text-xl font-black text-[#D4AF37]">${flooringTotal.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2 border-t border-slate-800/50 print:grid-cols-1">
                    <div>
                      <label htmlFor="flooring-select" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 print:hidden">Select Flooring Type</label>
                      <select
                        id="flooring-select"
                        value={selectedFlooring}
                        onChange={(e) => setSelectedFlooring(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-850 text-sm font-semibold text-slate-200 focus:outline-none focus:border-purple-500 print:hidden"
                      >
                        {MARKETPLACE_PRODUCTS.filter(p => p.category === "flooring").map(p => (
                          <option key={p.id} value={p.id}>{p.name} — ${p.price}/{p.unit}</option>
                        ))}
                      </select>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-850/80 text-xs text-slate-400 space-y-1 print:bg-slate-50 print:text-black">
                      <div className="flex justify-between"><span className="font-bold text-slate-300 print:text-black">Selected:</span><span className="text-purple-400 font-semibold">{flooring.name}</span></div>
                      <div className="flex justify-between"><span>Supplier:</span><span className="text-slate-300 font-medium print:text-black">{flooring.supplier}</span></div>
                      <div className="flex justify-between"><span>Spec:</span><span className="text-slate-300 font-medium truncate max-w-[200px] print:text-black" title={flooring.specification}>{flooring.specification}</span></div>
                    </div>
                  </div>
                </div>

                {/* Extract notes */}
                {takeoff.extracted_notes && (
                  <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800 text-xs text-slate-400 italic">
                    <span className="font-bold text-slate-300 block mb-1">AI Floor Plan Analyst Notes:</span>
                    &ldquo;{takeoff.extracted_notes}&rdquo;
                  </div>
                )}

              </div>

              {/* Price Calculation Sidebar */}
              <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md sticky top-6 shadow-xl print:border-none print:bg-transparent print:p-0 print:static">
                <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 mb-4 print:text-black print:border-black">
                  Estimate Invoice Summary
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-slate-400 print:text-slate-600">
                    <span>Wall Panel System</span>
                    <span className="font-semibold text-slate-200 print:text-black">${wallTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 print:text-slate-600">
                    <span>Roofing System</span>
                    <span className="font-semibold text-slate-200 print:text-black">${roofTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 print:text-slate-600">
                    <span>Windows Units</span>
                    <span className="font-semibold text-slate-200 print:text-black">${windowTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 print:text-slate-600">
                    <span>Doors Units</span>
                    <span className="font-semibold text-slate-200 print:text-black">${doorTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 print:text-slate-600">
                    <span>Flooring System</span>
                    <span className="font-semibold text-slate-200 print:text-black">${flooringTotal.toLocaleString()}</span>
                  </div>

                  <div className="border-t border-slate-800 my-4 pt-4 space-y-3">
                    <div className="flex justify-between text-slate-400 print:text-slate-600">
                      <span>Subtotal Materials</span>
                      <span className="font-semibold text-slate-200 print:text-black">${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 print:text-slate-600">
                      <span>Ontario Shipping Estimate</span>
                      <span className="font-semibold text-slate-200 print:text-black">${shippingCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 print:text-slate-600">
                      <span>HST Tax (13%)</span>
                      <span className="font-semibold text-slate-200 print:text-black">${Math.ceil(hstTax).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-4 flex justify-between items-baseline print:border-black">
                    <span className="text-base font-bold text-slate-200 print:text-black">Grand Total Est.</span>
                    <span className="text-3xl font-black text-purple-400">${Math.ceil(grandTotal).toLocaleString()}</span>
                  </div>
                </div>

                {/* Fine print info */}
                <div className="mt-6 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-300/80 flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-yellow-400" />
                  <span>
                    This estimate represents a **Preliminary AI Estimate** based on drawing interpretation. Final engineered takeoff quantities, local zoning permit verification, and actual shipping rates may vary.
                  </span>
                </div>

                {/* Call to Actions */}
                <div className="mt-6 space-y-3 print:hidden">
                  <button
                    onClick={() => setReviewModalOpen(true)}
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/10 cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" /> Request Professional Review
                  </button>
                  
                  <button
                    onClick={() => {
                      alert("Quote saved! Create an account to track this quote and match structural engineering plans.");
                    }}
                    className="w-full py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition-all cursor-pointer"
                  >
                    Save Estimate to Account
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* DETAILED REVIEW DIALOG MODAL */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-yellow-500/5 pointer-events-none" />
            
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-2">
              <PhoneCall className="w-5 h-5 text-purple-400" /> Professional Takeoff Review
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              An Apex modular construction engineer will verify the AI-calculated quantities, match local zoning codes, and contact you with a formal engineered quote.
            </p>

            {reviewSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center text-green-400 mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-200 text-lg">Request Received</h4>
                <p className="text-xs text-slate-400">An estimator will contact you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label htmlFor="modal-name-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    id="modal-name-input"
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-850 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="modal-email-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    id="modal-email-input"
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-850 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="modal-phone-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    id="modal-phone-input"
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="(555) 000-0000"
                    className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-850 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="modal-notes-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Project Notes (Optional)</label>
                  <textarea
                    id="modal-notes-input"
                    rows={2}
                    value={contactForm.notes}
                    onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                    placeholder="E.g., site conditions, timeline, or product preferences..."
                    className="w-full p-3 rounded-lg bg-slate-950 border border-slate-850 text-sm focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-350 text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </main>
  );
}
