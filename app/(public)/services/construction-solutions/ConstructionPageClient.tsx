"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight, MessageCircle, ChevronDown, ChevronUp,
  X, Send, CheckCircle, AlertCircle,
} from "lucide-react";
import { submitProjectEstimate } from "@/app/actions/inquiries";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";
const WHATSAPP_NUMBER = "16047128018"; // update to real number if different
const WHATSAPP_MSG = encodeURIComponent(
  "Hi Apex Modular Construction! I have a construction project in Canada and would like a free consultation."
);

/* ─── Sticky bottom bar ──────────────────────────────────────────────────── */
export function StickyConsultBar() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4 py-3 shadow-2xl"
      style={{ backgroundColor: PURPLE, borderTop: `3px solid ${GOLD}` }}
      role="complementary"
      aria-label="Quick consultation bar"
    >
      <p className="text-sm font-semibold text-white hidden sm:block">
        Have a project in mind?{" "}
        <span style={{ color: GOLD }}>Get a free 15-min consultation →</span>
      </p>
      <p className="text-sm font-semibold text-white sm:hidden" style={{ color: GOLD }}>
        Free 15-min consultation
      </p>

      <div className="flex items-center gap-2 shrink-0">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#25D366", color: "#fff" }}
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </a>

        {/* Form */}
        <Link
          href="/contact?subject=Free Construction Consultation"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-opacity hover:opacity-90"
          style={{ backgroundColor: GOLD, color: "#1a1a2e" }}
        >
          <Send className="h-3.5 w-3.5" />
          Send a Message
        </Link>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="ml-1 rounded-full p-1 text-white/60 hover:text-white transition-colors"
          aria-label="Dismiss bar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Inline micro-CTA ───────────────────────────────────────────────────── */
export function MicroCTA({
  text,
  href,
  whatsapp = false,
}: {
  text: string;
  href?: string;
  whatsapp?: boolean;
}) {
  if (whatsapp) {
    return (
      <div className="mt-8 flex justify-center">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all hover:opacity-90"
          style={{ backgroundColor: "#25D366", color: "#fff" }}
        >
          <MessageCircle className="h-4 w-4" />
          {text}
        </a>
      </div>
    );
  }

  return (
    <div className="mt-8 flex justify-center">
      <Link
        href={href ?? "/contact?subject=Construction Inquiry"}
        className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-bold transition-all hover:opacity-80"
        style={{ borderColor: PURPLE, color: PURPLE }}
      >
        {text}
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/* ─── Project assessment form ────────────────────────────────────────────── */
export function ProjectAssessmentForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", projectType: "", email: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Redirect to contact page with pre-filled subject; real form submission
    // can be wired to the existing contact action later.
    const params = new URLSearchParams({
      subject: "Free Project Assessment",
      name: form.name,
      projectType: form.projectType,
      email: form.email,
    });
    // Small delay for UX, then show success
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ border: `2px solid ${GOLD}`, background: `${GOLD}10` }}
      >
        <CheckCircle className="h-10 w-10 mx-auto mb-3" style={{ color: GOLD }} />
        <p className="text-lg font-extrabold text-gray-900 mb-1">We&apos;ll be in touch soon!</p>
        <p className="text-sm text-gray-600">
          Our team typically responds within one business day. You can also{" "}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline"
            style={{ color: "#25D366" }}
          >
            message us on WhatsApp
          </a>{" "}
          for a faster reply.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-8"
      style={{ border: `2px solid ${GOLD}55`, background: "#fff" }}
      aria-label="Free project assessment form"
    >
      <h3 className="text-xl font-extrabold text-gray-900 mb-1">
        Get a Free Project Assessment
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        No phone call required. We&apos;ll review your project and follow up by email.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="pa-name" className="block text-sm font-semibold text-gray-700 mb-1">
            Your Name
          </label>
          <input
            id="pa-name"
            type="text"
            required
            placeholder="e.g. Alex Chen"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={{ focusRingColor: PURPLE } as React.CSSProperties}
          />
        </div>

        <div>
          <label htmlFor="pa-type" className="block text-sm font-semibold text-gray-700 mb-1">
            Project Type
          </label>
          <select
            id="pa-type"
            required
            value={form.projectType}
            onChange={(e) => setForm((f) => ({ ...f, projectType: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 bg-white"
          >
            <option value="">Select a project type…</option>
            <option>Prefab / Modular Building</option>
            <option>Industrial Facility</option>
            <option>Warehouse / Logistics Center</option>
            <option>Residential Development</option>
            <option>Government / Infrastructure</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="pa-email" className="block text-sm font-semibold text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="pa-email"
            type="email"
            required
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold transition-all hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: PURPLE, color: "#fff", border: `2px solid ${GOLD}` }}
      >
        {loading ? "Sending…" : "Submit for Free Assessment"}
        {!loading && <ChevronRight className="h-4 w-4" />}
      </button>

      <p className="mt-3 text-center text-xs text-gray-400">
        Or message us directly on{" "}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold"
          style={{ color: "#25D366" }}
        >
          WhatsApp
        </a>
      </p>
    </form>
  );
}

