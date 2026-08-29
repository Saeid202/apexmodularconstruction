import { Metadata } from "next";
import Link from "next/link";
import { AffiliateLoginForm } from "../(auth)/login/AffiliateLoginForm";

export const metadata: Metadata = {
  title: "Affiliate Partner Login | Apex",
  description: "Login to your affiliate dashboard.",
};

export default function AffiliateLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl font-extrabold tracking-tight text-gray-900">
            APEX<span style={{ color: "#D4AF37" }}>.</span> PARTNERS
          </Link>
          <p className="mt-2 text-sm text-gray-500">
            Login to your affiliate dashboard to track earnings and sales
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xl">
          <AffiliateLoginForm />
        </div>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Don&apos;t have a partner account?{" "}
            <Link href="/affiliate/register" className="font-semibold transition-colors" style={{ color: "#4B1D8F" }}>
              Register here
            </Link>
          </p>
          <div>
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
              ← Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
