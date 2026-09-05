"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageCircle, ArrowRight, Loader2 } from "lucide-react";

const CP_PURPLE = "#4B1D8F";
const CP_GOLD = "#D4AF37";

interface Message {
  role: "user" | "assistant";
  content: string;
  showPropertyAnalysisButton?: boolean;
}

import { KitchenStudio } from "./KitchenStudio";

const ACTION_CARDS = [
  {
    title: "Design My Kitchen",
    icon: "🍳",
    action: "kitchen_design"
  },
  {
    title: "Design Modular Home",
    icon: "🏠",
    action: "modular_design"
  },
  {
    title: "Building Permit Assistant",
    icon: "📋",
    action: "permit_assistant"
  }
];

interface ApexAIAssistantProps {
  /**
   * Render the assistant's own title bar. The floating widget supplies its own
   * header with the same title and status, so it opts out — otherwise "Apex AI
   * Assistant" appears twice, one row above the other.
   */
  showHeader?: boolean
}

export function ApexAIAssistant({ showHeader = true }: ApexAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPropertyAnalysis, setShowPropertyAnalysis] = useState(false);
  const [activeMode, setActiveMode] = useState<"chat" | "kitchen_design" | null>(null);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    setInput("");
    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      
      // Detect if the AI recognized a Canadian property analysis intent
      const shouldOfferPropertyAnalysis = 
        data.message.toLowerCase().includes("ontario") ||
        data.message.toLowerCase().includes("canada") ||
        data.message.toLowerCase().includes("property") ||
        data.message.toLowerCase().includes("zoning") ||
        data.message.toLowerCase().includes("permit");

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        showPropertyAnalysisButton: shouldOfferPropertyAnalysis && !showPropertyAnalysis,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Extract location if mentioned
      if (messageText.toLowerCase().includes("land in")) {
        const match = messageText.match(/land in\s+([A-Za-z\s]+)/i);
        if (match) setUserLocation(match[1].trim());
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyAnalysis = () => {
    setShowPropertyAnalysis(true);
    // Redirect or open the property analysis page
    window.location.href = "/property-feasibility";
  };

  const handleActionSelect = (action: string) => {
    if (action === "kitchen_design") {
      setActiveMode("kitchen_design");
    } else if (action === "permit_assistant") {
      handlePropertyAnalysis();
    } else {
      sendMessage("I want to design a modular home. Where do I start?");
    }
  };

  if (activeMode === "kitchen_design") {
    return <KitchenStudio onExit={() => setActiveMode(null)} />;
  }

  const isLandingView = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header — a brand-tinted icon tile with a purple glyph, matching the icon
          tiles used across the marketing pages, instead of a solid purple fill. */}
      {showHeader && (
        <div className="border-b border-neutral-200 px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-tint)] text-[#4B1D8F]"
              >
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-[17px] font-semibold tracking-[-0.01em] text-neutral-900">
                  Apex AI Assistant
                </h1>
                <p className="text-xs text-neutral-500">Your modular construction expert</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {isLandingView ? (
            // Landing View with Suggested Prompts
            // This component renders both full-page at /ai-assistant and inside the
            // ~650px floating panel, so the display type is sized to work in the
            // narrower of the two. It was text-5xl/6xl, which overflowed the panel.
            <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">
              <div className="mb-10 max-w-2xl space-y-3">
                <h2 className="text-2xl font-semibold tracking-[-0.02em] text-balance text-neutral-900 sm:text-3xl">
                  Ask anything about our modular buildings
                </h2>
                <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-neutral-600">
                  Get instant answers about products, pricing, shipping, installation and more.
                </p>
              </div>

              {/* Suggested Prompts / Action Cards */}
              <div className="mb-10 w-full max-w-xl">
                <p className="mb-4 text-[11px] font-semibold tracking-[0.16em] text-neutral-400 uppercase">
                  What would you like to build?
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  {ACTION_CARDS.map((card, index) => (
                    <button
                      key={index}
                      onClick={() => handleActionSelect(card.action)}
                      className="group hover:shadow-card flex items-center gap-3.5 rounded-2xl border border-neutral-200 bg-white p-4 text-left transition-all hover:border-neutral-300 hover:bg-[var(--surface-subtle)] focus-visible:ring-2 focus-visible:ring-[#6B35B8] focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      <span aria-hidden className="text-2xl">
                        {card.icon}
                      </span>
                      <p className="text-[15px] font-medium text-neutral-900 group-hover:text-[#4B1D8F]">
                        {card.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Chat View
            <div className="flex-1 space-y-6 px-4 py-8 sm:px-6">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-3`}
                >
                  <div
                    className={`max-w-xl ${
                      msg.role === "user"
                        ? "bg-purple-100 text-gray-900 rounded-3xl rounded-tr-none px-6 py-3"
                        : "space-y-3 max-w-lg"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-start gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-md"
                          style={{ backgroundColor: CP_PURPLE }}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 leading-relaxed text-sm">{msg.content}</p>
                          {msg.showPropertyAnalysisButton && (
                            <button
                              onClick={handlePropertyAnalysis}
                              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md text-white"
                              style={{
                                backgroundColor: CP_PURPLE,
                              }}
                            >
                              Analyze My Property
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {msg.role === "user" && (
                      <p className="text-sm font-medium">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-3 animate-in fade-in">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-md"
                    style={{ backgroundColor: CP_PURPLE }}
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t px-4 py-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && sendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: CP_PURPLE,
                color: "white",
                opacity: isLoading || !input.trim() ? 0.5 : 1,
                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
              }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Apex AI can make mistakes. Always verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
