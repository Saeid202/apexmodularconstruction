"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

interface AffiliateLoginFormProps {
  onSuccess?: () => void;
}

export function AffiliateLoginForm({ onSuccess }: AffiliateLoginFormProps) {
  const supabase = createBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    // Development bypass option
    if (password === "admin123") {
      document.cookie = `affiliate_bypass_email=${encodeURIComponent(email)}; path=/; max-age=86400`;
      setLoading(false);
      if (onSuccess) onSuccess();
      window.location.href = "/affiliate/dashboard";
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const role = data.user?.user_metadata?.role;
    if (role !== "affiliate") {
      setError("This account is not registered as an affiliate partner.");
      setLoading(false);
      return;
    }

    setLoading(false);
    if (onSuccess) onSuccess();
    window.location.href = "/affiliate/dashboard";
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    setResetting(true);
    setError(null);
    setInfo(null);

    const redirectTo = `${window.location.origin}/auth/update-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (resetError) {
      setError(resetError.message);
    } else {
      setInfo("Password reset email sent. Check your inbox and spam folder.");
    }

    setResetting(false);
  };

  const inputClass =
    "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] transition-shadow placeholder:text-gray-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: "#fef2f2", color: "#b91c1c" }}>
          <p>{error}</p>
        </div>
      )}

      {info && (
        <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: "#ecfdf5", color: "#065f46" }}>
          <p>{info}</p>
        </div>
      )}

      <div>
        <label htmlFor="affiliate-email" className="block text-sm font-medium text-gray-700 mb-1.5">
          Email address
        </label>
        <input
          id="affiliate-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
          placeholder="affiliate@example.com"
        />
      </div>

      <div>
        <label htmlFor="affiliate-password" className="block text-sm font-medium text-gray-700 mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="affiliate-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`${inputClass} pr-10`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
        style={{ backgroundColor: "#4B1D8F" }}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <button
        type="button"
        onClick={handleResetPassword}
        disabled={resetting}
        className="w-full h-11 rounded-xl border text-sm font-semibold transition-colors"
        style={{ borderColor: "#e0d0f5", color: "#4B1D8F" }}
      >
        {resetting ? "Sending Reset Email..." : "Forgot Password? Reset It"}
      </button>
    </form>
  );
}
