import { Metadata } from "next";
import Image from "next/image";
import { createServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";

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
    // Fall through to static content
  }

  // Strip redundant top-level "About *" headings injected by the CMS editor
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
        eyebrow="Our Story"
        title={<>About <span style={{ color: '#4B1D8F' }}>Apex Modular Construction</span></>}
        subtitle="Connecting Canadian customers with trusted Chinese manufacturers of construction materials and modular solutions."
      />
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </>
  );
}
