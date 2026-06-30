import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2, Wrench, Package, FileCheck, ChevronRight,
  Factory, Home, Warehouse, LayoutGrid, Landmark,
  Globe, DollarSign, Clock, ShieldCheck, Award,
  ClipboardList, Cog, Truck, HardHat, CheckCircle,
} from "lucide-react";
import { PrefabEPCFAQSection, ProjectEstimateForm, LightSteelStructureFAQSection } from "./ConstructionPageClient";

/* ─── SEO ─────────────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: "Prefab Construction Cost in Canada (2026 Guide) | Apex Modular Construction",
  description:
    "Full cost breakdown of prefab and steel structure projects from China to Canada. EPC delivery, CSA compliance, and modular building solutions. Get a free project estimate.",
  keywords: [
    "prefab construction cost Canada",
    "prefabricated buildings China Canada",
    "EPC construction Canada",
    "modular buildings Canada",
    "CSA compliance prefab",
    "steel structure construction Canada",
    "China Canada construction supply chain",
    "industrial prefab buildings Canada",
  ],
  alternates: {
    canonical: "https://cargoplus.site/services/construction-solutions",
  },
  openGraph: {
    title: "Prefab Construction Cost in Canada (2026 Guide) | Apex Modular Construction",
    description:
      "Full cost breakdown of prefab and steel structure projects from China to Canada. EPC delivery, CSA compliance, and modular building solutions.",
    type: "article",
    url: "https://cargoplus.site/services/construction-solutions",
  },
};

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

/* ─── Shared components ───────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>
      {children}
    </p>
  );
}

function SectionHeading({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
      {children}
    </h2>
  );
}

function CTAButton({
  href, variant = "primary", children,
}: {
  href: string;
  variant?: "primary" | "outline";
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const styles =
    variant === "primary"
      ? { backgroundColor: PURPLE, color: "#fff", border: `2px solid ${GOLD}` }
      : { backgroundColor: "transparent", color: PURPLE, border: `2px solid ${PURPLE}` };
  return (
    <Link href={href} className={base} style={styles}>
      {children}
      <ChevronRight className="h-4 w-4" />
    </Link>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function ConstructionSolutionsPage() {
  return (
    <>
      {/* ── JSON-LD: Article schema ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Prefab Construction Cost in Canada (2026 Guide)",
            description:
              "Full cost breakdown of prefab and steel structure projects from China to Canada. EPC delivery, CSA compliance, and modular building solutions.",
            author: {
              "@type": "Organization",
              name: "Apex Modular Construction",
              url: "https://cargoplus.site",
            },
            publisher: {
              "@type": "Organization",
              name: "Apex Modular Construction",
              url: "https://cargoplus.site",
            },
            datePublished: "2026-01-01",
            dateModified: "2026-05-01",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://cargoplus.site/services/construction-solutions",
            },
          }),
        }}
      />

      {/* ── JSON-LD: FAQ schema ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How much does prefab construction cost in Canada?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Prefab construction in Canada typically ranges from $120 to $400+ per square foot, depending on design complexity, materials, and compliance requirements. Projects that integrate overseas manufacturing can reduce overall costs when properly managed.",
                },
              },
              {
                "@type": "Question",
                name: "Is importing prefabricated buildings from China cost-effective?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Importing prefab structures from China can reduce total project costs by 20% to 40%, primarily due to lower manufacturing costs and scalable production.",
                },
              },
              {
                "@type": "Question",
                name: "Can prefab buildings manufactured in China meet Canadian building codes?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, but they must be adapted and engineered to comply with Canadian building codes and provincial regulations. This often involves structural modifications, documentation, and coordination with local engineers.",
                },
              },
              {
                "@type": "Question",
                name: "Is CSA certification required for prefab or modular buildings in Canada?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "In many cases, CSA certification or equivalent compliance validation is required, particularly for electrical systems and certain building components. Requirements vary based on project type and jurisdiction.",
                },
              },
              {
                "@type": "Question",
                name: "What is included in an EPC construction model?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "EPC (Engineering, Procurement, and Construction) includes project design, material sourcing, manufacturing, logistics, and on-site execution. It provides a fully integrated delivery approach with a single coordination structure.",
                },
              },
              {
                "@type": "Question",
                name: "How long does it take to complete a prefab construction project from China to Canada?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Typical timelines range from 8 to 20 weeks, depending on project scale. This includes design finalization, manufacturing, shipping, customs clearance, and installation preparation.",
                },
              },
              {
                "@type": "Question",
                name: "Is steel structure construction more cost-effective than traditional methods?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "For many industrial and commercial projects, steel structures are more cost-efficient and faster to deploy, especially when combined with prefabrication and modular construction methods.",
                },
              },
              {
                "@type": "Question",
                name: "How can I estimate the cost of my specific construction project?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Accurate cost estimation requires project-specific details, including size, location, design requirements, and compliance scope. A tailored evaluation is recommended for reliable budgeting.",
                },
              },
            ],
          }),
        }}
      />

      <main className="bg-white">

        {/* ══════════════════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════════════════ */}
        <section
          aria-label="Hero"
          className="relative overflow-hidden py-28 px-4"
        >
          {/* Background construction image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&h=900&q=60&fit=crop"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Light dark scrim only at bottom for text readability */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)" }}
          />

          <div className="relative max-w-4xl mx-auto text-center">
            <div
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-6"
              style={{ backgroundColor: GOLD, boxShadow: `0 8px 24px rgba(212,175,55,0.4)` }}
            >
              <HardHat className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
              End-to-End Construction Solutions<br className="hidden md:block" />
              <span style={{ color: GOLD }}> from China to Canada</span>
            </h1>

            <p className="text-lg md:text-xl text-purple-200 max-w-3xl mx-auto mb-4 leading-relaxed">
              We deliver integrated EPC, prefabricated structures, and industrial construction
              solutions—combining Chinese manufacturing efficiency with Canadian compliance standards.
            </p>
            <p className="text-base text-purple-300 max-w-2xl mx-auto mb-10">
              From design and procurement to logistics, installation, and certification—we manage
              the full project lifecycle.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <CTAButton href="/contact?subject=Project Quote Request">
                Get a Project Quote
              </CTAButton>
              <CTAButton href="/contact?subject=Book a Consultation" variant="outline">
                <span style={{ color: "#fff" }}>Book a Consultation</span>
              </CTAButton>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            TRUST STRIP
        ══════════════════════════════════════════════════════════════════ */}
        <section
          aria-label="Trust indicators"
          className="border-b"
          style={{ borderColor: `${GOLD}33`, backgroundColor: "#FDFBF7" }}
        >
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Globe,       label: "China Manufacturing Network" },
                { icon: ShieldCheck, label: "Canada Compliance Focus (CSA / Building Code)" },
                { icon: ClipboardList, label: "EPC Project Delivery Model" },
                { icon: LayoutGrid,  label: "Industrial & Modular Expertise" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "#EDE9F6" }}
                  >
                    <Icon className="h-4 w-4" style={{ color: PURPLE }} />
                  </span>
                  <span className="text-sm font-semibold text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 1 — WHAT WE DO
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="what-we-do" className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <SectionLabel>What We Do</SectionLabel>
                <SectionHeading id="what-we-do">
                  Comprehensive Construction Delivery System
                </SectionHeading>
                <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Apex Modular Construction provides a fully integrated construction solution that connects
                    Chinese manufacturing capability with Canadian construction requirements.
                  </p>
                  <p>
                    We specialize in delivering complex projects that require coordination across
                    engineering, procurement, logistics, and on-site execution.
                  </p>
                  <p>
                    Our approach reduces cost, improves speed, and ensures compliance from start
                    to finish.
                  </p>
                </div>
              </div>

              {/* Visual stat cards */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "EPC", label: "Full Project Delivery" },
                  { value: "CSA", label: "Compliance Aligned" },
                  { value: "CN→CA", label: "Cross-Border Expertise" },
                  { value: "360°", label: "Lifecycle Management" },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="rounded-2xl p-5 text-center"
                    style={{
                      background: `linear-gradient(135deg, ${PURPLE}08 0%, ${GOLD}08 100%)`,
                      border: `1.5px solid ${GOLD}44`,
                    }}
                  >
                    <p className="text-2xl font-extrabold mb-1" style={{ color: PURPLE }}>
                      {value}
                    </p>
                    <p className="text-xs font-semibold text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — CORE SOLUTIONS
        ══════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="core-solutions"
          className="py-20 px-4"
          style={{ backgroundColor: "#F8F6FC" }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <SectionLabel>Core Solutions</SectionLabel>
              <SectionHeading id="core-solutions">Our Construction Solutions</SectionHeading>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: Building2,
                  number: "01",
                  title: "Prefabricated Building Solutions",
                  description:
                    "We supply and deliver prefabricated structures manufactured in China for residential, commercial, and industrial use in Canada.",
                  items: [
                    "Steel frame structures",
                    "Modular buildings",
                    "Rapid-deployment housing",
                    "Factory-built components",
                  ],
                  tagline: "Designed for speed, cost efficiency, and scalability.",
                },
                {
                  icon: Wrench,
                  number: "02",
                  title: "EPC Construction Delivery",
                  description:
                    "We manage full Engineering, Procurement, and Construction (EPC) workflows for international projects.",
                  items: [
                    "Engineering coordination",
                    "Material sourcing from China",
                    "Logistics and shipping",
                    "On-site construction support",
                  ],
                  tagline: "Ideal for large-scale industrial and infrastructure projects.",
                },
                {
                  icon: Package,
                  number: "03",
                  title: "China–Canada Supply Chain Construction",
                  description:
                    "We optimize cross-border procurement and logistics for construction materials and systems.",
                  items: [
                    "Factory sourcing in China",
                    "Export coordination",
                    "Freight and customs handling",
                    "Canada delivery integration",
                  ],
                  tagline: "Reduces cost and supply delays significantly.",
                },
                {
                  icon: FileCheck,
                  number: "04",
                  title: "Compliance & Certification Support",
                  description:
                    "We help ensure imported systems meet Canadian standards.",
                  items: [
                    "CSA compliance alignment",
                    "Building code consultation",
                    "Technical documentation support",
                    "Certification guidance",
                  ],
                  tagline: "Critical for approval and project success in Canada.",
                },
                {
                  icon: Factory,
                  number: "05",
                  title: "Light Steel Structure Systems",
                  description:
                    "We design high-precision light steel structure systems in China and deliver them directly to Canada for rapid on-site assembly.",
                  items: [
                    "Custom architectural design",
                    "Precision steel manufacturing",
                    "Sea-freight logistics to Canada",
                    "Major cost-efficiency optimization",
                  ],
                  tagline: "Cost: $700 CAD/SQM (China) vs $2000 CAD/SQM (Canada)",
                },
              ].map(({ icon: Icon, number, title, description, items, tagline }) => (
                <article
                  key={title}
                  className="rounded-2xl bg-white p-7 transition-shadow hover:shadow-md"
                  style={{ border: `1.5px solid ${PURPLE}18`, boxShadow: `0 2px 8px rgba(75,29,143,0.08)` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "#EDE9F6" }}
                    >
                      <Icon className="h-6 w-6" style={{ color: PURPLE }} />
                    </div>
                    <div>
                      <span className="text-xs font-bold" style={{ color: GOLD }}>{number}</span>
                      <h3 className="text-lg font-extrabold text-gray-900 leading-snug">{title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{description}</p>
                  <ul className="space-y-1.5 mb-4">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p
                    className="text-xs font-bold rounded-lg px-3 py-2 inline-block"
                    style={{ backgroundColor: "#EDE9F6", color: PURPLE }}
                  >
                    → {tagline}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 3 — HOW IT WORKS
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="how-it-works" className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <SectionLabel>Process</SectionLabel>
              <SectionHeading id="how-it-works">Our Project Delivery Process</SectionHeading>
            </div>

            <ol className="relative space-y-0">
              {[
                {
                  icon: ClipboardList,
                  step: "01",
                  title: "Consultation & Feasibility Review",
                  body: "We assess your project scope, budget, and feasibility to determine the optimal delivery approach.",
                },
                {
                  icon: Cog,
                  step: "02",
                  title: "Design & Engineering Coordination",
                  body: "We align Chinese manufacturing capabilities with Canadian building requirements and engineering standards.",
                },
                {
                  icon: Factory,
                  step: "03",
                  title: "Procurement & Manufacturing",
                  body: "We source and produce components from verified Chinese factories with quality control at every stage.",
                },
                {
                  icon: Truck,
                  step: "04",
                  title: "Logistics & Importation",
                  body: "We manage shipping, customs clearance, and last-mile delivery to your Canadian project site.",
                },
                {
                  icon: HardHat,
                  step: "05",
                  title: "On-Site Execution Support",
                  body: "We assist with installation, assembly, and compliance verification to ensure project success.",
                },
              ].map(({ icon: Icon, step, title, body }, idx, arr) => (
                <li key={step} className="flex gap-6">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-extrabold text-white text-sm"
                      style={{ backgroundColor: PURPLE, boxShadow: `0 4px 12px rgba(75,29,143,0.35)` }}
                    >
                      {step}
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="w-0.5 flex-1 my-2" style={{ backgroundColor: `${PURPLE}22` }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-10 pt-1.5 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4" style={{ color: GOLD }} />
                      <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 4 — WHY CARGOPLUS
        ══════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="why-cargoplus"
          className="py-20 px-4"
          style={{ backgroundColor: "#F8F6FC" }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <SectionLabel>Why Apex Modular Construction</SectionLabel>
              <SectionHeading id="why-cargoplus">Why Clients Work With Us</SectionHeading>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Globe,       title: "Direct Manufacturing Access", body: "Direct access to China's manufacturing ecosystem — no middlemen, lower costs." },
                { icon: DollarSign,  title: "Lower Construction Costs",    body: "Significant savings on materials and construction through optimized China sourcing." },
                { icon: Clock,       title: "Faster Project Timelines",    body: "Streamlined procurement and logistics reduce project delivery time substantially." },
                { icon: ShieldCheck, title: "Cross-Border Compliance",     body: "Deep understanding of both Chinese manufacturing and Canadian building standards." },
                { icon: Award,       title: "End-to-End Accountability",   body: "Single point of contact for the entire project lifecycle — from design to delivery." },
                { icon: CheckCircle, title: "Verified Factory Network",    body: "All manufacturing partners are vetted for quality, capacity, and export compliance." },
              ].map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl bg-white p-6"
                  style={{ border: `1.5px solid ${PURPLE}18`, boxShadow: `0 2px 8px rgba(75,29,143,0.08)` }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl mb-4"
                    style={{ backgroundColor: "#EDE9F6" }}
                  >
                    <Icon className="h-5 w-5" style={{ color: PURPLE }} />
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900 mb-1.5">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 5 — USE CASES
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="use-cases" className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <SectionLabel>Use Cases</SectionLabel>
              <SectionHeading id="use-cases">Projects We Support</SectionHeading>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: Factory,    label: "Industrial Facilities" },
                { icon: Home,       label: "Residential Prefab Communities" },
                { icon: Warehouse,  label: "Warehouses & Logistics Centers" },
                { icon: LayoutGrid, label: "Modular Housing Developments" },
                { icon: Landmark,   label: "Government & Infrastructure Projects" },
                { icon: Building2,  label: "Light Steel Structures" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl px-5 py-3.5"
                  style={{
                    border: `1.5px solid ${GOLD}55`,
                    background: `linear-gradient(135deg, ${PURPLE}06 0%, ${GOLD}06 100%)`,
                  }}
                >
                  <Icon className="h-5 w-5 shrink-0" style={{ color: PURPLE }} />
                  <span className="text-sm font-semibold text-gray-800">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 6 — COST SIGNAL
        ══════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="cost-guide"
          className="py-20 px-4 bg-white"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>
                Cost Reference
              </p>
              <h2
                id="cost-guide"
                className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight"
              >
                Prefab Construction Cost in Canada
              </h2>
              <p className="mt-3 text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">
                Reference ranges for 2026. Actual costs depend on project size, location, design
                complexity, and compliance scope. Use these as a starting point — not a final budget.{" "}
                <Link
                  href="/services/csa-certification"
                  className="font-bold underline hover:opacity-80"
                  style={{ color: PURPLE }}
                >
                  CSA compliance affects your total cost — see the full breakdown →
                </Link>
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {[
                {
                  label: "Basic Prefab / Modular",
                  range: "$120 – $200",
                  unit: "per sq ft",
                  note: "Simple steel-frame or modular units, standard finishes",
                  color: "#EDE9F6",
                },
                {
                  label: "Mid-Range Prefab",
                  range: "$200 – $300",
                  unit: "per sq ft",
                  note: "Custom design, upgraded materials, CSA compliance work",
                  color: "#FDF8EC",
                },
                {
                  label: "Complex / High-Spec",
                  range: "$300 – $400+",
                  unit: "per sq ft",
                  note: "Industrial, multi-story, or high-compliance projects",
                  color: "#EDE9F6",
                },
                {
                  label: "Light Steel Structure",
                  range: "$700 CAD",
                  unit: "per SQM (Delivered)",
                  note: "Directly from China vs. $2,000+ local cost. Includes design & sea-freight.",
                  color: "#FDF8EC",
                },
                {
                  label: "Typical Project Timeline",
                  range: "8 – 20 weeks",
                  unit: "design to delivery",
                  note: "Includes manufacturing, shipping, customs, and site prep coordination.",
                  color: "#EDE9F6",
                },
                {
                  label: "China-Sourced Savings",
                  range: "Up to 65%",
                  unit: "vs. Local Contractors",
                  note: "$700 CAD (China) vs. $2,000+ CAD (Local Canadian Contractor) per SQM.",
                  color: "#FDF8EC",
                },
              ].map(({ label, range, unit, note, color }) => (
                <div
                  key={label}
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: color, border: `1.5px solid ${GOLD}33` }}
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{label}</p>
                  <p className="text-2xl font-extrabold mb-0.5" style={{ color: PURPLE }}>{range}</p>
                  <p className="text-xs font-semibold text-gray-500 mb-3">{unit}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{note}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-gray-400 mb-8">
              * All figures are estimates for planning purposes. Request a project-specific assessment for accurate budgeting.
            </p>

            {/* Comparison Highlight */}
            <div className="max-w-4xl mx-auto rounded-3xl p-8 md:p-12 text-center mb-16 shadow-2xl" style={{ backgroundColor: PURPLE }}>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-8">
                The Real Price Gap: China vs. Canada
              </h3>
              <div className="grid md:grid-cols-2 gap-8 items-stretch">
                <div className="p-8 rounded-2xl bg-white/10 border border-white/20 flex flex-col justify-center">
                  <p className="text-xs font-black text-purple-200 uppercase mb-3 tracking-widest">Local Canadian Contractor</p>
                  <p className="text-5xl font-black text-white">$2,000+</p>
                  <p className="text-sm text-purple-200 mt-2 font-bold uppercase tracking-tighter">Average per SQM (CAD)</p>
                </div>
                <div className="p-8 rounded-2xl bg-\[#D4AF37\] flex flex-col justify-center transform md:scale-110 shadow-xl">
                  <p className="text-xs font-black text-purple-900 uppercase mb-3 tracking-widest">Apex Modular Construction (China Sourced)</p>
                  <p className="text-6xl font-black text-purple-900">$700</p>
                  <p className="text-sm text-purple-900 mt-2 font-black uppercase tracking-tighter">Delivered to Canada (CAD)</p>
                </div>
              </div>
              <p className="mt-10 text-purple-100 text-sm font-medium max-w-2xl mx-auto leading-relaxed">
                * Comparison based on light steel structure projects. Apex Modular Construction pricing includes 
                architectural design, precision engineering, factory fabrication, and sea-freight logistics.
              </p>
            </div>

            {/* Light Steel Structure Specific FAQ */}
            <LightSteelStructureFAQSection />

            {/* Mid-page CTA */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact?subject=Estimate My Project Cost"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-4 text-base font-bold transition-all hover:opacity-90"
                style={{ backgroundColor: PURPLE, color: "#fff", border: `2px solid ${GOLD}` }}
              >
                Estimate My Project Cost
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact?subject=Request Cost Breakdown"
                className="inline-flex items-center gap-2 rounded-xl border-2 px-7 py-4 text-base font-bold transition-all hover:opacity-80"
                style={{ borderColor: PURPLE, color: PURPLE }}
              >
                Request a Cost Breakdown
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 7 — INTERNAL LINKS (topic cluster)
        ══════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="related-topics"
          className="py-16 px-4"
          style={{ backgroundColor: "#F8F6FC" }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: GOLD }}>
                Related Topics
              </p>
              <h2
                id="related-topics"
                className="text-2xl font-extrabold text-gray-900"
              >
                Explore More Construction Resources
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              <Link
                href="/services/csa-certification"
                className="group rounded-2xl bg-white p-6 transition-shadow hover:shadow-md"
                style={{ border: `1.5px solid ${PURPLE}18` }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl mb-4"
                  style={{ backgroundColor: "#EDE9F6" }}
                >
                  <ShieldCheck className="h-5 w-5" style={{ color: PURPLE }} />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-1.5 group-hover:underline">
                  CSA Certification for Prefab Buildings in Canada
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  What CSA certification means for imported prefab structures, when it&apos;s required,
                  and how to navigate the process.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold" style={{ color: PURPLE }}>
                  Read guide <ChevronRight className="h-3 w-3" />
                </span>
              </Link>

              <Link
                href="/contact?subject=EPC Project Inquiry"
                className="group rounded-2xl bg-white p-6 transition-shadow hover:shadow-md"
                style={{ border: `1.5px solid ${PURPLE}18` }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl mb-4"
                  style={{ backgroundColor: "#EDE9F6" }}
                >
                  <Wrench className="h-5 w-5" style={{ color: PURPLE }} />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-1.5 group-hover:underline">
                  EPC Project Delivery Model
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  How the Engineering, Procurement, and Construction model works for China-to-Canada
                  industrial projects.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold" style={{ color: PURPLE }}>
                  Get in touch <ChevronRight className="h-3 w-3" />
                </span>
              </Link>

              <Link
                href="/shipping"
                className="group rounded-2xl bg-white p-6 transition-shadow hover:shadow-md"
                style={{ border: `1.5px solid ${PURPLE}18` }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl mb-4"
                  style={{ backgroundColor: "#EDE9F6" }}
                >
                  <Truck className="h-5 w-5" style={{ color: PURPLE }} />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-1.5 group-hover:underline">
                  China–Canada Freight & Logistics
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Shipping timelines, customs clearance, and last-mile delivery for construction
                  materials and prefab components.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold" style={{ color: PURPLE }}>
                  Learn more <ChevronRight className="h-3 w-3" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 8 — ESTIMATE FORM
        ══════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="estimate-form-heading"
          className="py-20 px-4 bg-white"
        >
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>
                Free Estimate
              </p>
              <h2
                id="estimate-form-heading"
                className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight"
              >
                Get a Project Cost Estimate
              </h2>
              <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
                Tell us about your project and we&apos;ll provide a detailed cost estimate including
                manufacturing, logistics, and compliance costs.
              </p>
            </div>
            <ProjectEstimateForm />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 9 — PREFAB & EPC FAQ
        ══════════════════════════════════════════════════════════════════ */}
        <PrefabEPCFAQSection />

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 9 — CTA
        ══════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="cta"
          className="py-24 px-4 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #2d0f5e 100%)` }}
        >
          {/* Background image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1920&h=600&q=50&fit=crop"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          {/* Gold dot grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(212,175,55,0.8) 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />
          {/* Glow orbs */}
          <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: GOLD }} />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: "#fff" }} />
          <div className="relative max-w-3xl mx-auto text-center">
            {/* Gold corner accents */}
            <div className="relative inline-block w-full">
              <h2
                id="cta"
                className="text-3xl md:text-4xl font-extrabold text-white mb-5 leading-tight"
              >
                Start Your Construction Project With Us
              </h2>
            </div>
            <p className="text-lg text-purple-200 mb-10 leading-relaxed">
              Whether you&apos;re planning a prefab development or a full EPC industrial project,
              Apex Modular Construction connects China&apos;s manufacturing strength with Canada&apos;s construction
              standards.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact?subject=Request Project Evaluation"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-4 text-base font-bold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: GOLD, color: "#1a1a2e" }}
              >
                Request Project Evaluation
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact?subject=Submit Project Details"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-4 text-base font-bold transition-all hover:bg-white/10"
                style={{ border: "2px solid rgba(255,255,255,0.5)", color: "#fff" }}
              >
                Submit Project Details
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact?subject=Speak With Our Team"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-4 text-base font-bold transition-all hover:bg-white/10"
                style={{ border: "2px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.8)" }}
              >
                Speak With Our Team
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
