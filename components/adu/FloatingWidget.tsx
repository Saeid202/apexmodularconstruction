"use client";

import React, { useState } from 'react';
import { MessageCircle, X, Bot, Phone, Maximize2, Minimize2 } from 'lucide-react';
import { ADUChatbot } from './ADUChatbot';
import { cn } from '@/lib/utils';

export function FloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'whatsapp'>('ai');
  const [isMaximized, setIsMaximized] = useState(false);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = "whatsapp://send?phone=14168825015&text=Hi%20Apex Modular Construction%2C%20I%20have%20a%20question.";
    setTimeout(() => {
      window.open("https://wa.me/14168825015?text=Hi%20Apex Modular Construction%2C%20I%20have%20a%20question.", "_blank");
    }, 1000);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setIsMaximized(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <div 
          className={cn(
            "bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden mb-6 border-2 transition-all duration-500 ease-in-out animate-in fade-in zoom-in slide-in-from-bottom-10",
            isMaximized 
              ? "w-[96vw] h-[92vh] sm:h-[90vh]" 
              : "w-[90vw] sm:w-[650px] h-[750px] max-h-[85vh]"
          )}
          style={{ borderColor: "#4B1D8F20" }}
        >
          {/* Header */}
          <div className="p-5 text-white flex justify-between items-center shrink-0" style={{ backgroundColor: "#4B1D8F" }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6" style={{ color: "#4B1D8F" }} />
              </div>
              <div>
                <h3 className="font-black text-base leading-tight tracking-tight text-white">Apex Modular Construction AI</h3>
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">System Online</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
               <button 
                onClick={() => setIsMaximized(!isMaximized)}
                className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all hidden sm:block"
                title={isMaximized ? "Minimize" : "Maximize"}
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={toggleOpen}
                className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-50/50 p-1.5 mx-5 mt-5 rounded-2xl border border-gray-100 shrink-0">
            <button
              className={`flex-1 py-3 text-xs font-black uppercase tracking-tight rounded-xl flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'ai' 
                  ? 'bg-white text-purple-700 shadow-sm border border-gray-100' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('ai')}
            >
              <Bot className="w-4 h-4" />
              <span>AI Checker</span>
            </button>
            <button
              className={`flex-1 py-3 text-xs font-black uppercase tracking-tight rounded-xl flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'whatsapp' 
                  ? 'bg-white text-[#25D366] shadow-sm border border-gray-100' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('whatsapp')}
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'ai' ? (
              <ADUChatbot />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 animate-in fade-in duration-300">
                <div className="relative">
                  <div className="w-24 h-24 bg-green-50 text-[#25D366] rounded-[2.5rem] flex items-center justify-center border-4 border-white shadow-xl shadow-green-100">
                    <Phone className="w-10 h-10" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-gray-900 tracking-tight">Direct Support</h4>
                  <p className="text-sm text-gray-500 leading-relaxed font-medium max-w-[280px] mx-auto">
                    Questions about material sourcing or prefab logistics? Chat with us live.
                  </p>
                </div>
                <button 
                  onClick={handleWhatsAppClick}
                  className="w-full max-w-[280px] bg-[#25D366] text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-green-100 hover:bg-[#1eb956] hover:shadow-green-200 transition-all flex items-center justify-center space-x-3 active:scale-95"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>START WHATSAPP CHAT</span>
                </button>
                <div className="flex items-center space-x-1.5 opacity-50">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                   <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Avg Response: 15min</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="group relative"
        >
          <div className="absolute -inset-3 bg-purple-600 rounded-full blur-lg opacity-40 group-hover:opacity-80 transition duration-500 animate-pulse"></div>
          <div className="relative text-white h-16 w-16 sm:h-20 sm:w-20 rounded-[2rem] shadow-2xl flex flex-col items-center justify-center transform group-hover:-translate-y-2 transition-all duration-500 border border-white/10 group-active:scale-90" style={{ backgroundColor: "#4B1D8F" }}>
             <Bot className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-500" />
             <div className="absolute -top-1 -right-1 w-6 h-6 border-4 rounded-full shadow-lg" style={{ backgroundColor: "#4B1D8F", borderColor: "#4B1D8F" }}></div>
          </div>
        </button>
      )}
    </div>
  );
}
