import { Metadata } from "next";
import Link from "next/link";
import { SellerLoginForm } from "./SellerLoginForm";

export const metadata: Metadata = {
  title: "Seller Login",
  description: "Login to your Apex Modular Construction seller account to manage your products.",
};

export default function SellerLoginPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Seller Centre</h1>
          <p className="text-muted-foreground">
            Login to manage your products and orders
          </p>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <SellerLoginForm />

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {"Don't have a seller account? "}
            <Link href="/seller/register" className="text-primary hover:underline">
              Register here
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
            Customer login
          </Link>
        </div>
      </div>
    </div>
  );
}