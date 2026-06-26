"use client";

import React, { useState } from 'react';
import { X, Bot, Maximize2, Minimize2 } from 'lucide-react';
import { ApexAIAssistant } from '@/components/ai-assistant/ApexAIAssistant';
import { cn } from '@/lib/utils';

export function FloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

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
                <h3 className="font-black text-base leading-tight tracking-tight text-white">Apex AI Assistant</h3>
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

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            <ApexAIAssistant />
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="group relative"
        >
          <div className="relative text-white h-16 w-16 sm:h-20 sm:w-20 rounded-[2rem] flex flex-col items-center justify-center transform group-hover:-translate-y-2 transition-all duration-500 border border-white/10 group-active:scale-90" style={{ backgroundColor: "#4B1D8F" }}>
             <Bot className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-500" />
             <div className="absolute -top-1 -right-1 w-6 h-6 border-4 rounded-full" style={{ backgroundColor: "#4B1D8F", borderColor: "#4B1D8F" }}></div>
          </div>
        </button>
      )}
    </div>
  );
}
