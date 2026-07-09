import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Apex Modular Construction - your trusted marketplace for construction materials and industrial robots from China to Canada.",
};

export default async function AboutPage() {
  let cmsContent: string | null = null;

  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("page_contents" as any)
      .select("content")
      .eq("slug", "about")
      .single();
    const row = data as { content: string } | null;
    if (row?.content && row.content.trim() !== "" && row.content !== "<p></p>") {
      cmsContent = row.content;
    }
  } catch {
  }

  if (cmsContent) {
    cmsContent = cmsContent
      .replace(/<h[123][^>]*>\s*About\s+Us\s*<\/h[123]>/gi, "")
      .replace(/<h[123][^>]*>\s*About\s+Shanghai\s+Cargo\s+Plus\s*<\/h[123]>/gi, "")
      .replace(/<h[123][^>]*>\s*About\s+Apex\s+Modular\s+Construction\s*<\/h[123]>/gi, "");
  }

  const content = cmsContent ?? `
    <div class="relative aspect-video rounded-xl overflow-hidden mb-8">
      <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80" alt="Construction site" class="object-cover w-full h-full" />
    </div>
    <h2>Our Mission</h2>
    <p>Apex Modular Construction is a B2C e-commerce marketplace that connects Canadian customers with trusted Chinese suppliers of construction materials and industrial robots.</p>
    <h2>Why Choose Apex Modular Construction?</h2>
    <ul>
      <li><strong>Quality Assurance:</strong> We partner with verified suppliers who meet international quality standards.</li>
      <li><strong>Competitive Pricing:</strong> Direct sourcing from manufacturers means better prices for you.</li>
      <li><strong>Canadian Compliance:</strong> All products meet Canadian safety and regulatory requirements.</li>
      <li><strong>Transparent Shipping:</strong> Clear delivery timelines and tracking from China to your door.</li>
    </ul>
    <h2>Contact Us</h2>
    <p>Have questions? Visit our <a href="/contact">contact page</a>.</p>
  `;

  return (
    <>
      <PageHeader
        background="brand"
        eyebrow="Our Story"
        title={<>About <span className="text-secondary-500">Apex Modular Construction</span></>}
        subtitle="Connecting Canadian customers with trusted Chinese manufacturers of construction materials and modular solutions."
      />
      <Section background="white" padding="lg">
        <div className="mx-auto max-w-4xl">
          <div
            className="prose prose-lg md:prose-xl max-w-none prose-headings:scroll-mt-20 prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl md:prose-h2:text-3xl prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-ul:space-y-3 prose-li:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </Section>

      <Section background="dark" padding="lg">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
            Ready to Start Your Project?
          </h2>
          <p className="mt-3 text-base text-primary-foreground/80">
            Tell us about your next build and get a free feasibility assessment, budget estimate, and timeline — typically within 48 hours.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-accent transition-colors"
            >
              Get a Free Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/30 px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
            >
              Browse Our Products
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}