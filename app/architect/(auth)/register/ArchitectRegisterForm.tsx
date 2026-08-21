"use client";

import { useState } from "react";
import { registerArchitect } from "@/app/actions/architect";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";

export function ArchitectRegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await registerArchitect(formData);

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
          style={{ backgroundColor: "#ECFDF5" }}
        >
          <CheckCircle className="w-8 h-8" style={{ color: "#059669" }} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Account Created!</h3>
        <p className="text-sm text-gray-500 mb-6">
          Check your email to confirm your address, then log in to access your dashboard.
        </p>
        <Link
          href="/architect/login"
          className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
        >
          Go to Architect Login
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow placeholder:text-gray-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: "#fef2f2", color: "#b91c1c" }}>
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Name <span className="text-emerald-600">*</span>
          </label>
          <input id="fullName" name="fullName" type="text" required className={inputClass} placeholder="Your full name" />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email <span className="text-emerald-600">*</span>
          </label>
          <input id="email" name="email" type="email" required className={inputClass} placeholder="architect@example.com" />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
          <input id="phone" name="phone" type="tel" className={inputClass} placeholder="+1 (555) 123-4567" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="firmName" className="block text-sm font-medium text-gray-700 mb-1.5">Firm Name</label>
          <input id="firmName" name="firmName" type="text" className={inputClass} placeholder="Studio Name" />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
          Password <span className="text-emerald-600">*</span>
        </label>
        <div className="relative">
          <input
            id="password"
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
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          className={`${inputClass} resize-none`}
          placeholder="Tell us about your architecture focus..."
        />
      </div>

      <div className="flex items-start gap-2 text-sm">
        <input id="terms" type="checkbox" required className="mt-1 rounded border-gray-300 accent-emerald-600" />
        <label htmlFor="terms" className="text-gray-500">
          I agree to the {" "}
          <Link href="/terms" className="font-medium text-emerald-700 hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="font-medium text-emerald-700 hover:underline">Privacy Policy</Link>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors"
      >
        {loading ? "Creating Account..." : "Create Architect Account"}
      </button>
    </form>
  );
}
