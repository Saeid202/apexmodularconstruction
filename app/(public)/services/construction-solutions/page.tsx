import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2, Wrench, Package, FileCheck, ChevronRight,
  Factory, Home, Warehouse, LayoutGrid, Landmark,
  Globe, DollarSign, Clock, ShieldCheck, Award,
  ClipboardList, Cog, Truck, HardHat, CheckCircle,
} from "lucide-react";
import { PrefabEPCFAQSection, ProjectEstimateForm, LightSteelStructureFAQSection } from "./ConstructionPageClient";
import { Section, SectionHeader, SectionEyebrow, SectionHeading } from "@/components/ui/Section";


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

export default function ConstructionSolutionsPage() {
  return (
    <>
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

      <main className="bg-background">

        {/* HERO */}
        <section
          aria-label="Hero"
          className="relative overflow-hidden py-28 px-6"
        >
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&h=900&q=60&fit=crop"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)" }}
          />

          <div className="relative max-w-4xl mx-auto text-center">
            <div
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-6 bg-secondary-500 shadow-elevation-high"
            >
              <HardHat className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
              End-to-End Construction Solutions<br className="hidden md:block" />
              <span className="text-secondary-500"> from China to Canada</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-200 max-w-3xl mx-auto mb-4 leading-relaxed">
              We deliver integrated EPC, prefabricated structures, and industrial construction
              solutions—combining Chinese manufacturing efficiency with Canadian compliance standards.
            </p>
            <p className="text-base text-primary-300 max-w-2xl mx-auto mb-10">
              From design and procurement to logistics, installation, and certification—we manage
              the full project lifecycle.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact?subject=Project Quote Request"
                className="inline-flex items-center gap-2 rounded-xl bg-primary border-2 border-secondary-500 text-white px-6 py-3.5 text-base font-bold transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Get a Project Quote
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact?subject=Book a Consultation"
                className="inline-flex items-center gap-2 rounded-xl bg-transparent border-2 border-white/50 text-white px-6 py-3.5 text-base font-bold transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Book a Consultation
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <Section
          ariaLabel="Trust indicators"
          className="border-b border-secondary-500/20 bg-amber-50/30"
          padding="sm"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Globe,       label: "China Manufacturing Network" },
              { icon: ShieldCheck, label: "Canada Compliance Focus (CSA / Building Code)" },
              { icon: ClipboardList, label: "EPC Project Delivery Model" },
              { icon: LayoutGrid,  label: "Industrial & Modular Expertise" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                <span className="text-sm font-semibold text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* WHAT WE DO */}
        <Section id="what-we-do" ariaLabelledby="what-we-do">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <SectionEyebrow>What We Do</SectionEyebrow>
              <SectionHeading id="what-we-do">
                Comprehensive Construction Delivery System
              </SectionHeading>
              <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
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

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "EPC", label: "Full Project Delivery" },
                { value: "CSA", label: "Compliance Aligned" },
                { value: "CN→CA", label: "Cross-Border Expertise" },
                { value: "360°", label: "Lifecycle Management" },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="rounded-2xl p-5 text-center bg-gradient-to-br from-primary/[0.03] to-secondary-500/[0.03] border border-secondary-500/25"
                >
                  <p className="text-2xl font-extrabold mb-1 text-primary">
                    {value}
                  </p>
                  <p className="text-xs font-semibold text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* CORE SOLUTIONS */}
        <Section ariaLabelledby="core-solutions" background="muted">
          <SectionHeader
            eyebrow="Core Solutions"
            heading="Our Construction Solutions"
            center
          />

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
                className="rounded-2xl bg-background p-7 border border-primary/10 shadow-elevation-low transition-shadow hover:shadow-elevation-medium"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-secondary-500">{number}</span>
                    <h3 className="text-lg font-extrabold text-gray-900 leading-snug">{title}</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>
                <ul className="space-y-1.5 mb-4">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 text-secondary-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs font-bold rounded-lg px-3 py-2 inline-block bg-primary-50 text-primary">
                  → {tagline}
                </p>
              </article>
            ))}
          </div>
        </Section>

        {/* PROCESS */}
        <Section id="how-it-works" ariaLabelledby="how-it-works">
          <SectionHeader
            eyebrow="Process"
            heading="Our Project Delivery Process"
            center
          />

          <div className="max-w-4xl mx-auto">
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
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-extrabold text-white text-sm bg-primary shadow-elevation-medium">
                      {step}
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="w-0.5 flex-1 my-2 bg-primary/15" />
                    )}
                  </div>

                  <div className="pb-10 pt-1.5 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-secondary-500" />
                      <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Section>

        {/* WHY US */}
        <Section id="why-cargoplus" ariaLabelledby="why-cargoplus" background="muted">
          <SectionHeader
            eyebrow="Why Apex Modular Construction"
            heading="Why Clients Work With Us"
            center
          />

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
                className="rounded-2xl bg-background p-6 border border-primary/10 shadow-elevation-low"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-4 bg-primary-50">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* USE CASES */}
        <Section id="use-cases" ariaLabelledby="use-cases">
          <SectionHeader
            eyebrow="Use Cases"
            heading="Projects We Support"
            center
          />

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
                className="flex items-center gap-3 rounded-2xl px-5 py-3.5 border border-secondary-500/30 bg-gradient-to-br from-primary/[0.02] to-secondary-500/[0.02]"
              >
                <Icon className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-gray-800">{label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* COST GUIDE */}
        <Section id="cost-guide" ariaLabelledby="cost-guide">
          <SectionHeader
            eyebrow="Cost Reference"
            heading="Prefab Construction Cost in Canada"
            subheading="Reference ranges for 2026. Actual costs depend on project size, location, design complexity, and compliance scope. Use these as a starting point — not a final budget."
            center
          >
            <Link
              href="/services/csa-certification"
              className="font-bold underline hover:opacity-80 text-primary text-sm"
            >
              CSA compliance affects your total cost — see the full breakdown →
            </Link>
          </SectionHeader>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {[
              {
                label: "Basic Prefab / Modular",
                range: "$120 – $200",
                unit: "per sq ft",
                note: "Simple steel-frame or modular units, standard finishes",
                color: "bg-primary-50",
              },
              {
                label: "Mid-Range Prefab",
                range: "$200 – $300",
                unit: "per sq ft",
                note: "Custom design, upgraded materials, CSA compliance work",
                color: "bg-amber-50",
              },
              {
                label: "Complex / High-Spec",
                range: "$300 – $400+",
                unit: "per sq ft",
                note: "Industrial, multi-story, or high-compliance projects",
                color: "bg-primary-50",
              },
              {
                label: "Light Steel Structure",
                range: "$700 CAD",
                unit: "per SQM (Delivered)",
                note: "Directly from China vs. $2,000+ local cost. Includes design & sea-freight.",
                color: "bg-amber-50",
              },
              {
                label: "Typical Project Timeline",
                range: "8 – 20 weeks",
                unit: "design to delivery",
                note: "Includes manufacturing, shipping, customs, and site prep coordination.",
                color: "bg-primary-50",
              },
              {
                label: "China-Sourced Savings",
                range: "Up to 65%",
                unit: "vs. Local Contractors",
                note: "$700 CAD (China) vs. $2,000+ CAD (Local Canadian Contractor) per SQM.",
                color: "bg-amber-50",
              },
            ].map(({ label, range, unit, note, color }) => (
              <div
                key={label}
                className={`rounded-2xl p-6 ${color} border border-secondary-500/20`}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{label}</p>
                <p className="text-2xl font-extrabold mb-0.5 text-primary">{range}</p>
                <p className="text-xs font-semibold text-gray-500 mb-3">{unit}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{note}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mb-8">
            * All figures are estimates for planning purposes. Request a project-specific assessment for accurate budgeting.
          </p>

          <div className="max-w-4xl mx-auto rounded-3xl p-8 md:p-12 text-center mb-16 bg-primary shadow-elevation-high">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-8">
              The Real Price Gap: China vs. Canada
            </h3>
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              <div className="p-8 rounded-2xl bg-white/10 border border-white/20 flex flex-col justify-center">
                <p className="text-xs font-black text-primary-200 uppercase mb-3 tracking-widest">Local Canadian Contractor</p>
                <p className="text-5xl font-black text-white">$2,000+</p>
                <p className="text-sm text-primary-200 mt-2 font-bold uppercase tracking-tighter">Average per SQM (CAD)</p>
              </div>
              <div className="p-8 rounded-2xl bg-secondary-500 flex flex-col justify-center transform md:scale-110 shadow-elevation-medium">
                <p className="text-xs font-black text-primary-900 uppercase mb-3 tracking-widest">Apex Modular Construction (China Sourced)</p>
                <p className="text-6xl font-black text-primary-900">$700</p>
                <p className="text-sm text-primary-900 mt-2 font-black uppercase tracking-tighter">Delivered to Canada (CAD)</p>
              </div>
            </div>
            <p className="mt-10 text-primary-100 text-sm font-medium max-w-2xl mx-auto leading-relaxed">
              * Comparison based on light steel structure projects. Apex Modular Construction pricing includes 
              architectural design, precision engineering, factory fabrication, and sea-freight logistics.
            </p>
          </div>

          <LightSteelStructureFAQSection />

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact?subject=Estimate My Project Cost"
              className="inline-flex items-center gap-2 rounded-xl bg-primary border-2 border-secondary-500 text-white px-7 py-4 text-base font-bold transition-all hover:opacity-90"
            >
              Estimate My Project Cost
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact?subject=Request Cost Breakdown"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-primary text-primary px-7 py-4 text-base font-bold transition-all hover:opacity-80"
            >
              Request a Cost Breakdown
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </Section>

        {/* RELATED TOPICS */}
        <Section id="related-topics" ariaLabelledby="related-topics" background="muted" padding="md">
          <SectionHeader
            eyebrow="Related Topics"
            heading="Explore More Construction Resources"
            center
          />

          <div className="grid sm:grid-cols-3 gap-5">
            <Link
              href="/services/csa-certification"
              className="group rounded-2xl bg-background p-6 border border-primary/10 transition-shadow hover:shadow-elevation-medium"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-4 bg-primary-50">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-extrabold text-gray-900 mb-1.5 group-hover:underline">
                CSA Certification for Prefab Buildings in Canada
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                What CSA certification means for imported prefab structures, when it&apos;s required,
                and how to navigate the process.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
                Read guide <ChevronRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/contact?subject=EPC Project Inquiry"
              className="group rounded-2xl bg-background p-6 border border-primary/10 transition-shadow hover:shadow-elevation-medium"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-4 bg-primary-50">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-extrabold text-gray-900 mb-1.5 group-hover:underline">
                EPC Project Delivery Model
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                How the Engineering, Procurement, and Construction model works for China-to-Canada
                industrial projects.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
                Get in touch <ChevronRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/shipping"
              className="group rounded-2xl bg-background p-6 border border-primary/10 transition-shadow hover:shadow-elevation-medium"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-4 bg-primary-50">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-extrabold text-gray-900 mb-1.5 group-hover:underline">
                China–Canada Freight & Logistics
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Shipping timelines, customs clearance, and last-mile delivery for construction
                materials and prefab components.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
                Learn more <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </Section>

        {/* ESTIMATE FORM */}
        <Section id="estimate-form-heading" ariaLabelledby="estimate-form-heading">
          <div className="max-w-2xl mx-auto">
            <SectionHeader
              eyebrow="Free Estimate"
              heading="Get a Project Cost Estimate"
              subheading="Tell us about your project and we&apos;ll provide a detailed cost estimate including manufacturing, logistics, and compliance costs."
              center
            />
            <ProjectEstimateForm />
          </div>
        </Section>

        <PrefabEPCFAQSection />

        {/* FINAL CTA */}
        <Section
          ariaLabelledby="cta"
          className="relative overflow-hidden"
          background="brand"
        >
          <img
            src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1920&h=600&q=50&fit=crop"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(212,175,55,0.8) 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full opacity-20 blur-3xl bg-secondary-500" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full opacity-15 blur-3xl bg-white" />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="relative inline-block w-full">
              <h2
                id="cta"
                className="text-3xl md:text-4xl font-extrabold text-white mb-5 leading-tight"
              >
                Start Your Construction Project With Us
              </h2>
            </div>
            <p className="text-lg text-primary-200 mb-10 leading-relaxed">
              Whether you&apos;re planning a prefab development or a full EPC industrial project,
              Apex Modular Construction connects China&apos;s manufacturing strength with Canada&apos;s construction
              standards.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact?subject=Request Project Evaluation"
                className="inline-flex items-center gap-2 rounded-xl bg-secondary-500 text-[#1a1a2e] px-7 py-4 text-base font-bold transition-all hover:opacity-90"
              >
                Request Project Evaluation
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact?subject=Submit Project Details"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-4 text-base font-bold text-white transition-all hover:bg-white/10 border-2 border-white/50"
              >
                Submit Project Details
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact?subject=Speak With Our Team"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-4 text-base font-bold text-white/80 transition-all hover:bg-white/10 border-2 border-white/30"
              >
                Speak With Our Team
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Section>

      </main>
    </>
  );
}
