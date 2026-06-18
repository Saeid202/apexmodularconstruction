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

const SUGGESTED_PROMPTS = [
  "Which modular home is right for me?",
  "Compare expandable vs container homes",
  "Can you ship to my country?",
  "How much does installation cost?",
  "What's included with this model?",
];

export function ApexAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPropertyAnalysis, setShowPropertyAnalysis] = useState(false);
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

  const isLandingView = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b px-4 py-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: CP_PURPLE }}
            >
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">Apex AI Assistant</h1>
              <p className="text-xs text-gray-500">Your modular construction expert</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {isLandingView ? (
            // Landing View with Suggested Prompts
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
              <div className="mb-12 space-y-3 max-w-3xl">
                <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight">
                  Ask anything about our modular buildings
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Get instant answers about products, pricing, shipping, installation, and more
                </p>
              </div>

              {/* Suggested Prompts */}
              <div className="w-full max-w-2xl space-y-4 mb-16">
                <p className="text-sm font-semibold text-gray-600 mb-5">Try asking:</p>
                <div className="grid gap-3 grid-cols-1">
                  {SUGGESTED_PROMPTS.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(prompt)}
                      className="p-4 border border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-left group hover:shadow-md"
                    >
                      <p className="text-sm font-medium text-gray-900 group-hover:text-purple-900">
                        {prompt}
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
