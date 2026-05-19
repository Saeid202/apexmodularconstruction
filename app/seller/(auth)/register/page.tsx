import { Metadata } from "next";
import Link from "next/link";
import { Store, CheckCircle } from "lucide-react";
import { SellerRegisterForm } from "./SellerRegisterForm";

export const metadata: Metadata = {
  title: "Become a Seller",
  description: "Register as a seller on Apex Modular Construction and start selling construction materials and robots to Canadian customers.",
};

const steps = [
  "Submit your application with business details",
  "Our team reviews your application (1–2 business days)",
  "Once approved, start listing products",
  "Products are reviewed before going live",
];

export default function SellerRegisterPage() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F4F7" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #4B1D8F 0%, #3a1570 100%)" }}
      >
        <span className="absolute top-6 left-6 h-8 w-8 border-t-2 border-l-2 border-yellow-400 rounded-tl-lg" />
        <span className="absolute top-6 right-6 h-8 w-8 border-t-2 border-r-2 border-yellow-400 rounded-tr-lg" />
        <span className="absolute bottom-6 left-6 h-8 w-8 border-b-2 border-l-2 border-yellow-400 rounded-bl-lg" />
        <span className="absolute bottom-6 right-6 h-8 w-8 border-b-2 border-r-2 border-yellow-400 rounded-br-lg" />

        <div className="text-center max-w-xs">
          <div
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-6"
            style={{ backgroundColor: "#D4AF37" }}
          >
            <Store className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3">Join Apex Modular Construction</h2>
          <p className="text-purple-200 text-sm leading-relaxed mb-8">
            Reach thousands of Canadian businesses looking for quality products from China.
          </p>

          <div className="text-left space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-yellow-400 mb-2">What happens next</p>
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white mt-0.5"
                  style={{ backgroundColor: "#D4AF37" }}
                >
                  {i + 1}
                </div>
                <p className="text-sm text-purple-200">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-start justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <div
              className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-3"
              style={{ backgroundColor: "#4B1D8F" }}
            >
              <Store className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Become a Seller</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create your seller account</h2>
              <p className="text-sm text-gray-500 mt-1">Join Apex Modular Construction and reach Canadian customers</p>
            </div>

            <SellerRegisterForm />

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have a seller account?{" "}
              <Link href="/seller/login" className="font-medium hover:underline" style={{ color: "#4B1D8F" }}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
