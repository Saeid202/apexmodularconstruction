import { getArchitectProfileByCustomDomain } from "@/app/actions/architect";
import { notFound } from "next/navigation";
import { ArchitectStudioView } from "@/components/studio/ArchitectStudioView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ host: string }>;
}

// Entry point for architect-connected custom domains (e.g. www.myfirm.com).
// The middleware rewrites any foreign host to /studio/domain/<host>; here we
// resolve which architect claimed that domain and render their studio page.
export default async function CustomDomainStudioPage({ params }: PageProps) {
  const resolvedParams = await params;
  const host = decodeURIComponent(resolvedParams.host);
  const { profile, error } = await getArchitectProfileByCustomDomain(host);

  if (!profile || error) {
    notFound();
  }

  return <ArchitectStudioView profile={profile} />;
}
