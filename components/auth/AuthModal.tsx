"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { X } from "lucide-react";
import { AuthForm } from "./AuthForm";
import Link from "next/link";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
}

export function AuthModal({ isOpen, initialMode = "login", onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Sync mode when modal opens with a different initialMode
  useEffect(() => {
    if (isOpen) setMode(initialMode);
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

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "login" ? "Login" : "Create account"}
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
              Login
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "register"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {mode === "login" ? "Welcome back" : "Join Apex Modular Construction"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {mode === "login"
              ? "Login to your account to continue"
              : "Create an account to start shopping"}
          </p>

          <AuthForm mode={mode} onSuccess={onClose} />

          {mode === "login" && (
            <div className="mt-3 text-center">
              <Link
                href="/auth/reset-password"
                onClick={onClose}
                className="text-xs text-gray-500 hover:text-primary transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          )}

          {mode === "register" && (
            <div className="mt-4 border-t border-gray-100 pt-4 text-center text-xs text-gray-500">
              Want to sell on Apex Modular Construction?{" "}
              <Link
                href="/seller/register"
                onClick={onClose}
                className="text-primary font-medium hover:underline"
              >
                Apply as a seller →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
