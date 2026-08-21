import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getArchitectDashboardData } from "@/app/actions/architect";
import ArchitectStudioSettingsForm from "./ArchitectStudioSettingsForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Studio Settings | Apex Modular Construction",
};

export default async function ArchitectSettingsPage() {
  const result = await getArchitectDashboardData();

  if (!result.profile && !result.error) {
    redirect("/architect/login");
  }

  return (
    <div className="p-6 lg:p-8 bg-[#F4F6FA] min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Studio & Brand Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your public subdomain and visual storefront theme</p>
      </div>
      <ArchitectStudioSettingsForm initialProfile={result.profile} />
    </div>
  );
}
