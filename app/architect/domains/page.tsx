import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getArchitectDashboardData } from "@/app/actions/architect";
import { DomainSettings } from "@/components/architect/DomainSettings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Domains | Apex Modular Construction",
};

export default async function ArchitectDomainsPage() {
  const result = await getArchitectDashboardData();

  if (!result.profile && !result.error) {
    redirect("/architect/login");
  }

  return (
    <div className="bg-[#F4F6FA] min-h-[calc(100vh-4rem)]">
      <div className="px-6 lg:px-8 pt-6 lg:pt-8">
        <h1 className="text-2xl font-bold text-gray-900">Domains</h1>
        <p className="text-sm text-gray-500 mt-1">
          Use your free Apex address, or connect your own domain — like Shopify. Only affects your landing page.
        </p>
      </div>
      <DomainSettings initialProfile={result.profile} />
    </div>
  );
}
