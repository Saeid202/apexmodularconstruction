"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { X } from "lucide-react";
import { AffiliateLoginForm } from "@/app/affiliate/(auth)/login/AffiliateLoginForm";
import { AffiliateRegisterForm } from "@/app/affiliate/(auth)/register/AffiliateRegisterForm";

interface AffiliateAuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
}

export function AffiliateAuthModal({
  isOpen,
  initialMode = "register",
  onClose,
}: AffiliateAuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "login" ? "Affiliate Partner Login" : "Affiliate Partner Sign Up"}
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
        {/* Top brand line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#4B1D8F] to-[#D4AF37]" />

        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-8">
          <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "login"
                  ? "text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={mode === "login" ? { backgroundColor: "#4B1D8F" } : {}}
            >
              Affiliate Login
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "register"
                  ? "text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={mode === "register" ? { backgroundColor: "#4B1D8F" } : {}}
            >
              Affiliate Sign Up
            </button>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {mode === "login" ? "Affiliate Partner Hub" : "Join Affiliate Program"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {mode === "login"
              ? "Access your referrals, commissions, and marketing assets."
              : "Earn commissions by sharing Apex Modular Construction products."}
          </p>

          {mode === "login" ? (
            <AffiliateLoginForm onSuccess={onClose} />
          ) : (
            <AffiliateRegisterForm onSuccess={onClose} onToggleLogin={() => setMode("login")} />
          )}
        </div>
      </div>
    </div>
  );
}
