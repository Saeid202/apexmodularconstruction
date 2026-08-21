import { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a new Apex Modular Construction account",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
          <p className="mt-2 text-gray-600">Join Apex Modular Construction to start shopping</p>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-8">
          <AuthForm mode="register" redirectTo={redirect ?? "/account/dashboard"} />
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href={redirect ? `/auth/login?redirect=${encodeURIComponent(redirect)}` : "/auth/login"}
            className="text-blue-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>

        <div className="mt-4 border border-blue-100 bg-blue-50 rounded-lg px-4 py-3 text-center text-sm text-gray-700">
          Want to sell on Apex Modular Construction?{" "}
          <Link href="/seller/register" className="text-blue-600 font-semibold hover:underline">
            Apply as a seller →
          </Link>
        </div>
      </div>
    </div>
  );
}
