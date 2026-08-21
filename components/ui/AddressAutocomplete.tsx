"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddressSuggestion } from "@/types/address";
import { locationService } from "@/lib/services/locationService";

interface AddressAutocompleteProps {
  onAddressSelect: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({
  onAddressSelect,
  placeholder = "Enter property address",
  className
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await locationService.searchAddress(query);
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.text || "");
    setSuggestions([]);
    setIsOpen(false);
    onAddressSelect(suggestion);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative group">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-600 group-focus-within:scale-110 transition-transform" />
        <input
          type="text"
          className="w-full pl-9 pr-10 py-3 bg-white border-2 border-purple-100 rounded-2xl text-sm font-medium shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-500 placeholder:text-gray-400 transition-all"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 3 && suggestions.length > 0 && setIsOpen(true)}
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-purple-500" />
        ) : query && (
          <button 
            onClick={() => { setQuery(""); setSuggestions([]); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="py-1 max-h-60 overflow-y-auto scrollbar-hide">
            {suggestions.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => handleSelect(s)}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-purple-50 flex items-start space-x-3 transition-colors border-b border-gray-50 last:border-0"
                >
                  <MapPin className="h-4 w-4 mt-0.5 text-purple-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-gray-800 font-bold">{s.text}</span>
                    <span className="text-[10px] text-gray-400">Ontario, Canada</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
