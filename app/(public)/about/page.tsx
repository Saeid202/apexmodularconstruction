import { Metadata } from "next";
import Image from "next/image";
import { createServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Apex Modular Construction - your trusted marketplace for construction materials and industrial robots from China to Canada.",
};

const staticContent = `
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
</ul>
`;

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

  if (cmsContent) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">About Apex Modular Construction</h1>
        <div
          className="prose prose-lg max-w-3xl mx-auto"
          dangerouslySetInnerHTML={{ __html: cmsContent }}
        />
      </div>
    );
  }

  // Static fallback
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">About Apex Modular Construction</h1>
      <div className="prose prose-lg max-w-3xl mx-auto">
        <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
          <Image
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80"
            alt="Construction site"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <h2>Our Mission</h2>
        <p>
          Apex Modular Construction is a B2C e-commerce marketplace that connects Canadian customers with trusted Chinese suppliers of construction materials and industrial robots.
        </p>
        <h2>Why Choose Apex Modular Construction?</h2>
        <ul>
          <li><strong>Quality Assurance:</strong> We partner with verified suppliers who meet international quality standards.</li>
          <li><strong>Competitive Pricing:</strong> Direct sourcing from manufacturers means better prices for you.</li>
          <li><strong>Canadian Compliance:</strong> All products meet Canadian safety and regulatory requirements.</li>
          <li><strong>Transparent Shipping:</strong> Clear delivery timelines and tracking from China to your door.</li>
        </ul>
        <h2>Contact Us</h2>
        <p>
          Have questions? Visit our <a href="/contact" className="text-primary hover:underline">contact page</a>.
        </p>
      </div>
    </div>
  );
}
