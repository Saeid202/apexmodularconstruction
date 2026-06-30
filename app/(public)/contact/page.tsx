import { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { createServerClient } from "@/lib/supabase/server";
import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Globe2,
  Award,
  FileCheck2,
  Compass
} from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact Us - Corporate Headquarters & Sourcing Desks",
  description: "Connect with the managing partners and engineering teams at Apex Modular Construction. Secure inquiry desks for commercial developments, CSA certifications, and global modular logistics.",
};

const GOLD = "#D4AF37";
const PURPLE = "#4B1D8F";

export default async function ContactPage() {
  let cmsContent: string | null = null;
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("page_contents" as any)
      .select("content")
      .eq("slug", "contact")
      .single();
    const row = data as { content: string } | null;
    if (row?.content && row.content.trim() !== "" && row.content !== "<p></p>") {
      cmsContent = row.content;
    }
  } catch { /* fall through */ }

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
        eyebrow="Get in Touch"
        title={<>Contact <span style={{ color: '#4B1D8F' }}>Our Team</span></>}
        subtitle="Partner with us to source prefabricated structures, request engineering consultations, or get a shipping quote."
      />

      {/* Main Workspace Layout */}
      <section className="container mx-auto px-6 py-10 max-w-7xl relative z-10">

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Premium Contact Form */}
          <div className="lg:col-span-7">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Secure Sourcing Inquiry</h2>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
                Please complete the structured project briefing below. Your parameters will be compiled and routed immediately to the appropriate commercial engineering desk.
              </p>
            </div>
            <ContactForm />
          </div>

          {/* Right Column: Corporate Sourcing Desks & Info */}
          <div className="lg:col-span-5 space-y-12">
            
            {/* Live Consultant Availability Status Panel */}
            <div 
              className="rounded-2xl p-6 bg-white border border-[#4B1D8F]/10 shadow-sm flex items-center justify-between"
              style={{ boxShadow: "0 10px 30px -10px rgba(75, 29, 143, 0.05)" }}
            >
              <div className="flex items-center gap-3">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#4B1D8F]">Sourcing Desk Online</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Average Response: <span className="font-bold text-gray-900">&lt; 15 mins</span></p>
                </div>
              </div>
              <WhatsAppLink
                className="inline-flex h-9 items-center gap-2 px-4 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-transform hover:scale-105"
                style={{ backgroundColor: '#25D366' }}
              >
                Direct WhatsApp
              </WhatsAppLink>
            </div>

            {/* Department 1: Global Procurement */}
            <div className="group relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-full group-hover:scale-y-100 scale-y-75 transition-transform duration-300" style={{ backgroundColor: GOLD }} />
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md border border-gray-100 group-hover:border-[#D4AF37]/30 transition-colors">
                  <Building2 className="h-5 w-5 text-[#4B1D8F]" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Developer Projects & Volume Sourcing</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    Dedicated desk for real estate developers, EPC contractors, and bulk procurement inquiries. Tailored pricing strategies for major structural orders and customized modular blueprints.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs font-semibold text-gray-700">
                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-gray-400" /> info@cargoplus.site</span>
                    <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gray-400" /> +1 416 882 5015</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Department 2: Technical Compliance */}
            <div className="group relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-full group-hover:scale-y-100 scale-y-75 transition-transform duration-300" style={{ backgroundColor: GOLD }} />
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md border border-gray-100 group-hover:border-[#D4AF37]/30 transition-colors">
                  <ShieldCheck className="h-5 w-5 text-[#4B1D8F]" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Technical Compliance & CSA Certification</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    Managing and coordinating Canadian compliance (CSA A277, CSA Z240, and local building codes). Direct partnership with engineers of record for testing and port clearances.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs font-semibold text-gray-700">
                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-gray-400" /> compliance@cargoplus.site</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Department 3: Global Logistics */}
            <div className="group relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-full group-hover:scale-y-100 scale-y-75 transition-transform duration-300" style={{ backgroundColor: GOLD }} />
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md border border-gray-100 group-hover:border-[#D4AF37]/30 transition-colors">
                  <Globe2 className="h-5 w-5 text-[#4B1D8F]" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Logistics, Freight & Customs Sourcing</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    Coordination of international freight shipping, multi-modal transport lines, customs brokerage operations, and port operations in Vancouver and Montreal.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs font-semibold text-gray-700">
                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-gray-400" /> logistics@cargoplus.site</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Operations Info Card */}
            <div 
              className="rounded-3xl p-8 bg-gradient-to-br from-[#1D0A3A] to-[#351368] text-white shadow-xl relative overflow-hidden"
              style={{ boxShadow: "0 20px 40px rgba(75, 29, 143, 0.15)" }}
            >
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none">
                <Award className="h-64 w-64" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-6 flex items-center gap-1.5">
                <FileCheck2 className="h-4 w-4" />
                Global HQ & Sourcing Desks
              </h4>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-3.5">
                  <MapPin className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-purple-200 uppercase tracking-wider">Canadian Corporate HQ</p>
                    <p className="text-sm font-semibold mt-1">
                      9131 Keele Street, Vaughan, Ontario, L4K 0G7, Canada
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <Clock className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-purple-200 uppercase tracking-wider">Operational Business Hours</p>
                    <p className="text-sm font-semibold mt-1">
                      Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                      Saturday: 10:00 AM - 4:00 PM EST
                    </p>
                  </div>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </section>

      {/* Global Sourcing Operations Map Hub Graphic Section */}
      <section className="bg-white border-t border-gray-100 py-24 relative overflow-hidden">
        
        {/* Subtle grid elements */}
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: `radial-gradient(${PURPLE} 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span 
              className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-[#4B1D8F]/10 bg-[#4B1D8F]/5"
              style={{ color: PURPLE }}
            >
              Apex Modular Sourcing Supply Network
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              An Integrated Global Supply Web
            </h2>
            <p className="text-gray-500 mt-3 text-sm sm:text-base leading-relaxed">
              We leverage strategically positioned corporate nodes to ensure flawless design specifications, accelerated fabrication timelines, certified quality assurance compliance, and multi-modal freight transport.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Node 1 */}
            <div className="rounded-2xl p-6 bg-[#FAF9FC] border border-gray-100 shadow-sm hover:border-[#D4AF37]/30 transition-all duration-300">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100 text-sm font-black text-[#4B1D8F] mb-4">01</span>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">North American Sourcing Desk</h3>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Vaughan, Ontario, Canada
              </p>
              <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                Acts as our executive project hub. Spearheads structural configuration modeling, investor relations, client consultations, local compliance reviews, and final over-the-road freight.
              </p>
            </div>

            {/* Node 2 */}
            <div className="rounded-2xl p-6 bg-[#FAF9FC] border border-gray-100 shadow-sm hover:border-[#D4AF37]/30 transition-all duration-300">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100 text-sm font-black text-[#4B1D8F] mb-4">02</span>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Automated Production Sourcing</h3>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Guangdong, China Hub
              </p>
              <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                Our highly automated fabrication facility. Houses automated laser cutting, precise robotic welding lines, architectural compositing, and premium material quality checks.
              </p>
            </div>

            {/* Node 3 */}
            <div className="rounded-2xl p-6 bg-[#FAF9FC] border border-gray-100 shadow-sm hover:border-[#D4AF37]/30 transition-all duration-300">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100 text-sm font-black text-[#4B1D8F] mb-4">03</span>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Inbound Logistics Sourcing</h3>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Port of Vancouver, BC, Canada
              </p>
              <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                Spearheads incoming custom container freight management, custom clearances, CSA certification validation inspector handoffs, and multi-modal container sorting.
              </p>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
