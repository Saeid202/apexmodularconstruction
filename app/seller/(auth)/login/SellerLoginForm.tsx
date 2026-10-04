"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import { LuxuryButton } from "@/components/seller/LuxuryButton";

export function SellerLoginForm() {
  const supabase = createBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      if (signInError.message.toLowerCase().includes("email") || signInError.message.toLowerCase().includes("confirm")) {
        setError("Please confirm your email address before logging in. Check your inbox for the confirmation email.");
      } else {
        setError(signInError.message);
      }
      setLoading(false);
      return;
    }

    const role = data.user?.user_metadata?.role;
    if (role !== "seller") {
      setError("This account is not registered as a seller");
      setLoading(false);
      return;
    }

    setLoading(false);
    window.location.href = "/seller/dashboard";
  };

  const handleResendConfirmation = async () => {
    if (!email) { setError("Please enter your email address first"); return; }
    setResending(true);
    setError(null);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setError(error ? error.message : "Confirmation email resent! Please check your inbox.");
    setResending(false);
  };

  const inputClass =
    "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 transition-shadow placeholder:text-gray-400";
  const focusRing = { "--tw-ring-color": "#1F2937" } as React.CSSProperties;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: "#fef2f2", color: "#b91c1c" }}>
          <p>{error}</p>
          {(error.includes("confirm") || error.includes("email")) && (
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resending || !email}
              className="mt-1.5 text-xs underline hover:no-underline disabled:opacity-50"
            >
              {resending ? "Resending..." : "Resend confirmation email"}
            </button>
          )}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
          style={focusRing}
          placeholder="seller@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`${inputClass} pr-10`}
            style={focusRing}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
          <input type="checkbox" className="rounded border-gray-300 accent-[#1F2937]" />
          Remember me
        </label>
        <Link href="/auth/reset-password" className="font-medium hover:underline" style={{ color: "#1F2937" }}>
          Forgot password?
        </Link>
      </div>

      <LuxuryButton
        type="submit"
        loading={loading}
        size="lg"
        className="w-full"
      >
        {loading ? "Signing in..." : "Sign In"}
      </LuxuryButton>
    </form>
  );
}
