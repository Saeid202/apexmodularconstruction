"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

export function ArchitectLoginForm() {
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
      document.cookie = `architect_bypass_email=${encodeURIComponent(email)}; path=/; max-age=86400`;
      setLoading(false);
      window.location.href = "/architect/dashboard";
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const role = data.user?.user_metadata?.role;
    if (role !== "architect") {
      setError("This account is not registered as an architect");
      setLoading(false);
      return;
    }

    setLoading(false);
    window.location.href = "/architect/dashboard";
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
    "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 transition-shadow placeholder:text-gray-400";
  const focusRing = { "--tw-ring-color": "#10B981" } as React.CSSProperties;

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
          placeholder="architect@example.com"
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

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <button
        type="button"
        onClick={handleResetPassword}
        disabled={resetting}
        className="w-full h-11 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 disabled:opacity-60 transition-colors"
      >
        {resetting ? "Sending Reset Email..." : "Forgot Password? Reset It"}
      </button>

      <p className="text-center text-sm text-gray-500">
        {"Don't have an architect account? "}
        <Link href="/architect/register" className="font-medium text-emerald-700 hover:underline">
          Register here
        </Link>
      </p>
    </form>
  );
}
