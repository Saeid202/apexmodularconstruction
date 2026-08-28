"use client";

import { useState } from "react";
import { registerSeller } from "@/app/actions/seller";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";
import { LuxuryButton, LuxuryLinkButton } from "@/components/seller/LuxuryButton";

export function SellerRegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await registerSeller(formData);
    if (result.error) { setError(result.error); setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "#EDE9F6" }}
        >
          <CheckCircle className="w-8 h-8" style={{ color: "#4B1D8F" }} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Account Created!</h3>
        <p className="text-sm text-gray-500 mb-6">
          Check your email to confirm your address, then log in to start selling.
        </p>
        <LuxuryLinkButton href="/seller/login" size="lg">
          Go to Seller Login
        </LuxuryLinkButton>
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
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1.5">
            Business Name <span style={{ color: "#4B1D8F" }}>*</span>
          </label>
          <input
            id="businessName" name="businessName" type="text" required
            className={inputClass} placeholder="Your Company Ltd."
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Business Email <span style={{ color: "#4B1D8F" }}>*</span>
          </label>
          <input
            id="email" name="email" type="email" required
            className={inputClass} placeholder="contact@yourcompany.com"
          />
        </div>

        <div>
          <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700 mb-1.5">
            Business Phone
          </label>
          <input
            id="businessPhone" name="businessPhone" type="tel"
            className={inputClass} placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
          Password <span style={{ color: "#4B1D8F" }}>*</span>
        </label>
        <div className="relative">
          <input
            id="password" name="password"
            type={showPassword ? "text" : "password"}
            required minLength={8}
            className={`${inputClass} pr-10`}
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
        <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
      </div>

      <div>
        <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-1.5">
          Business Address
        </label>
        <input
          id="businessAddress" name="businessAddress" type="text"
          className={inputClass} placeholder="123 Business St, City, Country"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
          Business Description
        </label>
        <textarea
          id="description" name="description" rows={3}
          className={`${inputClass} resize-none`}
          placeholder="Tell us about your business and products..."
        />
      </div>

      <div className="flex items-start gap-2 text-sm">
        <input
          id="terms" type="checkbox" required
          className="mt-1 rounded border-gray-300 accent-[#4B1D8F]"
        />
        <label htmlFor="terms" className="text-gray-500">
          I agree to the Terms and Conditions
        </label>
      </div>

      <LuxuryButton
        type="submit"
        loading={loading}
        size="lg"
        className="w-full"
      >
        {loading ? "Creating Account..." : "Create Seller Account"}
      </LuxuryButton>
    </form>
  );
}
