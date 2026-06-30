import type { Metadata } from "next";

import Link from "next/link";
import {
  ChevronRight, ShieldCheck, FileCheck, AlertTriangle,
  CheckCircle, ClipboardList, DollarSign, Clock,
  Globe, Award, Wrench, HardHat, BookOpen, Scale,
} from "lucide-react";
import { CSAFAQSection, ProjectEstimateForm } from "./CSAPageClient";

/* ─── SEO ─────────────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: "CSA Certification for Prefab Buildings in Canada (2026 Guide) | Apex Modular Construction",
  description:
    "Complete guide to CSA certification requirements for prefabricated buildings imported from China to Canada. When it's required, how to comply, common mistakes, costs, and the approval process.",
  keywords: [
    "CSA certification prefab buildings Canada",
    "CSA compliance imported construction Canada",
    "prefab buildings Canadian building code",
    "CSA A277 modular buildings",
    "China prefab Canada compliance",
    "CSA certification cost Canada",
    "National Building Code Canada prefab",
    "imported steel structures CSA compliance",
  ],
  alternates: {
    canonical: "https://cargoplus.site/services/csa-certification",
  },
  openGraph: {
    title: "CSA Certification for Prefab Buildings in Canada (2026 Guide) | Apex Modular Construction",
    description:
      "Complete guide to CSA certification requirements for prefabricated buildings imported from China to Canada. When it's required, how to comply, common mistakes, and costs.",
    type: "article",
    url: "https://cargoplus.site/services/csa-certification",
  },
};

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>
      {children}
    </p>
  );
}

function SectionHeading({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight"
    >
      {children}
    </h2>
  );
}

function CTAButton({
  href,
  variant = "primary",
  children,
}: {
  href: string;
  variant?: "primary" | "outline" | "ghost";
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const styles =
    variant === "primary"
      ? { backgroundColor: PURPLE, color: "#fff", border: `2px solid ${GOLD}` }
      : variant === "outline"
      ? { backgroundColor: "transparent", color: PURPLE, border: `2px solid ${PURPLE}` }
      : { backgroundColor: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,0.5)" };
  return (
    <Link href={href} className={base} style={styles}>
      {children}
      <ChevronRight className="h-4 w-4" />
    </Link>
  );
}

export default function CSACertificationPage() {
  return (
    <>
      {/* ── JSON-LD: Article ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "CSA Certification for Prefab Buildings in Canada (2026 Guide)",
            description:
              "Complete guide to CSA certification requirements for prefabricated buildings imported from China to Canada.",
            author: { "@type": "Organization", name: "Apex Modular Construction", url: "https://cargoplus.site" },
            publisher: { "@type": "Organization", name: "Apex Modular Construction", url: "https://cargoplus.site" },
            datePublished: "2026-01-01",
            dateModified: "2026-05-01",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://cargoplus.site/services/csa-certification",
            },
          }),
        }}
      />

      {/* ── JSON-LD: FAQ ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What does CSA stand for and what does it cover?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "CSA stands for Canadian Standards Association. It develops standards and certification programs covering electrical systems, structural components, building materials, and safety equipment used in Canadian construction.",
                },
              },
              {
                "@type": "Question",
                name: "Is CSA certification mandatory for all prefab buildings imported from China?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Not universally. Requirements depend on the component type, project jurisdiction, and intended use. Electrical systems almost always require CSA certification. Structural components may require engineering review and compliance documentation.",
                },
              },
              {
                "@type": "Question",
                name: "How long does the CSA certification process take?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Simple components may be certified in 4–8 weeks. Complex systems or custom-engineered structures can take 3–6 months. Planning for certification early in the project timeline is critical.",
                },
              },
              {
                "@type": "Question",
                name: "How much does CSA compliance add to the total project cost?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Compliance costs typically range from 3% to 8% of total project cost, depending on scope. These costs are almost always offset by the savings from Chinese manufacturing.",
                },
              },
              {
                "@type": "Question",
                name: "Can a Canadian engineer of record approve imported prefab components?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. A licensed Canadian engineer can review, stamp, and take responsibility for imported components, confirming they meet applicable codes. This is a common and accepted path for projects using overseas-manufactured structural systems.",
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
        <section aria-label="Hero" className="relative overflow-hidden py-28 px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&h=900&q=60&fit=crop"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.60) 100%)" }}
          />

          <div className="relative max-w-4xl mx-auto text-center">
            <div
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-6"
              style={{ backgroundColor: GOLD, boxShadow: `0 8px 24px rgba(212,175,55,0.4)` }}
            >
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
              CSA Certification for<br className="hidden md:block" />
              <span style={{ color: GOLD }}> Prefab Buildings in Canada</span>
            </h1>

            <p className="text-lg md:text-xl text-purple-200 max-w-3xl mx-auto mb-4 leading-relaxed">
              A complete guide to Canadian Standards Association requirements for prefabricated
              and modular buildings imported from China — what's required, how to comply, and
              what it costs.
            </p>
            <p className="text-base text-purple-300 max-w-2xl mx-auto mb-10">
              CSA compliance is not optional. It determines whether your project gets approved,
              permitted, and built on time.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <CTAButton href="/contact?subject=CSA Compliance Consultation">
                Get a Compliance Consultation
              </CTAButton>
              <CTAButton href="/services/construction-solutions" variant="ghost">
                <span style={{ color: "#fff" }}>View Construction Solutions</span>
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
                { icon: ShieldCheck, label: "CSA Group Standards" },
                { icon: BookOpen,    label: "National Building Code (NBC)" },
                { icon: Scale,       label: "Provincial Code Compliance" },
                { icon: Globe,       label: "China–Canada Certification Bridge" },
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
            SECTION 1 — WHAT IS CSA CERTIFICATION
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="what-is-csa" className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <SectionLabel>The Basics</SectionLabel>
                <SectionHeading id="what-is-csa">What Is CSA Certification?</SectionHeading>
                <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    CSA stands for <strong className="text-gray-900">Canadian Standards Association</strong>.
                    It is a not-for-profit organization that develops standards and runs certification
                    programs for products and systems used across Canada.
                  </p>
                  <p>
                    When a product carries a CSA mark, it means an accredited body has tested and
                    verified that it meets Canadian safety and performance requirements. For construction
                    projects, this matters at every stage — from building permits to final inspections.
                  </p>
                  <p>
                    For prefab buildings imported from China, CSA certification is the primary mechanism
                    for demonstrating that overseas-manufactured components meet Canadian standards.
                    Without it, projects face permit delays, failed inspections, and costly rework.
                  </p>
                </div>

                {/* Cross-link to construction solutions */}
                <div className="mt-8">
                  <Link
                    href="/services/construction-solutions"
                    className="inline-flex items-center gap-2 text-sm font-bold transition-colors hover:opacity-80"
                    style={{ color: PURPLE }}
                  >
                    <ChevronRight className="h-4 w-4" />
                    See how CSA compliance fits into our full construction delivery model
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "CSA", label: "Canadian Standards Association" },
                  { value: "NBC", label: "National Building Code Reference" },
                  { value: "A277", label: "Modular Building Standard" },
                  { value: "S16", label: "Steel Structure Standard" },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="rounded-2xl p-5 text-center"
                    style={{
                      background: `linear-gradient(135deg, ${PURPLE}08 0%, ${GOLD}08 100%)`,
                      border: `1.5px solid ${GOLD}44`,
                    }}
                  >
                    <p className="text-2xl font-extrabold mb-1" style={{ color: PURPLE }}>{value}</p>
                    <p className="text-xs font-semibold text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — WHEN IS IT REQUIRED
        ══════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="when-required"
          className="py-20 px-4"
          style={{ backgroundColor: "#F8F6FC" }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <SectionLabel>Requirements</SectionLabel>
              <SectionHeading id="when-required">When Is CSA Certification Required?</SectionHeading>
              <p className="mt-3 text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">
                Requirements vary by component type and jurisdiction. Here is a practical breakdown.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {[
                {
                  icon: ShieldCheck,
                  title: "Electrical Systems",
                  required: true,
                  body: "CSA C22.1 (Canadian Electrical Code) compliance is mandatory for all electrical components. This includes panels, wiring, fixtures, and switchgear. No exceptions — this is enforced at every inspection.",
                },
                {
                  icon: Wrench,
                  title: "Structural Steel & Connections",
                  required: true,
                  body: "CSA S16 governs steel structure design. Imported steel frames must be engineered to S16 requirements and reviewed by a Canadian engineer of record. The steel itself may not need a CSA mark, but the design must comply.",
                },
                {
                  icon: FileCheck,
                  title: "Modular / Factory-Built Units",
                  required: true,
                  body: "CSA A277 provides a factory certification pathway for modular buildings. If the Chinese factory holds A277 certification, the compliance process is significantly streamlined. Without it, each unit requires individual engineering review.",
                },
                {
                  icon: HardHat,
                  title: "Mechanical Systems (HVAC, Plumbing)",
                  required: false,
                  body: "Mechanical systems must meet applicable codes (NBC, provincial), but the specific certification path varies. Some components require CSA marks; others require compliance documentation from a licensed engineer.",
                },
                {
                  icon: Globe,
                  title: "Structural Concrete & Masonry",
                  required: false,
                  body: "CSA A23.3 (concrete) and CSA S304 (masonry) apply to these materials. Imported concrete products must meet equivalent standards, verified through material testing and engineering documentation.",
                },
                {
                  icon: Award,
                  title: "Fire-Rated Assemblies",
                  required: true,
                  body: "Fire-rated walls, floors, and ceilings must be tested and certified to ULC (Underwriters Laboratories of Canada) or equivalent standards. This is non-negotiable for occupancy permits.",
                },
              ].map(({ icon: Icon, title, required, body }) => (
                <article
                  key={title}
                  className="rounded-2xl bg-white p-6"
                  style={{ border: `1.5px solid ${PURPLE}18`, boxShadow: `0 2px 8px rgba(75,29,143,0.08)` }}
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "#EDE9F6" }}
                    >
                      <Icon className="h-5 w-5" style={{ color: PURPLE }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-extrabold text-gray-900">{title}</h3>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={
                            required
                              ? { backgroundColor: "#FEF3C7", color: "#92400E" }
                              : { backgroundColor: "#EDE9F6", color: PURPLE }
                          }
                        >
                          {required ? "Usually Required" : "Case-by-Case"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 3 — HOW PREFAB FROM CHINA CAN COMPLY
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="how-to-comply" className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <SectionLabel>Compliance Pathway</SectionLabel>
              <SectionHeading id="how-to-comply">
                How Prefab from China Can Meet Canadian Standards
              </SectionHeading>
              <p className="mt-3 text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">
                There are three main pathways. The right one depends on your project type and timeline.
              </p>
            </div>

            <div className="space-y-5">
              {[
                {
                  number: "01",
                  title: "Factory CSA Certification (Best for Modular Buildings)",
                  body: "The Chinese factory obtains CSA A277 certification through CSA Group's international program. This is the gold standard — it means every unit produced at that factory is pre-certified. It requires upfront investment from the factory but dramatically reduces per-project compliance costs.",
                  tag: "Best for repeat projects and large volumes",
                },
                {
                  number: "02",
                  title: "Third-Party Testing + Canadian Engineer Review",
                  body: "Components are tested by an accredited third-party lab (in China or Canada) to verify they meet CSA standards. A licensed Canadian engineer of record then reviews the test reports, stamps the drawings, and takes professional responsibility for compliance. This is the most common pathway for one-off projects.",
                  tag: "Most common for custom or one-off projects",
                },
                {
                  number: "03",
                  title: "Equivalency Documentation Package",
                  body: "For structural systems, a detailed engineering package demonstrates that the Chinese design meets or exceeds the requirements of the applicable CSA standard. This requires a Canadian engineer to review Chinese GB standards against CSA standards and document the equivalency. Some jurisdictions accept this; others require physical testing.",
                  tag: "Works for structural steel and concrete in many provinces",
                },
              ].map(({ number, title, body, tag }) => (
                <div
                  key={number}
                  className="rounded-2xl bg-white p-7 flex gap-6"
                  style={{ border: `1.5px solid ${PURPLE}18`, boxShadow: `0 2px 8px rgba(75,29,143,0.08)` }}
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-extrabold text-white text-sm"
                    style={{ backgroundColor: PURPLE, boxShadow: `0 4px 12px rgba(75,29,143,0.35)` }}
                  >
                    {number}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-extrabold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{body}</p>
                    <span
                      className="text-xs font-bold rounded-lg px-3 py-1.5 inline-block"
                      style={{ backgroundColor: "#EDE9F6", color: PURPLE }}
                    >
                      → {tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 4 — COMMON MISTAKES
        ══════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="common-mistakes"
          className="py-20 px-4"
          style={{ backgroundColor: "#F8F6FC" }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <SectionLabel>What Goes Wrong</SectionLabel>
              <SectionHeading id="common-mistakes">
                Common CSA Compliance Mistakes
              </SectionHeading>
              <p className="mt-3 text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">
                These are the mistakes that cause permit failures, stop-work orders, and expensive
                rework. Most are avoidable with early planning.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {[
                {
                  title: "Assuming GB Standards = CSA Standards",
                  body: "Chinese GB (Guobiao) standards are not equivalent to CSA standards. A product that meets GB requirements may still fail CSA compliance. Each standard must be mapped individually — there is no blanket equivalency.",
                },
                {
                  title: "Leaving Compliance to the Last Minute",
                  body: "Certification takes time. Starting the compliance process after materials are manufactured — or worse, after they arrive in Canada — leads to delays, storage costs, and sometimes complete rejection of materials.",
                },
                {
                  title: "Missing Electrical Certification",
                  body: "Electrical components without CSA or cUL marks will fail inspection every time. This is the single most common compliance failure for imported prefab buildings. It must be addressed at the factory, not on-site.",
                },
                {
                  title: "No Canadian Engineer of Record",
                  body: "Many buyers assume the Chinese manufacturer's engineer is sufficient. It is not. Canadian building permits require a licensed Canadian engineer to stamp drawings and take professional responsibility for the design.",
                },
                {
                  title: "Incomplete Documentation Package",
                  body: "Missing test reports, unsigned certifications, or drawings that don't match the as-built structure are common causes of permit rejection. A complete documentation package must be assembled before materials ship.",
                },
                {
                  title: "Ignoring Provincial Amendments",
                  body: "Each province amends the National Building Code with its own requirements. A project in BC faces different rules than one in Ontario or Alberta. Using a generic compliance package without provincial review is a frequent and costly mistake.",
                },
              ].map(({ title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl bg-white p-6 flex gap-4"
                  style={{ border: `1.5px solid #FECACA`, boxShadow: `0 2px 8px rgba(239,68,68,0.06)` }}
                >
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#EF4444" }} />
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 mb-1.5">{title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 5 — APPROVAL PROCESS
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="approval-process" className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <SectionLabel>Step by Step</SectionLabel>
              <SectionHeading id="approval-process">The CSA Approval Process</SectionHeading>
              <p className="mt-3 text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">
                From project start to permit approval — what happens at each stage.
              </p>
            </div>

            <ol className="relative space-y-0">
              {[
                {
                  icon: ClipboardList,
                  step: "01",
                  title: "Compliance Scoping",
                  body: "Identify which components require CSA certification, which require engineering review, and which provincial amendments apply. This determines the compliance strategy and timeline.",
                },
                {
                  icon: Globe,
                  step: "02",
                  title: "Factory Verification",
                  body: "Verify whether the Chinese manufacturer holds any existing CSA, UL, or equivalent certifications. Existing certifications can significantly reduce testing requirements and cost.",
                },
                {
                  icon: FileCheck,
                  step: "03",
                  title: "Testing & Certification",
                  body: "Submit components for testing at an accredited lab. For electrical systems, this must happen before manufacturing is complete. For structural systems, engineering review can happen in parallel with manufacturing.",
                },
                {
                  icon: Wrench,
                  step: "04",
                  title: "Canadian Engineering Review",
                  body: "A licensed Canadian engineer reviews all drawings, test reports, and specifications. They stamp the drawings and issue a Letter of Assurance confirming code compliance.",
                },
                {
                  icon: HardHat,
                  step: "05",
                  title: "Documentation Package Assembly",
                  body: "Compile the complete compliance package: stamped drawings, test reports, CSA certificates, material certifications, and Letters of Assurance. This package is submitted with the building permit application.",
                },
                {
                  icon: ShieldCheck,
                  step: "06",
                  title: "Building Permit Submission",
                  body: "Submit the permit application with the full compliance package to the local authority having jurisdiction (AHJ). Approval timelines vary by municipality — typically 2–8 weeks for straightforward projects.",
                },
              ].map(({ icon: Icon, step, title, body }, idx, arr) => (
                <li key={step} className="flex gap-6">
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
            SECTION 6 — COST OF COMPLIANCE
        ══════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="compliance-cost"
          className="py-20 px-4"
          style={{ backgroundColor: "#F8F6FC" }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <SectionLabel>Cost Reference</SectionLabel>
              <SectionHeading id="compliance-cost">Cost of CSA Compliance</SectionHeading>
              <p className="mt-3 text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">
                Reference ranges for 2026. Actual costs depend on project scope, component types,
                and the compliance pathway chosen.{" "}
                <Link
                  href="/services/construction-solutions#cost-guide"
                  className="font-bold underline"
                  style={{ color: PURPLE }}
                >
                  See how compliance costs affect total prefab construction cost →
                </Link>
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {[
                {
                  label: "Engineering Review (per project)",
                  range: "$3,000 – $15,000",
                  note: "Canadian engineer of record review, stamping, and Letters of Assurance",
                  color: "#EDE9F6",
                },
                {
                  label: "Electrical Component Testing",
                  range: "$1,500 – $8,000",
                  note: "Per product family; existing CSA marks eliminate this cost",
                  color: "#FDF8EC",
                },
                {
                  label: "Structural Testing / Review",
                  range: "$5,000 – $25,000",
                  note: "Depends on complexity; equivalency documentation may reduce cost",
                  color: "#EDE9F6",
                },
                {
                  label: "CSA A277 Factory Certification",
                  range: "$15,000 – $50,000",
                  note: "One-time factory cost; amortized across all future projects",
                  color: "#FDF8EC",
                },
                {
                  label: "Documentation & Translation",
                  range: "$1,000 – $5,000",
                  note: "Technical translation, document preparation, and package assembly",
                  color: "#EDE9F6",
                },
                {
                  label: "Total Compliance (% of project)",
                  range: "3% – 8%",
                  note: "Typical range as a percentage of total project cost",
                  color: "#FDF8EC",
                },
              ].map(({ label, range, note, color }) => (
                <div
                  key={label}
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: color, border: `1.5px solid ${GOLD}33` }}
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{label}</p>
                  <p className="text-2xl font-extrabold mb-1" style={{ color: PURPLE }}>{range}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{note}</p>
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl p-6 flex gap-4"
              style={{ backgroundColor: "#EDE9F6", border: `1.5px solid ${PURPLE}30` }}
            >
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: PURPLE }} />
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-gray-900">Key insight:</strong> Compliance costs of 3–8%
                are almost always offset by the 20–40% savings from Chinese manufacturing. The net
                result is still a significant cost reduction compared to sourcing locally in Canada.
                The risk is not the cost of compliance — it is the cost of non-compliance discovered
                late in the project.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 7 — FAQ
        ══════════════════════════════════════════════════════════════════ */}
        <CSAFAQSection />

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 8 — ESTIMATE FORM
        ══════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="estimate-form-heading"
          className="py-20 px-4 bg-white"
        >
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <SectionLabel>Free Estimate</SectionLabel>
              <SectionHeading id="estimate-form-heading">
                Get a Project Cost Estimate
              </SectionHeading>
              <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
                Tell us about your project and we&apos;ll provide a cost estimate that includes
                both manufacturing and compliance costs.
              </p>
            </div>
            <ProjectEstimateForm context="csa" />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 9 — CTA / LINK BACK
        ══════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="cta-csa"
          className="py-24 px-4 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #2d0f5e 100%)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
          <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: GOLD }} />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: "#fff" }} />

          <div className="relative max-w-3xl mx-auto text-center">
            <h2
              id="cta-csa"
              className="text-3xl md:text-4xl font-extrabold text-white mb-5 leading-tight"
            >
              Ready to Start Your Compliant Prefab Project?
            </h2>
            <p className="text-lg text-purple-200 mb-6 leading-relaxed">
              CSA compliance is manageable when it&apos;s planned from the start. Apex Modular Construction
              coordinates the full process — from factory verification to permit-ready documentation.
            </p>
            <p className="text-sm text-purple-300 mb-10">
              Also see:{" "}
              <Link
                href="/services/construction-solutions"
                className="font-bold underline hover:opacity-80"
                style={{ color: GOLD }}
              >
                Full Prefab Construction Cost Guide →
              </Link>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact?subject=CSA Compliance Consultation"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-4 text-base font-bold transition-all hover:opacity-90"
                style={{ backgroundColor: GOLD, color: "#1a1a2e" }}
              >
                Book a Compliance Consultation
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/services/construction-solutions"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-4 text-base font-bold transition-all hover:bg-white/10"
                style={{ border: "2px solid rgba(255,255,255,0.5)", color: "#fff" }}
              >
                View Construction Solutions
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
