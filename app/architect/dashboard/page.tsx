import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getArchitectDashboardData } from "@/app/actions/architect";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Architect Dashboard | Apex Modular Construction",
};

export default async function ArchitectDashboardPage() {
  const result = await getArchitectDashboardData();

  if (!result.profile && !result.error) {
    redirect("/architect/login");
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Architect Studio</p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          Welcome, {result.profile?.full_name || "Architect"}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Your workspace is ready. Use the left sidebar to navigate Profile, Projects, Page Builder, Domains, and Settings.
        </p>
      </div>
    </div>
  );
}
