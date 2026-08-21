import { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your Apex Modular Construction account",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; returnUrl?: string }>;
}) {
  const params = await searchParams;
  // The cart and checkout pages link here with `?returnUrl=`, while the register
  // page uses `?redirect=`. Accept both so the buyer actually lands back on
  // /checkout after logging in.
  const redirect = params.redirect ?? params.returnUrl;

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-gray-600">Login to your Apex Modular Construction account</p>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-8">
          <AuthForm mode="login" redirectTo={redirect ?? "/account/dashboard"} />

          <div className="mt-4 text-center">
            <Link href="/auth/reset-password" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
              Forgot your password?
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href={redirect ? `/auth/register?redirect=${encodeURIComponent(redirect)}` : "/auth/register"}
            className="text-blue-600 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
