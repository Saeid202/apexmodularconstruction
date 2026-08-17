import { getArchitectProfileBySubdomain } from "@/app/actions/architect";
import { notFound } from "next/navigation";
import { ArchitectStudioView } from "@/components/studio/ArchitectStudioView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicArchitectStudioPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { profile, error } = await getArchitectProfileBySubdomain(resolvedParams.slug);

  if (!profile || error) {
    notFound();
  }

  return <ArchitectStudioView profile={profile} />;
}
