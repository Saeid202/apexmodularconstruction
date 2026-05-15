"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "register";
  onSuccess?: () => void;
  redirectTo?: string;
}

export function AuthForm({ mode, onSuccess, redirectTo = "/account/dashboard" }: AuthFormProps) {
  const supabase = createBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Account created! Check your email to confirm your account.");
      }
      setLoading(false);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.message.toLowerCase().includes('email') || error.message.toLowerCase().includes('confirm')) {
          setError("Please confirm your email address before logging in. Check your inbox for the confirmation email.");
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      // Get role from auth metadata (no DB query needed)
      const userRole = data.user?.user_metadata?.role;

      // Role-based redirect
      if (userRole === "seller") {
        window.location.href = "/seller/dashboard";
      } else if (userRole === "admin") {
        window.location.href = "/admin/dashboard";
      } else if (userRole === "partner") {
        window.location.href = "/partner/dashboard";
      } else if (userRole === "agent") {
        window.location.href = "/agent/dashboard";
      } else if (userRole === "shipping_agent") {
        window.location.href = "/shipping-agent/dashboard";
      } else if (redirectTo && redirectTo !== "/account/dashboard") {
        window.location.href = redirectTo;
      } else {
        window.location.href = "/";
      }
    }
  }

  async function handleResendConfirmation() {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    setResending(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Confirmation email resent! Please check your inbox.");
    }

    setResending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "register" && (
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            autoComplete="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          <p>{error}</p>
          {mode === "login" && (error.includes("confirm") || error.includes("email")) && (
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resending || !email}
              className="mt-2 text-xs underline hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? "Resending..." : "Resend confirmation email"}
            </button>
          )}
        </div>
      )}

      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
      >
        {loading
          ? mode === "login"
            ? "Logging in..."
            : "Creating account..."
          : mode === "login"
          ? "Login"
          : "Create Account"}
      </button>
    </form>
  );
}
