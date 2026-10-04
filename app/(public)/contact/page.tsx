import { Metadata } from "next";
import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  MapPin,
  Phone,
  Mail,
  Building2
} from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact Us - Apex Modular Construction",
  description: "Get in touch with Apex Modular Construction. Contact details for our Toronto corporate headquarters.",
};

const PURPLE = "#1F2937";

export default async function ContactPage() {
  return (
    <main className="bg-[#FFFBEB] min-h-screen text-gray-900 overflow-hidden relative">
      
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
        eyebrow="Get in Touch"
        title={<>Contact <span style={{ color: '#1F2937' }}>Our Team</span></>}
        subtitle="We are here to help. Reach out to us via email, phone, or WhatsApp."
      />

      {/* Main Layout */}
      <section className="container mx-auto px-6 py-16 max-w-3xl relative z-10">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100/80 space-y-10">
          
          <div className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <Building2 className="h-6 w-6 text-[#1F2937]" />
              Apex Modular Construction
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              16481043 Canada Inc.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Email Contact */}
            <div className="space-y-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F2937]/5 text-[#1F2937]">
                <Mail className="h-5 w-5" />
              </span>
              <h3 className="font-bold text-gray-900">Email Address</h3>
              <p className="text-sm text-gray-600">
                For general inquiries, project briefings, or partnerships:
              </p>
              <a href="mailto:hello@apexmodularconstruction.com" className="block text-sm font-semibold text-[#1F2937] hover:underline">
                hello@apexmodularconstruction.com
              </a>
            </div>

            {/* Phone & WhatsApp */}
            <div className="space-y-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F2937]/5 text-[#1F2937]">
                <Phone className="h-5 w-5" />
              </span>
              <h3 className="font-bold text-gray-900">Phone & WhatsApp</h3>
              <p className="text-sm text-gray-600">
                Call or message us directly:
              </p>
              <div className="text-sm font-semibold space-y-1">
                <a href="tel:+12898168314" className="block text-gray-900 hover:text-[#1F2937]">
                  +1 (289) 816-8314
                </a>
                <WhatsAppLink className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold">
                  Message on WhatsApp
                </WhatsAppLink>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 space-y-3">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1F2937]/5 text-[#1F2937]">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900">Office Location</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  1050 King St W 1st Floor, Toronto, ON M6K 0C7, Canada
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}
