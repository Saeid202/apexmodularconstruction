"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, Upload, Ruler, Loader2, CheckCircle2, ChevronRight, X, Scan, Send, MessageCircle, Sparkles, Image as ImageIcon, Package } from "lucide-react";
import { ARScanner } from "@/components/kitchen-studio/ARScanner";
import { analyzeKitchenPhotos } from "@/app/actions/analyze-kitchen-photos";
import { getKitchenPartners, KitchenPartner } from "@/app/actions/kitchen-partners";
import { getPartnerProducts, PartnerProduct } from "@/app/actions/partner-products";
import { getProducts } from "@/app/actions/products";
import Link from "next/link";

const CP_PURPLE = "#4B1D8F";
const CP_GOLD = "#D4AF37";

type Step = 
  | "welcome"
  | "uploading"
  | "scanning"
  | "processing"
  | "results"
  | "questions"
  | "generating"
  | "final";

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

import { parseWallCommand } from '@/app/actions/parse-wall-command';

export function KitchenStudio({ onExit }: { onExit: () => void }) {
  const [step, setStep] = useState<Step>("welcome");
  const [scanProgress, setScanProgress] = useState(0);
  const [processingPhase, setProcessingPhase] = useState("Analyzing Kitchen...");
  const [isPhotoFlow, setIsPhotoFlow] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  
  // Real Camera & AR State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<{name: string, top: number, left: number, delay: number}[]>([]);
  
  // Photo Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [aiResults, setAiResults] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Dragging State
  const [isEditingDimensions, setIsEditingDimensions] = useState(false);
  const [customWallBox, setCustomWallBox] = useState<{top: number, left: number, width: number, height: number} | null>(null);
  const [draggingEdge, setDraggingEdge] = useState<'top'|'bottom'|'left'|'right'|null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [placedProducts, setPlacedProducts] = useState<{
    id: string;
    name: string;
    img: string;
    price: string;
    top: number;
    left: number;
    width: number;
    height: number;
  }[]>([]);
  
  // Saved Scans State
  const [savedScans, setSavedScans] = useState<{ id: string, photo: string, aiResults: any, customBox: any }[]>([]);

  // Kitchen Partners State
  const [kitchenPartners, setKitchenPartners] = useState<KitchenPartner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  
  // Partner Storefront State
  const [selectedPartner, setSelectedPartner] = useState<KitchenPartner | null>(null);
  const [partnerProducts, setPartnerProducts] = useState<PartnerProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [cabinetProducts, setCabinetProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadCabinets() {
      const res = await getProducts({ categorySlug: "cabinets" });
      if (res.data) {
        setCabinetProducts(res.data);
      }
    }
    loadCabinets();
  }, []);

  useEffect(() => {
    if (step === "questions" && kitchenPartners.length === 0) {
      setLoadingPartners(true);
      getKitchenPartners().then(partners => {
        setKitchenPartners(partners);
        setLoadingPartners(false);
      });
    }
  }, [step]);

  useEffect(() => {
    if (aiResults?.detectedObjects) {
      const wallObj = aiResults.detectedObjects.find((o: any) => o.type.toLowerCase().includes('wall'));
      if (wallObj) {
        setCustomWallBox(wallObj.box);
      }
    }
  }, [aiResults]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingEdge || !customWallBox || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const xPercent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setCustomWallBox(prev => {
      if (!prev) return prev;
      let newBox = { ...prev };
      if (draggingEdge === 'top') {
        const bottom = prev.top + prev.height;
        newBox.top = Math.min(yPercent, bottom - 5);
        newBox.height = bottom - newBox.top;
      } else if (draggingEdge === 'bottom') {
        newBox.height = Math.max(5, yPercent - prev.top);
      } else if (draggingEdge === 'left') {
        const right = prev.left + prev.width;
        newBox.left = Math.min(xPercent, right - 5);
        newBox.width = right - newBox.left;
      } else if (draggingEdge === 'right') {
        newBox.width = Math.max(5, xPercent - prev.left);
      }
      return newBox;
    });
  };

  const handlePointerUp = () => {
    setDraggingEdge(null);
  };

  const handleDragStart = (e: React.DragEvent, prod: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(prod));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const left = (x / rect.width) * 100;
    const top = (y / rect.height) * 100;

    try {
      const dataStr = e.dataTransfer.getData("application/json");
      if (!dataStr) return;
      const prod = JSON.parse(dataStr);

      const newPlaced = {
        id: `${prod.id || prod.name}-${Date.now()}`,
        name: prod.name,
        img: prod.product_images?.[0]?.url || prod.img,
        price: prod.price ? (typeof prod.price === 'string' ? prod.price : `$${prod.price}`) : '',
        top: Math.max(0, Math.min(top - 12.5, 75)),
        left: Math.max(0, Math.min(left - 7.5, 85)),
        width: 15,
        height: 25,
      };

      setPlacedProducts((prev) => [...prev, newPlaced]);
    } catch (err) {
      console.error("Error dropping item:", err);
    }
  };
  
  // Design Preferences
  const [preferences, setPreferences] = useState({
    style: "",
    cabinetColor: "",
    countertop: "",
    budget: "",
    features: [] as string[]
  });

  const questions = [
    {
      title: "What style do you prefer?",
      options: ["Modern", "Minimalist", "Scandinavian", "Traditional", "Shaker"],
      key: "style"
    },
    {
      title: "Cabinet Colour",
      options: ["White", "Black", "Walnut", "Oak", "Custom"],
      key: "cabinetColor"
    },
    {
      title: "Countertop Material",
      options: ["Quartz", "Granite", "Marble", "Wood", "Concrete"],
      key: "countertop"
    },
    {
      title: "Budget",
      options: ["Less than $10,000", "$10,000-$20,000", "$20,000-$40,000", "Unlimited"],
      key: "budget"
    }
  ];

  const multiSelectQuestion = {
    title: "Do you want any of these features?",
    options: ["Kitchen Island", "Walk-in Pantry", "Breakfast Bar", "Floor-to-ceiling Cabinets", "Smart Storage"],
    key: "features"
  };

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [cameraStream]);

  const startScanning = () => {
    setIsPhotoFlow(false);
    setStep("scanning");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsPhotoFlow(true);
      setStep("uploading");
      
      // Convert files to base64
      const base64Images: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        base64Images.push(base64);
      }
      
      setUploadedPhotos(base64Images);
      
      // Start the analysis phase
      startPhotoAnalysis(base64Images);
    }
  };

  const startPhotoAnalysis = (base64Images: string[]) => {
    setStep("processing");
    const phases = [
      "Uploading to AI Vision model...",
      "Analyzing structural geometry...",
      "Detecting cabinet layouts...",
      "Identifying windows and doors...",
      "Detecting appliances...",
      "Extracting aesthetic style...",
      "Generating spatial dimensions..."
    ];
    let phaseIndex = 0;
    
    // Start visual phase cycling
    const interval = setInterval(() => {
      phaseIndex++;
      if (phaseIndex < phases.length) {
        setProcessingPhase(phases[phaseIndex]);
      }
    }, 1500); // Cycle phases every 1.5s
    
    // Concurrently call the real Gemini API
    analyzeKitchenPhotos(base64Images).then((res) => {
      clearInterval(interval);
      if (res.success && res.data) {
        setAiResults(res.data);
      } else {
        // Show the actual API error
        setApiError(res.error || "Failed to analyze photos");
        // Fallback to mock data if API fails or key is invalid
        setAiResults({
          layout: "Utility Room",
          estLength: 14,
          estHeight: 9,
          windows: 0,
          doors: 3,
          sinkPosition: "None",
          stovePosition: "None",
          existingCabinets: "None",
          detectedObjects: [
            {
              type: "Wall",
              confidence: 0.99,
              box: { top: 5, left: 5, width: 90, height: 90 }
            },
            {
              type: "Door",
              confidence: 0.98,
              box: { top: 20, left: 40, width: 20, height: 60 }
            },
            {
              type: "Sign",
              confidence: 0.85,
              box: { top: 10, left: 42, width: 16, height: 8 }
            }
          ]
        });
      }
      setStep("results");
    });
  };

  const startProcessing = () => {
    stopCamera();
    setStep("processing");
    const phases = [
      "Analyzing Kitchen...",
      "Detecting Walls...",
      "Detecting Windows...",
      "Detecting Doors...",
      "Detecting Sink...",
      "Detecting Refrigerator...",
      "Calculating Dimensions...",
      "Building 3D Model..."
    ];
    let phaseIndex = 0;
    const interval = setInterval(() => {
      phaseIndex++;
      if (phaseIndex < phases.length) {
        setProcessingPhase(phases[phaseIndex]);
      } else {
        clearInterval(interval);
        setStep("results");
      }
    }, 600);
  };

  const handleOptionSelect = (option: string) => {
    const currentQ = questions[questionIndex];
    setPreferences(prev => ({ ...prev, [currentQ.key]: option }));
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      // Move to multi-select
      setQuestionIndex(questions.length);
    }
  };

  const toggleFeature = (feature: string) => {
    setPreferences(prev => {
      const current = prev.features;
      if (current.includes(feature)) {
        return { ...prev, features: current.filter(f => f !== feature) };
      }
      return { ...prev, features: [...current, feature] };
    });
  };

  const submitFeatures = () => {
    setStep("generating");
    setTimeout(() => {
      setStep("final");
      setChatMessages([
        { role: "assistant", content: "Here is your new kitchen design! You can tell me to change anything, like 'Make cabinets black' or 'Remove the island'." }
      ]);
    }, 3000);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { role: "user", content: chatInput }]);
    setChatInput("");
    // Mock response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: "assistant", content: "I've updated the design based on your request. How does it look now?" }]);
    }, 1000);
  };

  const renderWelcome = () => (
    <div className="flex-1 flex flex-col w-full h-full overflow-y-auto animate-in fade-in zoom-in-95 duration-500 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center justify-center min-h-full">
        
        {savedScans.length > 0 && (
          <div className="w-full mb-12 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                Project Assets ({savedScans.length} Saved Walls)
              </h3>
              <button onClick={() => setStep("questions")} className="text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-full">
                Skip to Design <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {savedScans.map((scan, i) => (
                <div key={scan.id} className="w-40 aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden relative group shadow-sm flex-shrink-0 border border-gray-200">
                  <img src={scan.photo} alt={`Saved Scan ${i+1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-white text-xs font-bold">Wall {i+1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mb-10 space-y-4 max-w-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-white shadow-xl mb-6 bg-gradient-to-br from-purple-600 to-purple-900">
            <Scan className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Apex Kitchen Studio</h1>
          <p className="text-lg text-gray-600">
            Hello! I'll help you design your dream kitchen. How would you like to begin?
          </p>
        </div>
      
        <div className="grid gap-4 w-full max-w-2xl">
          <button onClick={startScanning} className="flex items-center p-6 border-2 border-transparent bg-gray-50 rounded-2xl hover:bg-white hover:border-purple-200 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mr-4 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-bold text-gray-900 text-lg">Scan My Kitchen</h3>
              <p className="text-sm text-gray-500">Use your camera to map the space automatically</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </button>


          <button onClick={() => fileInputRef.current?.click()} className="flex items-center p-6 border-2 border-transparent bg-gray-50 rounded-2xl hover:bg-white hover:border-gray-200 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-bold text-gray-900 text-lg">Upload Kitchen Photos</h3>
              <p className="text-sm text-gray-500">AI Vision will analyze photos from your gallery</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button onClick={() => fileInputRef.current?.click()} className="flex items-center p-6 border-2 border-transparent bg-gray-50 rounded-2xl hover:bg-white hover:border-gray-200 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 mr-4 group-hover:scale-110 transition-transform">
              <Ruler className="w-6 h-6" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-bold text-gray-900 text-lg">AI Wall Builder</h3>
              <p className="text-sm text-gray-500">Upload a photo and draw your layout with AI</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderUploading = () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 animate-in fade-in">
      <div className="w-24 h-24 mb-6 relative bg-white rounded-full shadow-lg flex items-center justify-center">
        <ImageIcon className="w-10 h-10 text-blue-500 animate-pulse" />
        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Preparing Photos...</h2>
      <p className="text-gray-500">Uploading to Apex AI Vision</p>
    </div>
  );

  const renderScanning = () => (
    <div className="absolute inset-0 bg-black z-50 flex flex-col text-white overflow-y-auto">
      <div className="p-8 flex justify-between items-center mt-safe shrink-0">
        <button onClick={() => setStep("welcome")} className="p-3 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto">
          <ARScanner 
            onComplete={(data) => {
              // Wait 2 seconds so the user can see the "Scan Complete" UI inside ARScanner
              setTimeout(() => {
                startProcessing();
              }, 2500);
            }} 
          />
        </div>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 animate-in fade-in">
      <div className="w-24 h-24 mb-8 relative">
        <div className="absolute inset-0 rounded-full border-4 border-purple-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-purple-600">
          <Scan className="w-8 h-8 animate-pulse" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{processingPhase}</h2>
      <p className="text-gray-500">Using AI Vision to build your 3D model</p>
    </div>
  );

  const handleCopilotCommand = async (cmd: string) => {
    if (!cmd.trim()) return;
    
    // Add user message immediately
    setChatMessages(prev => [...prev, { role: "user", content: cmd }]);
    setChatInput("");
    
    // Show typing indicator or initial response
    const currentBox = customWallBox || { top: 40, left: 20, width: 60, height: 40 };
    
    try {
      const res = await parseWallCommand(cmd, currentBox);
      
      if (res.success && res.data) {
        setCustomWallBox({
          top: res.data.top,
          left: res.data.left,
          width: res.data.width,
          height: res.data.height
        });
        setChatMessages(prevMsg => [...prevMsg, { role: "assistant", content: res.data.reply }]);
      } else {
        setChatMessages(prevMsg => [...prevMsg, { role: "assistant", content: "Sorry, I had trouble parsing that. Please try rephrasing your command." }]);
      }
    } catch (error) {
      setChatMessages(prevMsg => [...prevMsg, { role: "assistant", content: "Something went wrong on the server." }]);
    }
  };


  const renderResults = () => (
    <div className="flex-1 overflow-y-auto bg-gray-50 animate-in fade-in slide-in-from-bottom-4 flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row h-full">
        
        {/* Left Column: AI Co-Pilot Chat */}
        <div className="w-full lg:w-1/4 border-r border-gray-200 bg-white flex flex-col shadow-xl z-10 hidden lg:flex">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-900 to-[#1A1A2E]">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-300" /> AI Co-Pilot
            </h2>
            <p className="text-purple-200 text-sm mt-1">Chat to adjust your layout.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {chatMessages.length === 0 ? (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm text-gray-700 text-xs">
                  <p className="mb-2"><strong>Wall Space Mapped!</strong></p>
                  <p>I've placed a standard cabinet block on your wall.</p>
                  <p className="mt-2">Try saying:</p>
                  <ul className="list-disc pl-4 mt-1 text-purple-700 font-medium space-y-1">
                    <li>"Move it to the right"</li>
                    <li>"Make it taller"</li>
                  </ul>
                </div>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-200' : 'bg-purple-100'}`}>
                    {msg.role === 'user' ? <Scan className="w-4 h-4 text-gray-600" /> : <Sparkles className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div className={`p-3 rounded-2xl border text-xs max-w-[85%] ${msg.role === 'user' ? 'bg-gray-900 text-white rounded-tr-none border-gray-800' : 'bg-white text-gray-700 rounded-tl-none border-gray-100 shadow-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Quick Actions & Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['Move Left', 'Make Taller', 'Make Wider'].map(cmd => (
                <button 
                  key={cmd}
                  onClick={() => handleCopilotCommand(cmd)}
                  className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100 rounded-full text-[10px] font-bold transition-colors"
                >
                  {cmd}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCopilotCommand(chatInput)}
                placeholder="Tell AI to adjust..."
                className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button 
                onClick={() => handleCopilotCommand(chatInput)}
                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column: Interactive Canvas */}
        <div className="w-full lg:w-1/2 p-4 flex flex-col bg-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Interactive Canvas</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setStep("welcome");
                  setUploadedPhotos([]);
                  setAiResults(null);
                  setCustomWallBox(null);
                  setChatMessages([]);
                }}
                className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full font-bold text-xs hover:border-gray-300 hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Camera className="w-3 h-3" /> Rescan
              </button>
              <button onClick={() => setStep("questions")} className="px-4 py-1.5 bg-purple-900 text-white rounded-full font-bold text-xs hover:bg-purple-800 transition-colors shadow-sm flex items-center gap-1.5">
                Confirm Layout <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center relative overflow-hidden group p-2 min-h-[400px]">
            <div 
              ref={imageContainerRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="relative w-full h-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200 touch-none"
            >
              {uploadedPhotos.length > 0 ? (
                <img src={uploadedPhotos[0]} alt="Analyzed Room" className="w-full h-full object-cover absolute inset-0 pointer-events-none" />
              ) : (
                <img src="https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=2070&auto=format&fit=crop" alt="Wall Placeholder" className="w-full h-full object-cover absolute inset-0 opacity-90 pointer-events-none" />
              )}

              {placedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="absolute border-2 border-purple-500 bg-white shadow-xl rounded-lg overflow-hidden group/item cursor-move z-40 select-none"
                  style={{
                    top: `${prod.top}%`,
                    left: `${prod.left}%`,
                    width: `${prod.width}%`,
                    height: `${prod.height}%`,
                  }}
                >
                  <img src={prod.img} alt={prod.name} className="w-full h-[65%] object-cover pointer-events-none" />
                  <div className="p-1 bg-purple-900 text-white h-[35%] flex flex-col justify-center text-center">
                    <p className="text-[8px] font-bold truncate">{prod.name}</p>
                    <p className="text-[8px] text-purple-200 font-semibold">{prod.price}</p>
                  </div>
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlacedProducts((prev) => prev.filter((p) => p.id !== prod.id));
                    }}
                    className="absolute top-1 right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow z-50 transition-colors"
                  >
                    <X className="w-2 h-2" />
                  </button>
                </div>
              ))}
              
              <div className="absolute top-3 left-3 z-40 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 pointer-events-none">
                <Scan className="w-3 h-3" /> Live AI Canvas
              </div>
              
              {/* Dynamic Co-Pilot Bounding Box */}
              {(() => {
                const box = customWallBox || { top: 40, left: 20, width: 60, height: 40 };
                return (
                  <div 
                    className="absolute border-[2px] border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.3)] z-30 transition-all duration-75 ease-linear flex items-center justify-center group-hover:bg-purple-500/20"
                    style={{ 
                      top: `${box.top}%`, 
                      left: `${box.left}%`, 
                      width: `${box.width}%`, 
                      height: `${box.height}%` 
                    }}
                  >
                    {/* Draggable Edges */}
                    <div className="absolute top-0 left-0 right-0 h-4 -mt-2 cursor-ns-resize z-40 hover:bg-purple-500/50" onPointerDown={(e) => { e.preventDefault(); setDraggingEdge('top'); }}></div>
                    <div className="absolute bottom-0 left-0 right-0 h-4 -mb-2 cursor-ns-resize z-40 hover:bg-purple-500/50" onPointerDown={(e) => { e.preventDefault(); setDraggingEdge('bottom'); }}></div>
                    <div className="absolute left-0 top-0 bottom-0 w-4 -ml-2 cursor-ew-resize z-40 hover:bg-purple-500/50" onPointerDown={(e) => { e.preventDefault(); setDraggingEdge('left'); }}></div>
                    <div className="absolute right-0 top-0 bottom-0 w-4 -mr-2 cursor-ew-resize z-40 hover:bg-purple-500/50" onPointerDown={(e) => { e.preventDefault(); setDraggingEdge('right'); }}></div>

                    {/* Draggable Corners */}
                    <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-[3px] border-l-[3px] border-white cursor-nwse-resize z-50 bg-transparent hover:scale-125 transition-transform"></div>
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-[3px] border-r-[3px] border-white cursor-nesw-resize z-50 bg-transparent hover:scale-125 transition-transform"></div>
                    <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-[3px] border-l-[3px] border-white cursor-nesw-resize z-50 bg-transparent hover:scale-125 transition-transform"></div>
                    <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-[3px] border-r-[3px] border-white cursor-nwse-resize z-50 bg-transparent hover:scale-125 transition-transform"></div>
                    
                    {/* Label */}
                    <span className="absolute -top-6 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-md flex items-center gap-1 whitespace-nowrap pointer-events-none">
                      <Sparkles className="w-2.5 h-2.5" /> Cabinet Zone
                    </span>
                    
                    {/* Dimensions overlay */}
                    <div className="text-white font-bold text-xs bg-black/50 backdrop-blur-md px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {Math.round(box.width / 5)}' x {Math.round(box.height / 5)}'
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Right Column: Product Center */}
        <div className="w-full lg:w-1/4 border-l border-gray-200 bg-white flex flex-col shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)] z-10">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600" /> Product Center
            </h2>
            <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Drag & Drop</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Category: Seller Catalog */}
            {cabinetProducts.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Seller Catalog</h3>
                <div className="grid grid-cols-2 gap-3">
                  {cabinetProducts.map((prod) => {
                    const img = prod.product_images?.[0]?.url || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200";
                    return (
                      <div 
                        key={prod.id} 
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, prod)}
                        className="border border-gray-200 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing hover:border-purple-400 hover:shadow-md transition-all group"
                      >
                        <div className="aspect-square bg-gray-100 relative pointer-events-none">
                          <img src={img} alt={prod.name} className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="p-2 bg-white pointer-events-none">
                          <p className="text-[10px] font-bold text-gray-900 line-clamp-1">{prod.name}</p>
                          <p className="text-[10px] text-purple-600 font-medium">${prod.price}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category: Base Cabinets */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Base Cabinets</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "36\" Shaker", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200", price: "$450" },
                  { name: "24\" Drawers", img: "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&q=80&w=200", price: "$320" }
                ].map((prod, i) => (
                  <div 
                    key={i} 
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, prod)}
                    className="border border-gray-200 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing hover:border-purple-400 hover:shadow-md transition-all group"
                  >
                    <div className="aspect-square bg-gray-100 relative pointer-events-none">
                      <img src={prod.img} alt={prod.name} className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-2 bg-white pointer-events-none">
                      <p className="text-[10px] font-bold text-gray-900 line-clamp-1">{prod.name}</p>
                      <p className="text-[10px] text-purple-600 font-medium">{prod.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category: Upper Cabinets */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Upper Cabinets</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Glass Door 30\"", img: "https://images.unsplash.com/photo-1556156653-e5a7c69cc263?auto=format&fit=crop&q=80&w=200", price: "$380" },
                  { name: "Solid Wood 36\"", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=200", price: "$290" }
                ].map((prod, i) => (
                  <div 
                    key={i} 
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, prod)}
                    className="border border-gray-200 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing hover:border-purple-400 hover:shadow-md transition-all group"
                  >
                    <div className="aspect-square bg-gray-100 relative pointer-events-none">
                      <img src={prod.img} alt={prod.name} className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-2 bg-white pointer-events-none">
                      <p className="text-[10px] font-bold text-gray-900 line-clamp-1">{prod.name}</p>
                      <p className="text-[10px] text-purple-600 font-medium">{prod.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category: Appliances */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Appliances</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Pro Gas Range", img: "https://images.unsplash.com/photo-1556910103-1c02745a872f?auto=format&fit=crop&q=80&w=200", price: "$1200" },
                  { name: "Farmhouse Sink", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200", price: "$500" }
                ].map((prod, i) => (
                  <div 
                    key={i} 
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, prod)}
                    className="border border-gray-200 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing hover:border-purple-400 hover:shadow-md transition-all group"
                  >
                    <div className="aspect-[4/3] bg-gray-100 relative pointer-events-none">
                      <img src={prod.img} alt={prod.name} className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-2 bg-white pointer-events-none">
                      <p className="text-[10px] font-bold text-gray-900 line-clamp-1">{prod.name}</p>
                      <p className="text-[10px] text-purple-600 font-medium">{prod.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
  const generateDesign = () => {
    setStep("generating");
    setTimeout(() => {
      setStep("final");
    }, 4000);
  };

  const openPartnerStore = async (partner: KitchenPartner) => {
    setSelectedPartner(partner);
    setLoadingProducts(true);
    const products = await getPartnerProducts(partner.id);
    setPartnerProducts(products);
    setLoadingProducts(false);
  };

  const renderQuestions = () => (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Project Brief */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Scan className="w-6 h-6 text-purple-600" />
              Project Brief
            </h3>
            
            {savedScans.length > 0 ? (
              <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden relative mb-6 border border-gray-200 shadow-sm group">
                <img src={savedScans[savedScans.length-1].photo} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                  <span className="text-white text-sm font-bold">Latest Scan: Wall {savedScans.length}</span>
                </div>
              </div>
            ) : (
              <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl flex items-center justify-center mb-6 border border-dashed border-gray-300">
                <p className="text-gray-400 text-sm font-bold">No walls scanned yet</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">AI Architecture Data</h4>
              <ul className="space-y-2 text-sm font-medium text-gray-700">
                <li className="flex justify-between border-b pb-2"><span>Total Walls Mapped:</span> <span>{savedScans.length}</span></li>
                <li className="flex justify-between border-b pb-2"><span>Est. Wall Length:</span> <span>{aiResults?.estLength || 14}'</span></li>
                <li className="flex justify-between border-b pb-2"><span>Est. Ceiling Height:</span> <span>{aiResults?.estHeight || 9}'</span></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Design Preferences</h4>
              <textarea 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={4}
                placeholder="What are you looking for? (e.g. Modern white shaker cabinets, double sink, island...)"
              ></textarea>
            </div>
            
            <button 
              onClick={submitFeatures}
              className="w-full py-4 mt-6 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-md"
            >
              Skip & Auto-Generate 3D
            </button>
          </div>
        </div>

        {/* Right Column: Partner Directory */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Factory Partners & Designers</h2>
              <p className="text-gray-500 text-lg">Connect instantly via video to verify your layout and choose materials directly from the source.</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {loadingPartners ? (
              <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
                <p className="font-medium text-sm">Finding best matched factories...</p>
              </div>
            ) : kitchenPartners.length > 0 ? kitchenPartners.map((partner, idx) => (
              <div key={idx} className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-gray-100 hover:border-purple-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-start md:items-center gap-6 group">
                <Link href={`/sellers/${partner.id}`} className="relative shrink-0 block hover:opacity-90 transition-opacity">
                  <img src={partner.img} alt={partner.name} className="w-20 h-20 rounded-full object-cover shadow-sm border-2 border-white" />
                  {partner.online && (
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-green-400 animate-ping opacity-50 absolute"></div>
                    </div>
                  )}
                </Link>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <Link href={`/sellers/${partner.id}`} className="text-xl font-bold text-gray-900 group-hover:text-purple-700 hover:underline transition-colors">{partner.name}</Link>
                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{partner.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span className="text-yellow-500 text-lg leading-none">★</span>
                    <span className="font-bold text-gray-700">{partner.rating}</span>
                    <span>({partner.reviews} projects)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {partner.specialties.map(spec => (
                      <span key={spec} className="text-[11px] font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col gap-2 shrink-0">
                  <button className="w-full md:w-48 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-colors flex items-center justify-center gap-2 group-hover:scale-105 duration-300">
                    <Camera className="w-4 h-4" /> Live Video Call
                  </button>
                  <button 
                    onClick={() => openPartnerStore(partner)}
                    className="w-full md:w-48 py-3 bg-white border border-gray-200 hover:bg-gray-50 hover:border-purple-300 text-purple-700 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" /> View Products
                  </button>
                  <button className="w-full md:w-48 py-2 bg-transparent text-gray-500 hover:text-gray-700 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Message
                  </button>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-500 bg-white/50 backdrop-blur-md border border-gray-100 rounded-3xl">
                No factory partners match your criteria at this time.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );

  const renderGenerating = () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 text-white animate-in fade-in">
      <div className="w-32 h-32 mb-8 relative">
        <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-purple-400 animate-pulse" />
        </div>
      </div>
      <h2 className="text-3xl font-bold mb-4">Generating Design...</h2>
      <p className="text-gray-400">Applying {preferences.style} style with {preferences.cabinetColor} cabinets...</p>
      
      <div className="w-64 h-2 bg-gray-800 rounded-full mt-10 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-600 to-pink-500 animate-[pulse_2s_ease-in-out_infinite] w-full" style={{ width: '100%', animationDuration: '2s', transformOrigin: 'left', animationName: 'progress' }}></div>
      </div>
    </div>
  );

  const renderFinal = () => (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: 3D Preview & Cost */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group">
            <div className="aspect-[4/3] bg-gray-200 relative flex items-center justify-center overflow-hidden">
              {/* Mock 3D Render Image Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300"></div>
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-white/50 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4 border border-white/50 shadow-lg">
                  <Scan className="w-8 h-8 text-gray-700" />
                </div>
                <p className="font-bold text-gray-700 uppercase tracking-widest text-sm">Interactive 3D Kitchen</p>
                <p className="text-xs text-gray-500 mt-1">{preferences.style} • {preferences.cabinetColor} Cabinets</p>
              </div>
            </div>
            
            <div className="p-6 bg-white flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Estimated Total</p>
                <p className="text-3xl font-black text-gray-900">$24,500</p>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-3 bg-purple-900 hover:bg-purple-800 text-white rounded-xl font-bold transition-colors shadow-md">
                  Request Factory Quote
                </button>
              </div>
            </div>
          </div>

          {/* Account Creation Prompt */}
          <div className="bg-purple-900 rounded-3xl p-8 text-white shadow-xl mt-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full blur-[80px] opacity-50 -translate-y-1/2 translate-x-1/3"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-300" />
                  Save to Your Workspace
                </h3>
                <p className="text-purple-200">
                  You've mapped {savedScans.length > 0 ? savedScans.length : "your"} walls. Create a free account to save this 3D project to your dashboard and continue editing later!
                </p>
              </div>
              <div className="flex-shrink-0 flex flex-col gap-3 w-full md:w-auto">
                <button className="px-8 py-4 bg-white text-purple-900 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-md w-full">
                  Create Account
                </button>
                <button className="text-sm font-medium text-purple-300 hover:text-white transition-colors underline decoration-dotted underline-offset-4 text-center">
                  Sign in
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Cost Breakdown (Estimate)</h3>
            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between"><span className="text-gray-500">Cabinets ({preferences.cabinetColor})</span><span>$12,000</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Countertop ({preferences.countertop})</span><span>$4,500</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Accessories</span><span>$1,200</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Installation</span><span>$3,500</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>$800</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>$2,500</span></div>
              <div className="pt-3 mt-3 border-t flex justify-between font-bold text-gray-900"><span>Est. Manufacturing Time</span><span>4-6 Weeks</span></div>
            </div>
          </div>
        </div>

        {/* Right Side: Chat Interface */}
        <div className="w-full lg:w-96 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[600px] lg:h-auto">
          <div className="p-4 border-b flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">Kitchen AI Assistant</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-tr-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t bg-gray-50 rounded-b-3xl">
            <div className="relative">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Make cabinets white..." 
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!chatInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
              {["Use marble countertop", "Remove upper cabinets", "Add a kitchen island"].map(prompt => (
                <button 
                  key={prompt}
                  onClick={() => setChatInput(prompt)}
                  className="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-purple-300 hover:text-purple-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col font-sans">
      {/* Header with Stepper */}
      {step !== "scanning" && (
        <div className="flex flex-col border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">Apex Kitchen Studio</span>
            </div>
            
            {/* Premium Tab Navigation */}
            <div className="hidden md:flex items-center p-1.5 bg-gray-100/80 backdrop-blur-md rounded-full border border-gray-200 shadow-inner">
              {[
                { id: "welcome", label: "Scan Space", icon: <Camera className="w-4 h-4" />, matches: ["welcome", "uploading"] },
                { id: "results", label: "Analyze", icon: <Scan className="w-4 h-4" />, matches: ["processing", "results"] },
                { id: "questions", label: "Design", icon: <Sparkles className="w-4 h-4" />, matches: ["questions"] },
                { id: "final", label: "Final 3D", icon: <ImageIcon className="w-4 h-4" />, matches: ["generating", "final"] }
              ].map((s, i) => {
                const isActive = s.matches.includes(step);
                return (
                  <button
                    key={s.id}
                    onClick={() => setStep(s.id as Step)}
                    className={`
                      flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 relative z-10
                      ${isActive 
                        ? "text-purple-700 bg-white shadow-[0_4px_10px_rgba(0,0,0,0.05)] border border-gray-100/50 scale-105" 
                        : "text-gray-500 hover:text-purple-600 hover:bg-gray-200/50 hover:scale-105"}
                    `}
                  >
                    <span className={`${isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-purple-500'} transition-colors`}>
                      {s.icon}
                    </span>
                    {i + 1}. {s.label}
                  </button>
                );
              })}
            </div>

            <button onClick={onExit} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Global File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        multiple 
        className="hidden" 
        onChange={handlePhotoUpload} 
      />

      {/* Main Content Area */}
      {step === "welcome" && renderWelcome()}
      {step === "uploading" && renderUploading()}
      {step === "scanning" && renderScanning()}
      {step === "processing" && renderProcessing()}
      {step === "results" && renderResults()}
      {step === "questions" && renderQuestions()}
      {step === "generating" && renderGenerating()}
      {step === "final" && renderFinal()}

      {/* Slide-out Partner Storefront Drawer */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedPartner(null)}
          ></div>
          
          {/* Drawer */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <img src={selectedPartner.img} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{selectedPartner.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">Verified Partner Catalog</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPartner(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {loadingProducts ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
                  <p className="font-bold text-sm">Fetching factory inventory...</p>
                </div>
              ) : partnerProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {partnerProducts.map((product) => (
                    <Link href={`/products/${product.slug}`} key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group block">
                      <div className="aspect-square bg-gray-100 relative">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            <ImageIcon className="w-8 h-8 opacity-50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            className="px-4 py-2 bg-white text-gray-900 text-xs font-bold rounded-full shadow-lg hover:bg-gray-50 transform scale-90 group-hover:scale-100 transition-all"
                            onClick={(e) => {
                              e.preventDefault(); // Prevent navigating when just adding to project
                              // Add to project logic here
                            }}
                          >
                            Add to Project
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-sm text-gray-900 truncate mb-1" title={product.name}>{product.name}</h4>
                        <div className="flex items-end justify-between">
                          <span className="font-bold text-purple-700">${product.price.toLocaleString()}</span>
                          <span className="text-[10px] uppercase font-bold text-gray-400">/{product.price_type}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-center">
                  <div className="w-16 h-16 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">No Products Found</h4>
                  <p className="text-sm">This partner hasn't uploaded their digital catalog yet.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-white">
              <button 
                onClick={() => setSelectedPartner(null)}
                className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-md transition-colors"
              >
                Back to Design Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