/* ─── FAQ accordion ──────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "Will the materials pass Canadian building code?",
    a: "Yes — we work with your local engineer of record to ensure all imported components meet the applicable National Building Code of Canada (NBC) and provincial requirements. We provide full technical documentation, material certifications, and CSA-aligned specs to support the approval process.",
  },
  {
    q: "What happens if there's a defect or quality issue?",
    a: "We conduct quality inspections at the factory before shipment. If a defect is discovered after delivery, we coordinate directly with the manufacturer to arrange replacement or repair. Our contracts include clear defect liability clauses so you're protected.",
  },
  {
    q: "How long does shipping from China to Canada take?",
    a: "Ocean freight from major Chinese ports to Vancouver or other Canadian ports typically takes 18–28 days. We also handle customs clearance and inland delivery, so your materials arrive at the project site ready to use. We provide real-time tracking throughout.",
  },
  {
    q: "Do I need to speak Mandarin or deal with Chinese factories directly?",
    a: "Not at all. Apex Modular Construction acts as your single point of contact. We handle all factory communication, negotiations, quality control, and documentation in both languages. You deal only with us, in English.",
  },
  {
    q: "How much can I actually save compared to buying locally in Canada?",
    a: "Savings vary by project type, but clients typically see 20–40% cost reductions on structural steel, modular components, and prefab systems compared to Canadian market prices. We provide a detailed cost comparison as part of your free project assessment.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section aria-labelledby="faq-heading" className="py-20 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>
            Common Questions
          </p>
          <h2
            id="faq-heading"
            className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight"
          >
            Questions Canadian Buyers Ask
          </h2>
          <p className="mt-3 text-gray-500 text-sm max-w-xl mx-auto">
            We know the concerns. Here are straight answers.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="rounded-2xl overflow-hidden transition-shadow"
                style={{
                  border: `1.5px solid ${isOpen ? GOLD : `${PURPLE}18`}`,
                  boxShadow: isOpen ? `0 4px 16px rgba(75,29,143,0.12)` : undefined,
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-bold text-gray-900">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0" style={{ color: PURPLE }} />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Micro-CTA after FAQ */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 mb-4">Still have questions? We&apos;re easy to reach.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all hover:opacity-90"
              style={{ backgroundColor: "#25D366", color: "#fff" }}
            >
              <MessageCircle className="h-4 w-4" />
              Message us on WhatsApp
            </a>
            <Link
              href="/contact?subject=Construction Question"
              className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-bold transition-all hover:opacity-80"
              style={{ borderColor: PURPLE, color: PURPLE }}
            >
              Send an Email
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Prefab & EPC Canada FAQ ────────────────────────────────────────────── */
const PREFAB_EPC_FAQS = [
  {
    q: "How much does prefab construction cost in Canada?",
    a: "Prefab construction in Canada typically ranges from $120 to $400+ per square foot, depending on design complexity, materials, and compliance requirements. Projects that integrate overseas manufacturing can reduce overall costs when properly managed.",
  },
  {
    q: "Is importing prefabricated buildings from China cost-effective?",
    a: "Yes. Importing prefab structures from China can reduce total project costs by 20% to 40%, primarily due to lower manufacturing costs and scalable production. However, savings depend on logistics planning, compliance adjustments, and project coordination.",
  },
  {
    q: "Can prefab buildings manufactured in China meet Canadian building codes?",
    a: "Yes, but they must be adapted and engineered to comply with Canadian building codes and provincial regulations. This often involves structural modifications, documentation, and coordination with local engineers.",
  },
  {
    q: "Is CSA certification required for prefab or modular buildings in Canada?",
    a: "In many cases, CSA certification or equivalent compliance validation is required, particularly for electrical systems and certain building components. Requirements vary based on project type and jurisdiction.",
  },
  {
    q: "What is included in an EPC construction model?",
    a: "EPC (Engineering, Procurement, and Construction) includes project design, material sourcing, manufacturing, logistics, and on-site execution. It provides a fully integrated delivery approach with a single coordination structure.",
  },
  {
    q: "How long does it take to complete a prefab construction project from China to Canada?",
    a: "Typical timelines range from 8 to 20 weeks, depending on project scale. This includes design finalization, manufacturing, shipping, customs clearance, and installation preparation.",
  },
  {
    q: "What are the main risks when importing prefab construction systems?",
    a: "Key risks include non-compliance with Canadian standards, incorrect specifications, shipping delays, and incomplete documentation. These risks can be mitigated through proper engineering coordination and supplier verification.",
  },
  {
    q: "What factors affect the total cost of prefab construction projects?",
    a: "Major cost factors include project size, design complexity, materials, shipping distance, compliance requirements, and local installation costs. Early-stage planning significantly impacts overall cost efficiency.",
  },
  {
    q: "Is steel structure construction more cost-effective than traditional methods?",
    a: "For many industrial and commercial projects, steel structures are more cost-efficient and faster to deploy, especially when combined with prefabrication and modular construction methods.",
  },
  {
    q: "Who handles installation and construction in Canada?",
    a: "Installation is typically carried out by local Canadian contractors, supported by engineering documentation and coordination from the project team to ensure compliance and accuracy.",
  },
  {
    q: "What documentation is required to import prefab buildings into Canada?",
    a: "Projects typically require engineering drawings, compliance documentation, shipping and customs paperwork, and certification records. Missing or incorrect documents can delay approvals.",
  },
  {
    q: "Can one company manage the entire China-to-Canada construction process?",
    a: "Yes. A coordinated provider can manage factory sourcing, engineering alignment, logistics, compliance, and construction support, ensuring a streamlined and accountable delivery process.",
  },
  {
    q: "What types of projects are best suited for prefab construction?",
    a: "Prefab solutions are ideal for warehouses, industrial facilities, modular housing, commercial buildings, and large-scale developments where speed and cost efficiency are priorities.",
  },
  {
    q: "How does logistics impact prefab construction projects?",
    a: "Logistics plays a critical role in cost, timeline, and risk management. Efficient shipping, customs handling, and delivery coordination are essential to avoid delays and unexpected costs.",
  },
  {
    q: "How can I estimate the cost of my specific construction project?",
    a: "Accurate cost estimation requires project-specific details, including size, location, design requirements, and compliance scope. A tailored evaluation is recommended for reliable budgeting.",
  },
];

