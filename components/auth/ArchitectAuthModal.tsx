"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { X } from "lucide-react";
import { ArchitectLoginForm } from "@/app/architect/(auth)/login/ArchitectLoginForm";
import { ArchitectRegisterForm } from "@/app/architect/(auth)/register/ArchitectRegisterForm";

interface ArchitectAuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
}

export function ArchitectAuthModal({
  isOpen,
  initialMode = "register",
  onClose,
}: ArchitectAuthModalProps) {
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
      aria-label={mode === "login" ? "Architect Login" : "Architect Sign Up"}
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-8">
          <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "login" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Architect Login
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "register"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Architect Sign Up
            </button>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {mode === "login" ? "Architect Login" : "Create Architect Account"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {mode === "login"
              ? "Login to access your architect dashboard"
              : "Sign up as an architect and start using Architect Studio"}
          </p>

          {mode === "login" ? <ArchitectLoginForm /> : <ArchitectRegisterForm />}
        </div>
      </div>
    </div>
  );
}
