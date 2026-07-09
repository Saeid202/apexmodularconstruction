import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("page_contents" as any)
      .select("slug");
    return ((data as { slug: string }[]) ?? []).map((row) => ({ slug: row.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("page_contents" as any)
      .select("title")
      .eq("slug", slug)
      .single();
    const row = data as { title: string } | null;
    if (row?.title) {
      return { title: row.title };
    }
  } catch {}
  return {};
}

interface CmsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CmsPage({ params }: CmsPageProps) {
  const { slug } = await params;

  const supabase = await createServerClient();
  const { data: page } = await supabase
    .from("page_contents" as any)
    .select("title, content")
    .eq("slug", slug)
    .single();

  const typedPage = page as { title: string; content: string } | null;

  if (!typedPage) {
    notFound();
  }

  return (
    <>
      <PageHeader title={typedPage.title} background="white" />
      <Section background="white" padding="lg">
        <div className="mx-auto max-w-4xl">
          <div
            className="prose prose-lg md:prose-xl max-w-none prose-headings:scroll-mt-20 prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl md:prose-h2:text-3xl prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-ul:space-y-3 prose-li:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: typedPage.content }}
          />
        </div>
      </Section>
    </>
  );
}
