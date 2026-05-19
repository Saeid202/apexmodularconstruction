"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { X } from "lucide-react";
import { SellerLoginForm } from "@/app/seller/(auth)/login/SellerLoginForm";
import { SellerRegisterForm } from "@/app/seller/(auth)/register/SellerRegisterForm";

interface SellerAuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
}

export function SellerAuthModal({ isOpen, initialMode = "login", onClose }: SellerAuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [success, setSuccess] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Sync mode when modal opens with a different initialMode
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSuccess(false);
    }
  }, [isOpen, initialMode]);

  // Lock scroll and focus close button when open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Close on backdrop click
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  const handleSuccess = () => {
    setSuccess(true);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "login" ? "Seller Login" : "Become a Seller"}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl"
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-8">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {mode === "register" ? "Account Created!" : "Login Successful!"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {mode === "register" 
                  ? "Your seller account is ready. Check your email to confirm your address, then log in to start selling."
                  : "Welcome back! You can now access your seller dashboard."
                }
              </p>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
              >
                {mode === "register" ? "Go to Seller Login" : "Continue to Dashboard"}
              </button>
            </div>
          ) : (
            <>
              {/* Tab switcher */}
              <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
                <button
                  onClick={() => setMode("login")}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                    mode === "login"
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Seller Login
                </button>
                <button
                  onClick={() => setMode("register")}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                    mode === "register"
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Become a Seller
                </button>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {mode === "login" ? "Seller Login" : "Become a Seller"}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {mode === "login"
                  ? "Login to your seller account to manage your products"
                  : "Join Apex Modular Construction and start selling to Canadian customers"}
              </p>

              {mode === "login" ? (
                <SellerLoginForm />
              ) : (
                <SellerRegisterForm />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