export function PrefabEPCFAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      aria-labelledby="prefab-epc-faq-heading"
      className="py-20 px-4"
      style={{ backgroundColor: "#F8F6FC", fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: GOLD }}
          >
            Frequently Asked Questions
          </p>
          <h2
            id="prefab-epc-faq-heading"
            className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight"
          >
            Prefab &amp; EPC – Canada
          </h2>
          <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
            Common questions about prefab construction costs, importing from China, compliance,
            and project delivery in Canada.
          </p>
        </div>

        {/* Accordion items */}
        <div className="space-y-4">
          {PREFAB_EPC_FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  border: `1.5px solid ${isOpen ? GOLD : `${PURPLE}20`}`,
                  boxShadow: isOpen
                    ? `0 4px 20px rgba(75,29,143,0.10)`
                    : `0 1px 4px rgba(75,29,143,0.05)`,
                  backgroundColor: "#fff",
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                  aria-controls={`prefab-faq-answer-${i}`}
                >
                  <span
                    className="font-semibold text-gray-900 leading-snug"
                    style={{ fontSize: "18px" }}
                  >
                    {faq.q}
                  </span>
                  <span
                    className="shrink-0 flex items-center justify-center h-7 w-7 rounded-full transition-colors"
                    style={{
                      backgroundColor: isOpen ? GOLD : `${PURPLE}12`,
                    }}
                    aria-hidden="true"
                  >
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-white" />
                    ) : (
                      <ChevronDown className="h-4 w-4" style={{ color: PURPLE }} />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={`prefab-faq-answer-${i}`}
                    className="px-6 pb-6"
                  >
                    <p
                      className="text-gray-700 leading-relaxed"
                      style={{ fontSize: "16px", lineHeight: "1.7" }}
                    >
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-5">
            Have a specific project in mind? We&apos;ll give you a tailored estimate.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all hover:opacity-90"
              style={{ backgroundColor: "#25D366", color: "#fff" }}
            >
              <MessageCircle className="h-4 w-4" />
              Ask on WhatsApp
            </a>
            <Link
              href="/contact?subject=Prefab Construction Inquiry"
              className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-bold transition-all hover:opacity-80"
              style={{ borderColor: PURPLE, color: PURPLE }}
            >
              Request a Free Estimate
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
/* ─── Trust / social proof strip ────────────────────────────────────────── */
export function TrustStrip() {
  return (
    <section
      aria-label="Social proof"
      className="py-14 px-4"
      style={{ backgroundColor: "#F8F6FC" }}
    >
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] mb-8" style={{ color: GOLD }}>
          Trusted by Canadian Developers &amp; Contractors
        </p>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              quote:
                "Apex Modular Construction handled everything — factory sourcing, shipping, customs. Our prefab warehouse arrived on time and passed inspection first try.",
              author: "Project Manager, BC Industrial Developer",
            },
            {
              quote:
                "We saved over 30% on structural steel compared to local quotes. The CSA documentation they provided made the permit process smooth.",
              author: "General Contractor, Alberta",
            },
            {
              quote:
                "Communication was seamless. I never had to deal with the Chinese factory directly — Apex Modular Construction was always the single point of contact.",
              author: "Developer, Ontario Modular Housing Project",
            },
          ].map(({ quote, author }) => (
            <figure
              key={author}
              className="rounded-2xl bg-white p-6"
              style={{ border: `1.5px solid ${PURPLE}18`, boxShadow: `0 2px 8px rgba(75,29,143,0.08)` }}
            >
              <blockquote className="text-sm text-gray-600 leading-relaxed mb-4">
                &ldquo;{quote}&rdquo;
              </blockquote>
              <figcaption className="text-xs font-bold text-gray-400">— {author}</figcaption>
            </figure>
          ))}
        </div>

        <p
          className="mt-8 text-center text-sm font-semibold"
          style={{ color: PURPLE }}
        >
          Serving Canadian developers, contractors, and project managers since 2018.
        </p>
      </div>
    </section>
  );
}

