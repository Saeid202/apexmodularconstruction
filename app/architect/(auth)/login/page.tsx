import { Metadata } from "next";
import Link from "next/link";
import { ArchitectLoginForm } from "./ArchitectLoginForm";

export const metadata: Metadata = {
  title: "Architect Login",
  description: "Login to your architect dashboard.",
};

export default function ArchitectLoginPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Architect Studio</h1>
          <p className="text-muted-foreground">Login to access your architect dashboard</p>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <ArchitectLoginForm />
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
