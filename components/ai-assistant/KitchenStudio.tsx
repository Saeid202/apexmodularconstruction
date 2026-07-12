"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, Upload, Ruler, Loader2, CheckCircle2, ChevronRight, X, Scan, Send, MessageCircle, Sparkles } from "lucide-react";
import { ARScanner } from "@/components/kitchen-studio/ARScanner";

const CP_PURPLE = "#4B1D8F";
const CP_GOLD = "#D4AF37";

type Step = 
  | "welcome"
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

export function KitchenStudio({ onExit }: { onExit: () => void }) {
  const [step, setStep] = useState<Step>("welcome");
  const [scanProgress, setScanProgress] = useState(0);
  const [processingPhase, setProcessingPhase] = useState("Analyzing Kitchen...");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  
  // Real Camera & AR State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<{name: string, top: number, left: number, delay: number}[]>([]);
  
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
    setStep("scanning");
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
    <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-10 space-y-4">
        <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-white shadow-xl mb-6 bg-gradient-to-br from-purple-600 to-purple-900">
          <Scan className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Apex Kitchen Studio</h1>
        <p className="text-lg text-gray-600">
          Hello! I'll help you design your dream kitchen. How would you like to begin?
        </p>
      </div>
      
      <div className="grid gap-4 w-full">
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

        <button className="flex items-center p-6 border-2 border-transparent bg-gray-50 rounded-2xl hover:bg-white hover:border-gray-200 hover:shadow-lg transition-all group">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-bold text-gray-900 text-lg">Upload Kitchen Photos</h3>
            <p className="text-sm text-gray-500">AI will analyze photos from your gallery</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </button>

        <button className="flex items-center p-6 border-2 border-transparent bg-gray-50 rounded-2xl hover:bg-white hover:border-gray-200 hover:shadow-lg transition-all group">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 mr-4 group-hover:scale-110 transition-transform">
            <Ruler className="w-6 h-6" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-bold text-gray-900 text-lg">Enter Measurements</h3>
            <p className="text-sm text-gray-500">Manually input your room dimensions</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
        </button>
      </div>
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

  const renderResults = () => (
    <div className="flex-1 overflow-y-auto p-6 lg:p-12 animate-in fade-in slide-in-from-bottom-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Kitchen Successfully Scanned</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6 text-gray-900">Detected Elements</h3>
            <div className="space-y-4">
              {[
                "Room Length (14' 2\")", "Room Width (12' 8\")", "Ceiling Height (9' 0\")", 
                "Window Locations (2)", "Door Locations (1)", "Sink Position", 
                "Refrigerator Position", "Stove Position", "Existing Cabinets"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group">
            {/* Mock 3D Room Preview */}
            <div className="absolute inset-0 bg-gray-100 opacity-50"></div>
            <div className="relative z-10 w-48 h-48 border-2 border-purple-200 rounded-lg transform perspective-1000 rotateX-45 rotateZ-45 flex items-center justify-center shadow-2xl bg-white/80 backdrop-blur">
              <span className="text-purple-900 font-bold uppercase tracking-widest text-xs rotate-[-45deg]">3D Room Wireframe</span>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button onClick={() => setStep("questions")} className="px-8 py-4 bg-purple-900 text-white rounded-full font-bold text-lg hover:bg-purple-800 transition-colors shadow-xl flex items-center gap-2 mx-auto">
            Start Designing <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderQuestions = () => {
    if (questionIndex < questions.length) {
      const q = questions[questionIndex];
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white animate-in slide-in-from-right-8 duration-300">
          <div className="max-w-2xl w-full">
            <div className="mb-8">
              <p className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-2">Question {questionIndex + 1} of {questions.length + 1}</p>
              <h2 className="text-3xl font-bold text-gray-900">{q.title}</h2>
            </div>
            <div className="grid gap-3">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleOptionSelect(opt)}
                  className="p-5 text-left border border-gray-200 rounded-2xl hover:border-purple-600 hover:bg-purple-50 transition-all font-medium text-lg text-gray-700 hover:text-purple-900 shadow-sm"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    } else {
      // Multi-select features
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white animate-in slide-in-from-right-8">
          <div className="max-w-2xl w-full">
            <div className="mb-8">
              <p className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-2">Final Question</p>
              <h2 className="text-3xl font-bold text-gray-900">{multiSelectQuestion.title}</h2>
              <p className="text-gray-500 mt-2">Select all that apply.</p>
            </div>
            <div className="grid gap-3 mb-8">
              {multiSelectQuestion.options.map((opt) => {
                const isSelected = preferences.features.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleFeature(opt)}
                    className={`p-5 text-left border rounded-2xl transition-all font-medium text-lg flex items-center justify-between ${
                      isSelected 
                        ? "border-purple-600 bg-purple-50 text-purple-900" 
                        : "border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-gray-50"
                    }`}
                  >
                    {opt}
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-purple-600" />}
                  </button>
                );
              })}
            </div>
            <button onClick={submitFeatures} className="w-full py-4 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-black transition-colors shadow-lg">
              Generate Kitchen Design
            </button>
          </div>
        </div>
      );
    }
  };

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
                <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 transition-colors">
                  Save Design
                </button>
                <button className="px-6 py-3 bg-purple-900 hover:bg-purple-800 text-white rounded-xl font-bold transition-colors shadow-md">
                  Request Factory Quote
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
      {/* Header */}
      {step !== "scanning" && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Apex Kitchen Studio</span>
            {step === "questions" && <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-bold uppercase tracking-wider">Design Mode</span>}
          </div>
          <button onClick={onExit} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {step === "welcome" && renderWelcome()}
      {step === "scanning" && renderScanning()}
      {step === "processing" && renderProcessing()}
      {step === "results" && renderResults()}
      {step === "questions" && renderQuestions()}
      {step === "generating" && renderGenerating()}
      {step === "final" && renderFinal()}

    </div>
  );
}


