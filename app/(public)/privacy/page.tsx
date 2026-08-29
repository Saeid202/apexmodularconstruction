import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Privacy Policy - Apex Modular Construction",
  description: "Privacy Policy for 16481043 Canada Inc. (operating as Apex Modular Construction). Learn how we collect, use, and share your personal information.",
};

const PURPLE = "#4B1D8F";

export default async function PrivacyPage() {
  let cmsContent: string | null = null;

  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("page_contents" as any)
      .select("content")
      .eq("slug", "privacy")
      .single();
    const row = data as { content: string } | null;
    if (row?.content && row.content.trim() !== "" && row.content !== "<p></p>") {
      cmsContent = row.content;
    }
  } catch {
    // Fall through to static content
  }

  const staticContent = `
    <p>At <strong>16481043 Canada Inc.</strong> (operating as <strong>Apex Modular Construction</strong>), we are committed to protecting the privacy of our customers. This Privacy Policy describes how we collect, use, and share your personal information.</p>
    
    <h2>1. Information We Collect</h2>
    <p>We may collect personal information that you provide directly to us, including:</p>
    <ul>
      <li>Name and contact information (such as email address and phone number).</li>
      <li>Business information related to your inquiries.</li>
      <li>Communication preferences and history of your interactions with us.</li>
    </ul>

    <h2>2. How We Use Your Information</h2>
    <p>We use the information we collect to:</p>
    <ul>
      <li>Provide and maintain our services.</li>
      <li>Communicate with you regarding project updates or inquiries.</li>
      <li>Send marketing and promotional communications (with your consent).</li>
      <li>Comply with legal obligations and improve our website experience.</li>
    </ul>

    <h2>3. Sharing Your Information</h2>
    <p>We do not sell your personal information. We may share your data with trusted third-party service providers who assist us in operating our business, including:</p>
    <ul>
      <li><strong>Meta Platforms, Inc.:</strong> For the purpose of providing customer support via WhatsApp and for advertising services.</li>
      <li><strong>Other service providers:</strong> Who help with email delivery and website analytics.</li>
    </ul>

    <h2>4. Your Rights</h2>
    <p>You have the right to access, update, or request the deletion of your personal information at any time. To exercise these rights, please contact us using the details below.</p>

    <h2>5. Contact Us</h2>
    <p>If you have any questions about this Privacy Policy or our data practices, please contact us at:</p>
    <p>
      <strong>Legal Name:</strong> 16481043 Canada Inc.<br />
      <strong>Email:</strong> <a href="mailto:hello@apexmodularconstruction.com">hello@apexmodularconstruction.com</a><br />
      <strong>Phone:</strong> +1 416-882-5015
    </p>
  `;

  const displayContent = cmsContent ?? staticContent;

  return (
    <main className="bg-[#FAF9FC] min-h-screen text-gray-900 overflow-hidden relative">
      
      {/* Background Architectural Grid Effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-0" 
        style={{
          backgroundImage: `
            radial-gradient(circle, ${PURPLE} 1px, transparent 1px),
            linear-gradient(to right, ${PURPLE} 1px, transparent 1px),
            linear-gradient(to bottom, ${PURPLE} 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px, 40px 40px, 40px 40px"
        }}
      />

      <PageHeader
        eyebrow="Legal"
        title={<>Privacy <span style={{ color: '#4B1D8F' }}>Policy</span></>}
        subtitle="Effective Date: August 27, 2026"
      />

      {/* Main Content */}
      <section className="container mx-auto px-6 py-16 max-w-4xl relative z-10">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100/80">
          <div 
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />
        </div>
      </section>

    </main>
  );
}
