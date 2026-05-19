"use client";

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  ArrowRight, CheckCircle2, MapPin, 
  Send, Bot, User, RefreshCcw, Download, Sparkles,
  Search, HelpCircle, MessageSquare, ChevronDown, Plus, ShieldCheck,
  Calendar, ClipboardCheck, ArrowDownCircle, RotateCcw, FilePlus, Home,
  Info, LayoutGrid, Zap, X, Upload, FileText, Image as ImageIcon
} from 'lucide-react';
import { aduService, ADUCheckInputs, ADUReportData } from '@/lib/services/aduService';
import { InteractiveProductCard } from './InteractiveProductCard';

const AddressAutofill = dynamic(
  () => import('@mapbox/search-js-react').then((mod) => mod.AddressAutofill),
  { ssr: false }
);
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
// Apex Modular Construction Luxury Branding
const CP_PURPLE = "#4B1D8F"; 
const CP_GOLD = "#D4AF37"; 

export function ADUChatbot() {
  const [step, setStep] = useState<'form' | 'loading' | 'chat'>('form');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [inputs, setInputs] = useState<ADUCheckInputs & { designImage?: string }>({ 
    address: '', 
    intendedUse: '',
    designImage: '' 
  });
  const [report, setReport] = useState<ADUReportData | null>(null);
  
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'bot', text?: string, isReport?: boolean}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-trigger logic
  useEffect(() => {
    if (inputs.address && inputs.intendedUse && step === 'form') {
      // We don't auto-trigger if they haven't finished the optional upload
      // or we can just let them click 'Analyze' manually now.
    }
  }, [inputs.address, inputs.intendedUse]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputs(prev => ({ ...prev, designImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!inputs.address || !inputs.intendedUse) return;
    setStep('loading');
    try {
      const data = await aduService.checkFeasibility(inputs);
      setReport(data);
      setChatMessages([{ role: 'bot', isReport: true }]);
      setStep('chat');
    } catch (e) { setStep('form'); }
  };

  const startGeneralChat = (welcomeText: string) => {
    setStep('chat');
    setChatMessages([{ 
      role: 'bot', 
      text: `Welcome to Apex Modular Construction! I'm your Technical Sales Specialist. ${welcomeText} How can I help you today?` 
    }]);
  };

  const resetSession = () => {
    setStep('form');
    setShowAddressForm(false);
    setInputs({ address: '', intendedUse: '', designImage: '' });
    setReport(null);
    setChatMessages([]);
  };

  const handleSendChat = async (overrideInput?: string) => {
    const textToSend = overrideInput || chatInput;
    if (!textToSend.trim()) return;

    if (!overrideInput) setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    
    setIsChatLoading(true);
    try {
      const response = await aduService.chatFollowUp(textToSend, report || undefined);
      setChatMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'bot', text: "Service temporarily unavailable." }]);
    } finally { setIsChatLoading(false); }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden font-sans relative">
      
      {/* GLOBAL HEADER */}
      {step !== 'form' && (
        <div className="px-6 py-4 border-b flex items-center justify-between bg-white/80 backdrop-blur-md z-30 sticky top-0">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: CP_PURPLE }}>
               <ShieldCheck className="w-5 h-5" />
             </div>
             <span className="text-xs font-black uppercase tracking-widest text-black">
               {report ? "Active Feasibility" : "Apex Modular Construction Assistant"}
             </span>
          </div>
          <button onClick={resetSession} className="flex items-center space-x-2 px-4 py-2 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-purple-50 group" style={{ color: CP_PURPLE, borderColor: `${CP_PURPLE}20` }}>
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-transform" />
            <span>New Search</span>
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
        {step === 'form' && (
          <div className="h-full flex flex-col items-center justify-start pt-16 p-8 max-w-5xl mx-auto animate-in fade-in duration-1000">
            <div className="space-y-4 text-center mb-12">
              <div className="inline-flex items-center space-x-3 px-6 py-2 rounded-full border shadow-sm" style={{ borderColor: CP_GOLD, backgroundColor: `${CP_GOLD}10` }}>
                <Sparkles className="w-4 h-4" style={{ color: CP_GOLD }} />
                <span className="text-[11px] font-[900] uppercase tracking-[0.3em]" style={{ color: CP_PURPLE }}>Apex Modular Construction Royal Intelligence</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-[1000] text-gray-900 tracking-tighter leading-tight">
                Industrial Intelligence <span style={{ color: CP_PURPLE }}>Applied.</span>
              </h1>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em]">Planning • Precision • Prefab Performance</p>
            </div>

            {!showAddressForm ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mb-12 animate-in fade-in zoom-in duration-700">
                 {[
                   { label: "General Inquiry", icon: MessageSquare, welcome: "I can help you with general questions about building an ADU or modular units." },
                   { label: "Our Models", icon: LayoutGrid, welcome: "I have our full catalog of prefab models ready. Just tell me what size you are looking for." },
                   { label: "Technical Process", icon: Info, welcome: "I can explain our technical feasibility and construction process step-by-step." }
                 ].map((action, i) => (
                   <button 
                      key={i}
                      onClick={() => startGeneralChat(action.welcome)}
                      className="flex flex-col items-start p-6 rounded-[32px] border-2 bg-white transition-all hover:shadow-xl hover:-translate-y-1 text-left group shadow-sm hover:border-purple-200"
                      style={{ borderColor: `${CP_PURPLE}10` }}
                   >
                     <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:bg-purple-100" style={{ backgroundColor: `${CP_PURPLE}08` }}>
                       <action.icon className="w-5 h-5" style={{ color: CP_PURPLE }} />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Interactive AI</span>
                     <span className="text-sm font-[1000] text-black">{action.label}</span>
                   </button>
                 ))}
                 
                 <button 
                    onClick={() => setShowAddressForm(true)}
                    className="sm:col-span-3 mt-4 flex items-center justify-between p-8 rounded-[40px] border-4 border-dashed bg-gray-50/50 hover:bg-white hover:border-solid transition-all group"
                    style={{ borderColor: `${CP_GOLD}44` }}
                 >
                    <div className="flex items-center space-x-6">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform" style={{ backgroundColor: CP_PURPLE }}>
                        <MapPin className="w-7 h-7" />
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-[1000] text-black tracking-tight">Analyze My Property Feasibility</p>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Zoning, Bylaws & Site Capacity</p>
                      </div>
                    </div>
                    <ArrowRight className="w-8 h-8 text-gray-300 group-hover:text-black group-hover:translate-x-2 transition-all" />
                 </button>
              </div>
            ) : (
              <div className="w-full max-w-2xl animate-in slide-in-from-bottom-12 duration-700 pb-24">
                <div className="flex items-center justify-between mb-8">
                  <button onClick={() => setShowAddressForm(false)} className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    <span>Back to Quick Actions</span>
                  </button>
                  <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border" style={{ borderColor: CP_GOLD, color: CP_GOLD }}>Feasibility Mode</div>
                </div>

                <div className="relative group space-y-6">
                  <div className="absolute -inset-1 rounded-[44px] opacity-10 group-hover:opacity-20 transition duration-500 blur-md" style={{ backgroundColor: CP_GOLD }}></div>
                  <div className="relative bg-white rounded-[36px] shadow-2xl border-2 flex flex-col overflow-hidden" style={{ borderColor: CP_GOLD }}>
                    
                    {/* SECTION 1: ADDRESS */}
                    <div className="p-8 border-b border-gray-100 bg-gray-50/50 focus-within:bg-white transition-colors">
                      <div className="flex items-center space-x-3 mb-4">
                        <MapPin className="w-5 h-5" style={{ color: CP_PURPLE }} />
                        <label className="text-xs font-[1000] uppercase tracking-[0.2em]" style={{ color: CP_PURPLE }}>1. Property Address</label>
                      </div>
                      <AddressAutofill accessToken={MAPBOX_TOKEN} onRetrieve={(res: any) => setInputs(p => ({...p, address: res.features[0].properties.full_address}))}>
                        <input type="text" placeholder="Search for an address..." className="w-full bg-transparent border-none focus:ring-0 font-[1000] text-2xl placeholder:text-gray-300 text-black p-0" value={inputs.address} onChange={(e) => setInputs({...inputs, address: e.target.value})} />
                      </AddressAutofill>
                    </div>

                    {/* SECTION 2: USE */}
                    <div className="p-8 border-b border-gray-100 bg-white">
                      <div className="flex items-center space-x-3 mb-4">
                        <Search className="w-5 h-5 text-gray-400" />
                        <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">2. Intended Site Use</label>
                      </div>
                      <div className="relative">
                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <select className="w-full pl-0 pr-12 bg-transparent border-none focus:ring-0 font-[1000] text-2xl appearance-none cursor-pointer text-black p-0" value={inputs.intendedUse} onChange={(e) => setInputs({...inputs, intendedUse: e.target.value})}>
                          <option value="">Select an option...</option>
                          <option>Rental Income</option>
                          <option>Family Use</option>
                          <option>Home Office</option>
                          <option>Airbnb</option>
                        </select>
                      </div>
                    </div>

                    {/* SECTION 3: DESIGN UPLOAD (NEW) */}
                    <div className="p-8 bg-gray-50/30">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                          <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">3. Design / Drawing (Optional)</label>
                        </div>
                        {inputs.designImage && (
                          <button onClick={() => setInputs(p => ({...p, designImage: ''}))} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Remove</button>
                        )}
                      </div>
                      
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-3xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${inputs.designImage ? 'bg-white border-purple-200' : 'bg-white/50 border-gray-200 hover:border-purple-300 hover:bg-white'}`}
                      >
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                        {inputs.designImage ? (
                          <div className="flex items-center space-x-4 w-full">
                            <img src={inputs.designImage} className="w-16 h-16 rounded-xl object-cover border shadow-sm" alt="Upload" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-[1000] text-black truncate">Design drawing attached</p>
                              <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Ready for AI Vision analysis</p>
                            </div>
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                              <Upload className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-gray-900">Upload Site Plan or Drawing</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">AI will analyze your design for permits</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={startAnalysis}
                    disabled={!inputs.address || !inputs.intendedUse}
                    className="w-full p-8 rounded-[36px] text-white font-black text-xl tracking-widest uppercase shadow-2xl transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden"
                    style={{ backgroundColor: CP_PURPLE }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="flex items-center justify-center space-x-4">
                      <span>Generate Full Intelligence Report</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'loading' && (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in duration-500">
            <div className="relative">
              <RefreshCcw className="w-16 h-16 text-purple-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Consulting Provincial Records & Zoning Bylaws...</p>
              {inputs.designImage && (
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em] animate-pulse">Running Vision AI Analysis on Design Drawing...</p>
              )}
            </div>
          </div>
        )}

        {step === 'chat' && (
          <div className="flex flex-col min-h-full pb-48">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`py-16 border-b border-gray-50 ${msg.role === 'bot' ? 'bg-white' : 'bg-gray-50/50'}`}>
                <div className="max-w-4xl mx-auto px-6 flex items-start space-x-8">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg border-2 ${msg.role === 'bot' ? 'text-white' : 'bg-white'}`} style={msg.role === 'bot' ? { backgroundColor: CP_PURPLE, borderColor: CP_GOLD } : { borderColor: `${CP_PURPLE}20` }}>
                    {msg.role === 'bot' ? <Bot className="w-5 h-5" style={{ color: CP_GOLD }} /> : <User className="w-5 h-5 text-gray-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    {msg.isReport && report ? (
                      <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-4xl">
                        <div className="space-y-6">
                          <h4 className="text-[12px] font-black uppercase tracking-[0.5em]" style={{ color: CP_GOLD }}>Zoning Status</h4>
                          <div className="space-y-4">
                            {(report.generalAllowance || []).map((line, i) => (
                              <p key={i} className="text-2xl font-[1000] text-black leading-tight tracking-tighter">{line}</p>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-6 bg-gray-50 p-8 rounded-[40px] border-2 border-gray-100 shadow-sm">
                          <div className={`px-12 py-6 rounded-[28px] font-[1000] text-xl text-white shadow-2xl border-2 ${report.statusColor === 'green' ? 'bg-green-600 border-green-400' : report.statusColor === 'yellow' ? 'bg-orange-500 border-orange-300' : 'bg-red-600 border-red-400'}`}>
                            {report.status}
                          </div>
                          <p className="text-2xl font-bold text-gray-500 leading-snug flex-1">{report.explanation}</p>
                        </div>

                        {report.recommendedModels && report.recommendedModels.length > 0 && (
                          <div className="space-y-10 pt-16 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <h4 className="text-[14px] font-[1000] uppercase tracking-[0.6em]" style={{ color: CP_GOLD }}>Compatible Apex Modular Construction Models</h4>
                                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Recommended Prefab Units for this lot</p>
                              </div>
                              <Home className="w-8 h-8 opacity-10" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {report.recommendedModels.map((model, i) => (
                                <div key={i} className="group relative overflow-hidden bg-white border-2 rounded-[40px] p-8 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1 cursor-pointer" style={{ borderColor: `${CP_PURPLE}15` }}>
                                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity"><Sparkles className="w-12 h-12" /></div>
                                  <div className="space-y-4">
                                    <div className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg" style={{ backgroundColor: CP_PURPLE }}>Best Fit Model</div>
                                    <h3 className="text-3xl font-[1000] text-black tracking-tighter leading-none">{model}</h3>
                                    <p className="text-gray-400 font-bold text-sm">Engineered for local zoning compliance and rapid site integration.</p>
                                    <div className="flex items-center space-x-2 text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: CP_GOLD }}><span>View Specifications</span><ArrowRight className="w-4 h-4" /></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-10 pt-16 border-t border-gray-100">
                          <h4 className="text-[12px] font-black text-gray-300 uppercase tracking-[0.5em]">Required Approvals</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(report.requiredApprovals || []).map((app, i) => (
                              <div key={i} className="flex items-center space-x-5 p-7 bg-white border-[3px] rounded-[36px] font-[900] text-lg text-black shadow-sm" style={{ borderColor: `${CP_PURPLE}08` }}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg" style={{ backgroundColor: `${CP_GOLD}` }}><CheckCircle2 className="w-5 h-5 text-white" /></div>
                                <span>{app}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-12 pt-20 border-t border-gray-100 relative">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <h4 className="text-[14px] font-[1000] uppercase tracking-[0.6em]" style={{ color: CP_GOLD }}>Implementation Roadmap</h4>
                              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Technical Project Path</p>
                            </div>
                            <Calendar className="w-8 h-8 opacity-10" />
                          </div>
                          <div className="space-y-1 relative pl-4">
                            <div className="absolute left-10 top-10 bottom-10 w-1 bg-gray-100 rounded-full" />
                            {(report.nextSteps || []).map((step, i) => (
                              <div key={i} className="relative flex items-center space-x-12 group pb-12 last:pb-0">
                                <div className="w-12 h-12 rounded-[20px] text-white flex items-center justify-center text-lg font-black shadow-2xl transition-all group-hover:scale-110 border-4 z-10 shrink-0" style={{ backgroundColor: CP_PURPLE, borderColor: CP_GOLD }}>{i+1}</div>
                                <div className="flex-1 p-8 bg-gray-50/50 rounded-[36px] border-2 border-transparent transition-all group-hover:border-gray-100 group-hover:bg-white shadow-sm group-hover:shadow-xl">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: CP_PURPLE }}>Phase 0{i+1}</h5>
                                    <ArrowDownCircle className="w-4 h-4 opacity-0 group-hover:opacity-20 transition-opacity" />
                                  </div>
                                  <p className="text-3xl font-[1000] text-black tracking-tight leading-tight">{step}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="pt-20">
                            <div className="p-12 rounded-[48px] bg-gray-50 border-4 border-dashed border-gray-200 flex flex-col items-center text-center space-y-6">
                              <div className="w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-xl" style={{ backgroundColor: CP_PURPLE }}><FilePlus className="w-8 h-8" /></div>
                              <div className="space-y-2">
                                <h3 className="text-2xl font-black text-black">Analyze Another Site?</h3>
                                <p className="text-gray-400 font-bold max-w-sm mx-auto">Click below to clear the current report and start a new feasibility assessment.</p>
                              </div>
                              <button onClick={resetSession} className="px-10 py-5 text-white rounded-[24px] font-black text-sm tracking-widest uppercase shadow-2xl transition-all active:scale-95 flex items-center space-x-3" style={{ backgroundColor: CP_PURPLE }}>
                                <Plus className="w-5 h-5" /><span>Start New Assessment</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xl font-bold text-black leading-relaxed whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-2">
                        {msg.text?.split(/(\[PRODUCT: [a-z0-9-]+\])/g).map((part, i) => {
                          const match = part.match(/\[PRODUCT: ([a-z0-9-]+)\]/);
                          if (match) {
                            return <InteractiveProductCard key={i} slug={match[1]} />;
                          }
                          return <span key={i}>{part}</span>;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-6 flex items-start space-x-8">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg border-2 animate-pulse" style={{ backgroundColor: CP_PURPLE, borderColor: CP_GOLD }}>
                    <Bot className="w-5 h-5" style={{ color: CP_GOLD }} />
                  </div>
                  <div className="flex-1 space-y-2 pt-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" /><div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* CHAT INPUT AREA (ONLY FOR CHAT STEP) */}
      {step === 'chat' && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-12 pb-10 z-50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 rounded-[32px] opacity-10 group-focus-within:opacity-40 transition duration-500 blur-md" style={{ backgroundColor: CP_GOLD }}></div>
              <div className="relative flex items-center bg-white border-2 rounded-[32px] shadow-2xl transition-all p-2 pl-8 pr-3" style={{ borderColor: CP_PURPLE }}>
                <input type="text" placeholder="Ask follow-up questions..." className="flex-1 bg-transparent border-none py-5 text-xl font-bold text-black focus:ring-0 placeholder:text-gray-300" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendChat()} />
                <button onClick={() => handleSendChat()} disabled={isChatLoading || !chatInput.trim()} className="p-5 rounded-[24px] shadow-lg transition-all active:scale-95 disabled:opacity-20 border" style={{ backgroundColor: CP_PURPLE, borderColor: CP_GOLD }}>
                  <Send className="w-6 h-6" style={{ color: CP_GOLD }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
