import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getArchitectDashboardData } from "@/app/actions/architect";
import { PageBuilderEditor } from "@/components/page-builder/PageBuilderEditor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Page Builder | Apex Modular Construction",
};

export default async function ArchitectPageBuilderPage() {
  const result = await getArchitectDashboardData();

  if (!result.profile && !result.error) {
    redirect("/architect/login");
  }

  return (
    <div className="bg-[#F4F6FA] min-h-[calc(100vh-4rem)]">
      <div className="px-6 lg:px-8 pt-6 lg:pt-8">
        <h1 className="text-2xl font-bold text-gray-900">Page Builder</h1>
        <p className="text-sm text-gray-500 mt-1">
          Compose your public studio page from pre-built blocks. Changes only affect your landing page.
        </p>
      </div>
      <PageBuilderEditor initialProfile={result.profile} />
    </div>
  );
}
