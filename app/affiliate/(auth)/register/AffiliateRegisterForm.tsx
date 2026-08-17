"use client";

import { useState } from "react";
import { registerAffiliate } from "@/app/actions/affiliate";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";

interface AffiliateRegisterFormProps {
  onSuccess?: () => void;
  onToggleLogin?: () => void;
}

export function AffiliateRegisterForm({ onSuccess, onToggleLogin }: AffiliateRegisterFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await registerAffiliate(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "#F3EEFB" }}
        >
          <CheckCircle className="w-8 h-8" style={{ color: "#4B1D8F" }} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Account Request Received!</h3>
        <p className="text-sm text-gray-500 mb-6">
          If you signed up with a password other than the developer bypass, check your email to confirm your address, then log in to access your dashboard.
        </p>
        <button
          onClick={() => {
            if (onToggleLogin) onToggleLogin();
          }}
          className="inline-flex items-center justify-center h-11 px-5 rounded-xl text-white text-sm font-semibold hover:opacity-95 transition-opacity"
          style={{ backgroundColor: "#4B1D8F" }}
        >
          Go to Affiliate Login
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] transition-shadow placeholder:text-gray-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: "#fef2f2", color: "#b91c1c" }}>
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="reg-fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Name <span className="text-[#4B1D8F]">*</span>
          </label>
          <input id="reg-fullName" name="fullName" type="text" required className={inputClass} placeholder="Your full name" />
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email <span className="text-[#4B1D8F]">*</span>
          </label>
          <input id="reg-email" name="email" type="email" required className={inputClass} placeholder="affiliate@example.com" />
        </div>

        <div>
          <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
          <input id="reg-phone" name="phone" type="tel" className={inputClass} placeholder="+1 (555) 123-4567" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="reg-companyName" className="block text-sm font-medium text-gray-700 mb-1.5">Company / Website Name</label>
          <input id="reg-companyName" name="companyName" type="text" className={inputClass} placeholder="My Promotion Site" />
        </div>
      </div>

      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1.5">
          Password <span className="text-[#4B1D8F]">*</span>
        </label>
        <div className="relative">
          <input
            id="reg-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
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
        <p className="text-xs text-gray-400 mt-1">Minimum 8 characters (or &quot;admin123&quot; for instant bypass)</p>
      </div>

      <div className="flex items-start gap-2 text-sm">
        <input id="reg-terms" type="checkbox" required className="mt-1 rounded border-gray-300 accent-[#4B1D8F]" />
        <label htmlFor="reg-terms" className="text-gray-500">
          I agree to the {" "}
          <Link href="/terms" className="font-medium text-[#4B1D8F] hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="font-medium text-[#4B1D8F] hover:underline">Privacy Policy</Link>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
        style={{ backgroundColor: "#4B1D8F" }}
      >
        {loading ? "Creating Account..." : "Create Affiliate Account"}
      </button>
    </form>
  );
}
