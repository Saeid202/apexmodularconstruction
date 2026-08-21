import { Metadata } from "next";
import Link from "next/link";
import { ArchitectRegisterForm } from "./ArchitectRegisterForm";

export const metadata: Metadata = {
  title: "Become an Architect",
  description: "Register as an architect and access your dashboard.",
};

export default function ArchitectRegisterPage() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F4F6FA" }}>
      <div
        className="hidden lg:flex lg:w-5/12 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #111827 100%)" }}
      >
        <div className="text-center max-w-xs">
          <h2 className="text-2xl font-extrabold text-white mb-3">Join Architect Studio</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Build your architect profile and manage your future projects, templates, and settings in one place.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Become an Architect</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create your architect account</h2>
              <p className="text-sm text-gray-500 mt-1">Get access to your architect dashboard</p>
            </div>

            <ArchitectRegisterForm />

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an architect account?{" "}
              <Link href="/architect/login" className="font-medium text-emerald-700 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