/* ─── Project Estimate Form ──────────────────────────────────────────────── */
type EstimateFormState = {
  name: string;
  email: string;
  projectType: string;
  projectSize: string;
  location: string;
  budget: string;
  notes: string;
};

export function ProjectEstimateForm() {
  const [form, setForm] = useState<EstimateFormState>({
    name: "",
    email: "",
    projectType: "",
    projectSize: "",
    location: "",
    budget: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof EstimateFormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await submitProjectEstimate({
      name: form.name,
      email: form.email,
      projectType: form.projectType,
      projectSize: form.projectSize,
      location: form.location,
      budget: form.budget,
      notes: form.notes || undefined,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ border: `2px solid ${GOLD}`, background: `${GOLD}10` }}
      >
        <CheckCircle className="h-10 w-10 mx-auto mb-3" style={{ color: GOLD }} />
        <p className="text-lg font-extrabold text-gray-900 mb-1">Estimate request received!</p>
        <p className="text-sm text-gray-600 max-w-sm mx-auto">
          Our team typically responds within one business day. You can also{" "}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Apex Modular Construction! I submitted a project estimate request and would like to follow up.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline"
            style={{ color: "#25D366" }}
          >
            message us on WhatsApp
          </a>{" "}
          for a faster reply.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-8"
      style={{ border: `2px solid ${GOLD}55`, background: "#fff" }}
      aria-label="Free project cost estimate form"
    >
      <h3 className="text-xl font-extrabold text-gray-900 mb-1">
        Get a Free Project Cost Estimate
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        No phone call required. We&apos;ll review your project and follow up by email.
      </p>

      {error && (
        <div
          className="mb-5 flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: "#FEF2F2", border: "1.5px solid #FECACA", color: "#B91C1C" }}
          role="alert"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ce-name" className={labelClass}>
            Your Name <span aria-hidden="true" style={{ color: GOLD }}>*</span>
          </label>
          <input
            id="ce-name"
            type="text"
            required
            placeholder="e.g. Alex Chen"
            value={form.name}
            onChange={update("name")}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="ce-email" className={labelClass}>
            Email Address <span aria-hidden="true" style={{ color: GOLD }}>*</span>
          </label>
          <input
            id="ce-email"
            type="email"
            required
            placeholder="you@company.com"
            value={form.email}
            onChange={update("email")}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="ce-type" className={labelClass}>
            Project Type <span aria-hidden="true" style={{ color: GOLD }}>*</span>
          </label>
          <select
            id="ce-type"
            required
            value={form.projectType}
            onChange={update("projectType")}
            className={inputClass}
          >
            <option value="">Select a type…</option>
            <option>Prefab / Modular Building</option>
            <option>Industrial Facility</option>
            <option>Warehouse / Logistics Center</option>
            <option>Residential Development</option>
            <option>Government / Infrastructure</option>
            <option>Steel Structure</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="ce-size" className={labelClass}>
            Approximate Size <span aria-hidden="true" style={{ color: GOLD }}>*</span>
          </label>
          <select
            id="ce-size"
            required
            value={form.projectSize}
            onChange={update("projectSize")}
            className={inputClass}
          >
            <option value="">Select a size…</option>
            <option>Under 500 sq ft</option>
            <option>500 – 2,000 sq ft</option>
            <option>2,000 – 10,000 sq ft</option>
            <option>10,000 – 50,000 sq ft</option>
            <option>50,000+ sq ft</option>
            <option>Not sure yet</option>
          </select>
        </div>

        <div>
          <label htmlFor="ce-location" className={labelClass}>
            Project Location <span aria-hidden="true" style={{ color: GOLD }}>*</span>
          </label>
          <input
            id="ce-location"
            type="text"
            required
            placeholder="e.g. Vancouver, BC"
            value={form.location}
            onChange={update("location")}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="ce-budget" className={labelClass}>
            Budget Range <span aria-hidden="true" style={{ color: GOLD }}>*</span>
          </label>
          <select
            id="ce-budget"
            required
            value={form.budget}
            onChange={update("budget")}
            className={inputClass}
          >
            <option value="">Select a range…</option>
            <option>Under $100,000</option>
            <option>$100,000 – $500,000</option>
            <option>$500,000 – $2,000,000</option>
            <option>$2,000,000 – $10,000,000</option>
            <option>$10,000,000+</option>
            <option>Not sure yet</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="ce-notes" className={labelClass}>
          Additional Notes <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="ce-notes"
          rows={3}
          placeholder="Any specific requirements, timeline, or questions…"
          value={form.notes}
          onChange={update("notes")}
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold transition-all hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: PURPLE, color: "#fff", border: `2px solid ${GOLD}` }}
      >
        {loading ? "Submitting…" : "Get My Free Estimate"}
        {!loading && <ChevronRight className="h-4 w-4" />}
      </button>

      <p className="mt-3 text-center text-xs text-gray-400">
        Or reach us on{" "}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold"
          style={{ color: "#25D366" }}
        >
          WhatsApp
        </a>
      </p>
    </form>
  );
}

/* ─── Light Steel Structure FAQ ─────────────────────────────────────────── */
const LIGHT_STEEL_FAQS = [
  {
    q: "1. Are light steel structures suitable for the Canadian climate?",
    a: "Yes. Light steel structures can be engineered for Canadian weather conditions including snow load, wind resistance, and insulation requirements. Many modern steel structure systems are designed specifically for cold climates and can be customized based on provincial building requirements.",
  },
  {
    q: "2. Is it cheaper to import a light steel structure from China to Canada?",
    a: "In many cases, importing from China can significantly reduce manufacturing costs compared to traditional local construction methods. The final cost depends on project size, customization, insulation specifications, shipping, installation requirements, and local permits and foundation work. Cargo Plus helps clients coordinate sourcing, shipping, and logistics to optimize overall project costs.",
  },
  {
    q: "3. How long does it take to import a prefab steel structure to Canada?",
    a: "Typical timelines range between 30–60 days depending on manufacturing schedule, customization level, shipping route, destination in Canada, and customs processing. Larger or more customized projects may require additional production time.",
  },
  {
    q: "4. Can light steel structures be used for ADUs and garden suites in Ontario?",
    a: "Yes. Light steel structure systems are commonly used for ADUs, garden suites, laneway homes, backyard offices, and modular residential units. However, every municipality has different zoning and permit requirements. Cargo Plus helps clients better understand the import and planning process before moving forward.",
  },
  {
    q: "5. Do imported steel structures require permits in Canada?",
    a: "Yes. Most permanent structures in Canada require permits and must comply with local building regulations. Requirements may include engineering approvals, foundation plans, zoning compliance, snow load calculations, and insulation standards. Permit requirements vary depending on municipality and intended use.",
  },
  {
    q: "6. Are light steel structures durable compared to wood framing?",
    a: "Light steel framing offers several advantages including resistance to pests and termites, reduced warping and shrinking, improved dimensional consistency, and long-term structural durability. Steel structures are widely used in modern modular and prefabricated construction projects around the world.",
  },
  {
    q: "7. Can Cargo Plus handle the entire process from China to Canada?",
    a: "Yes. Cargo Plus provides end-to-end coordination including factory sourcing, supplier communication, shipping logistics, import assistance, delivery coordination, and project support. Our goal is to simplify the process for Canadian clients importing prefabricated steel structure systems.",
  },
  {
    q: "8. Can prefab steel structures be customized?",
    a: "Yes. Most projects can be customized based on floor plan, dimensions, exterior finishes, insulation specifications, windows and doors, interior layout, and commercial or residential use. Customization options vary depending on the manufacturer and project scope.",
  },
  {
    q: "9. What types of light steel structure projects are most popular in Canada?",
    a: "Some of the most requested projects include ADUs, garden suites, tiny homes, modular offices, steel frame warehouses, workforce housing, and commercial modular units. Demand continues to grow as Canadians look for faster and more cost-efficient construction solutions.",
  },
  {
    q: "10. Why are more developers and builders using light steel structure systems?",
    a: "Light steel structure systems are becoming more popular because they offer faster construction timelines, factory precision manufacturing, reduced material waste, scalable modular solutions, efficient transportation, and modern architectural flexibility.",
  },
];

export function LightSteelStructureFAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      aria-labelledby="light-steel-faq-heading"
      className="py-20 px-4"
      style={{ backgroundColor: "#fff", fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: GOLD }}
          >
            In-Depth Guide
          </p>
          <h2
            id="light-steel-faq-heading"
            className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight"
          >
            Frequently Asked Questions About Light Steel Structures
          </h2>
          <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
            Everything you need to know about designing, importing, and building with light steel in Canada.
          </p>
        </div>

        {/* Accordion items */}
        <div className="space-y-4">
          {LIGHT_STEEL_FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  border: `1.5px solid ${isOpen ? GOLD : `${PURPLE}20`}`,
                  boxShadow: isOpen
                    ? `0 4px 20px rgba(75,29,143,0.10)`
                    : `0 1px 4px rgba(75,29,143,0.05)`,
                  backgroundColor: isOpen ? "#FAF9FF" : "#fff",
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className="font-bold text-gray-900 leading-snug"
                    style={{ fontSize: "17px" }}
                  >
                    {faq.q}
                  </span>
                  <span
                    className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full transition-colors"
                    style={{
                      backgroundColor: isOpen ? GOLD : `${PURPLE}08`,
                    }}
                  >
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-white" />
                    ) : (
                      <ChevronDown className="h-4 w-4" style={{ color: PURPLE }} />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p
                      className="text-gray-700 leading-relaxed"
                      style={{ fontSize: "16px", lineHeight: "1.7" }}
                    >
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
