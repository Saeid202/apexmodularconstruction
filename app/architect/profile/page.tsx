import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getArchitectDashboardData } from "@/app/actions/architect";
import ArchitectProfileForm from "./ArchitectProfileForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Architect Profile | Apex Modular Construction",
};

export default async function ArchitectProfilePage() {
  const result = await getArchitectDashboardData();

  if (!result.profile && !result.error) {
    redirect("/architect/login");
  }

  return (
    <div className="p-6 lg:p-8 bg-[#F4F6FA] min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Architect Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your studio identity and professional qualifications</p>
      </div>
      <ArchitectProfileForm initialProfile={result.profile} />
    </div>
  );
}
