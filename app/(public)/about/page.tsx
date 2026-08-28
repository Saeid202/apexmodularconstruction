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
    <p class="lead"><strong>Apex Modular Construction (16481043 Canada Inc.)</strong><br/>Building a Smarter Future for Construction</p>
    <p>Apex Modular Construction is a technology-driven construction platform transforming the way buildings are designed, manufactured, and delivered.</p>
    <p>The traditional construction industry is fragmented. Architects, engineers, contractors, material suppliers, manufacturers, distributors, and developers often operate through disconnected systems—creating unnecessary costs, delays, waste, and complexity.</p>
    <p><strong>Apex is building a different model.</strong></p>
    <p>Our platform connects digital design, building systems, materials, manufacturing, logistics, and construction into one integrated ecosystem.</p>
    <h2>From Design to Reality</h2>
    <p>With Apex, a building can begin digitally. Customers can explore, configure, and customize their building through a technology-enabled design experience. Once the design and specifications are finalized, Apex connects the project with suitable manufacturing and construction partners.</p>
    <p>Instead of treating construction as a series of disconnected activities, we are creating a digital supply chain for buildings.</p>
    <p>Our platform can support the production of:</p>
    <ul>
      <li>Modular and prefab buildings</li>
      <li>Light steel frame structures</li>
      <li>Wall, floor, and roof systems</li>
      <li>Insulated and structural panels</li>
      <li>Prefabricated bathrooms and utility modules</li>
      <li>Doors, windows, flooring, kitchens, and other building materials</li>
    </ul>
    <p>These components can be manufactured through qualified factories and delivered to the project site for efficient assembly.</p>
    <h2>Manufacturing Without Borders</h2>
    <p>Apex is designed as a global platform launched from Canada.</p>
    <p>We connect customers and construction projects with manufacturing capabilities in different markets, while focusing on the requirements of the destination market. This allows us to access competitive manufacturing capacity while building a system that can support local standards, engineering requirements, logistics, and installation.</p>
    <p>Our long-term vision is not simply to import buildings.</p>
    <p>Our vision is to build a global network of building manufacturers and suppliers that can serve local construction markets through one digital platform.</p>
    <h2>Technology at the Core</h2>
    <p>Apex combines construction expertise with artificial intelligence and digital technology.</p>
    <p>Our goal is to simplify complex construction decisions—from selecting building systems and materials to configuring a building, estimating costs, coordinating manufacturing, and managing delivery.</p>
    <p>Over time, Apex will develop an intelligent construction ecosystem where customers, manufacturers, designers, engineers, suppliers, and builders can work through a connected digital platform.</p>
    <h2>A New Construction Economy</h2>
    <p>We believe the future of construction will move from job-site production to factory production, from fragmented supply chains to integrated platforms, and from manual processes to intelligent digital workflows.</p>
    <p>Apex is building the infrastructure for that transition.</p>
    <p class="text-center font-bold" style="color: #4B1D8F; margin-top: 2rem; font-size: 1.25rem;">
      Design digitally. Manufacture efficiently. Build smarter.
    </p>
    <p class="text-center text-sm text-gray-500">
      Apex Modular Construction — Building the Next Generation of Construction.
    </p>
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
