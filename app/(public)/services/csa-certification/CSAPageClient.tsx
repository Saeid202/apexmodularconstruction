"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, ChevronUp, MessageCircle, CheckCircle, AlertCircle } from "lucide-react";
import { submitProjectEstimate } from "@/app/actions/inquiries";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";
const WHATSAPP_NUMBER = "16047128018";
const WHATSAPP_MSG = encodeURIComponent(
  "Hi Apex Modular Construction! I have a question about CSA certification for my prefab construction project in Canada."
);

/* ─── CSA FAQ data ───────────────────────────────────────────────────────── */
const CSA_FAQS = [
  {
    q: "What does CSA stand for and what does it cover?",
    a: "CSA stands for Canadian Standards Association. It develops standards and certification programs covering electrical systems, structural components, building materials, and safety equipment used in Canadian construction. CSA certification confirms that a product or system meets Canadian safety and performance requirements.",
  },
  {
    q: "Is CSA certification mandatory for all prefab buildings imported from China?",
    a: "Not universally — requirements depend on the component type, project jurisdiction, and intended use. Electrical systems and certain mechanical components almost always require CSA or equivalent certification. Structural steel and modular frames may require engineering review and compliance documentation rather than direct CSA marking.",
  },
  {
    q: "What is the National Building Code of Canada (NBC) and how does it relate to CSA?",
    a: "The NBC sets minimum requirements for building design, construction, and occupancy across Canada. CSA standards are frequently referenced within the NBC as the accepted method of demonstrating compliance. Meeting CSA standards is often the most direct path to NBC compliance for imported components.",
  },
  {
    q: "Can Chinese manufacturers obtain CSA certification for their products?",
    a: "Yes. Chinese manufacturers can apply for CSA certification through CSA Group's international testing and certification programs. Many large Chinese factories that export to North America already hold CSA, UL, or equivalent certifications for their product lines.",
  },
  {
    q: "What is the difference between CSA certification and a CSA-equivalent standard?",
    a: "CSA certification means a product has been tested and marked by CSA Group. A CSA-equivalent standard means the product meets the technical requirements of a CSA standard, verified through an accredited third-party lab. Both are generally accepted by Canadian authorities, though some jurisdictions require the CSA mark specifically.",
  },
  {
    q: "How long does the CSA certification process take?",
    a: "Timelines vary by product complexity. Simple components may be certified in 4–8 weeks. Complex systems or custom-engineered structures can take 3–6 months. Planning for certification early in the project timeline is critical to avoid delays.",
  },
  {
    q: "What are the most common CSA compliance failures for imported prefab buildings?",
    a: "The most common failures include: electrical systems not meeting CSA C22.1 (Canadian Electrical Code), structural connections not meeting CSA S16 (steel structures), missing or incorrect documentation, and components that meet Chinese GB standards but not their Canadian equivalents.",
  },
  {
    q: "Do provincial building codes differ from the National Building Code?",
    a: "Yes. Provinces like British Columbia, Ontario, Alberta, and Quebec adopt and amend the NBC with their own provincial requirements. A project in BC may face different compliance requirements than one in Ontario. Always verify provincial amendments before finalizing specifications.",
  },
  {
    q: "What documentation is required to demonstrate CSA compliance at the border?",
    a: "Typically required: CSA certification marks or test reports, engineering drawings stamped by a Canadian engineer, material certifications, and a compliance declaration. Customs does not enforce building code compliance, but municipal building departments will require this documentation before issuing permits.",
  },
  {
    q: "How much does CSA compliance add to the total project cost?",
    a: "Compliance costs typically range from 3% to 8% of total project cost, depending on scope. This includes testing fees, engineering review, documentation, and any required modifications. These costs are almost always offset by the savings from Chinese manufacturing.",
  },
  {
    q: "Can a Canadian engineer of record approve imported prefab components?",
    a: "Yes. A licensed Canadian engineer can review, stamp, and take responsibility for imported components, confirming they meet applicable codes. This is a common and accepted path for projects using overseas-manufactured structural systems.",
  },
  {
    q: "What is a Letters of Assurance and when is it required?",
    a: "A Letter of Assurance (LoA) is a document signed by a registered professional (engineer or architect) confirming that the design and construction comply with applicable codes. Most Canadian municipalities require LoAs as part of the building permit process.",
  },
  {
    q: "Are modular buildings treated differently from stick-built construction for CSA purposes?",
    a: "Yes. Modular buildings are often subject to CSA A277 (Procedure for Factory Certification of Buildings), which provides a factory inspection and certification pathway. This can actually streamline compliance compared to site-built construction when the factory is CSA A277 certified.",
  },
  {
    q: "What happens if non-compliant materials are discovered after installation?",
    a: "Non-compliant materials can result in failed inspections, stop-work orders, required demolition and replacement, and significant cost overruns. This is why pre-shipment compliance verification is essential — it is far cheaper to address issues before materials leave the factory.",
  },
  {
    q: "How does Apex Modular Construction help with CSA compliance for imported construction projects?",
    a: "Apex Modular Construction coordinates the full compliance process: verifying factory certifications, arranging third-party testing where needed, preparing documentation packages, and working with your Canadian engineer of record. We act as the single point of contact between the Chinese manufacturer and Canadian compliance requirements.",
  },
];

/* ─── CSA FAQ accordion ──────────────────────────────────────────────────── */
export function CSAFAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      aria-labelledby="csa-faq-heading"
      className="py-20 px-4"
      style={{ backgroundColor: "#F8F6FC", fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>
            Frequently Asked Questions
          </p>
          <h2
            id="csa-faq-heading"
            className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight"
          >
            CSA Certification — Canada
          </h2>
          <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
            Common questions about CSA standards, compliance requirements, and the certification
            process for prefab buildings imported from China.
          </p>
        </div>

        <div className="space-y-4">
          {CSA_FAQS.map((faq, i) => {
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
                  aria-controls={`csa-faq-answer-${i}`}
                >
                  <span
                    className="font-semibold text-gray-900 leading-snug"
                    style={{ fontSize: "18px" }}
                  >
                    {faq.q}
                  </span>
                  <span
                    className="shrink-0 flex items-center justify-center h-7 w-7 rounded-full transition-colors"
                    style={{ backgroundColor: isOpen ? GOLD : `${PURPLE}12` }}
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
                  <div id={`csa-faq-answer-${i}`} className="px-6 pb-6">
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

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-5">
            Have a specific compliance question? We&apos;ll give you a direct answer.
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
              href="/contact?subject=CSA Compliance Question"
              className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-bold transition-all hover:opacity-80"
              style={{ borderColor: PURPLE, color: PURPLE }}
            >
              Send a Question
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Project Estimate Form ──────────────────────────────────────────────── */
type FormState = {
  name: string;
  email: string;
  projectType: string;
  projectSize: string;
  location: string;
  budget: string;
  notes: string;
};

export function ProjectEstimateForm({ context = "general" }: { context?: "csa" | "general" }) {
  const [form, setForm] = useState<FormState>({
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

  function update(field: keyof FormState) {
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
          Our team reviews every request and typically responds within one business day. You can
          also{" "}
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
        {context === "csa"
          ? "Tell us about your project and we'll include a compliance cost breakdown."
          : "No phone call required. We'll review your project and follow up by email."}
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
        {/* Name */}
        <div>
          <label htmlFor="est-name" className={labelClass}>
            Your Name <span aria-hidden="true" style={{ color: GOLD }}>*</span>
          </label>
          <input
            id="est-name"
            type="text"
            required
            placeholder="e.g. Alex Chen"
            value={form.name}
            onChange={update("name")}
            className={inputClass}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="est-email" className={labelClass}>
            Email Address <span aria-hidden="true" style={{ color: GOLD }}>*</span>
          </label>
          <input
            id="est-email"
            type="email"
            required
            placeholder="you@company.com"
            value={form.email}
            onChange={update("email")}
            className={inputClass}
          />
        </div>

        {/* Project Type */}
        <div>
          <label htmlFor="est-type" className={labelClass}>
            Project Type <span aria-hidden="true" style={{ color: GOLD }}>*</span>
          </label>
          <select
            id="est-type"
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

        {/* Project Size */}
        <div>
          <label htmlFor="est-size" className={labelClass}>
            Approximate Size <span aria-hidden="true" style={{ color: GOLD }}>*</span>
          </label>
          <select
            id="est-size"
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

        {/* Location */}
        <div>
          <label htmlFor="est-location" className={labelClass}>
            Project Location <span aria-hidden="true" style={{ color: GOLD }}>*</span>
          </label>
          <input
            id="est-location"
            type="text"
            required
            placeholder="e.g. Vancouver, BC"
            value={form.location}
            onChange={update("location")}
            className={inputClass}
          />
        </div>

        {/* Budget */}
        <div>
          <label htmlFor="est-budget" className={labelClass}>
            Budget Range <span aria-hidden="true" style={{ color: GOLD }}>*</span>
          </label>
          <select
            id="est-budget"
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

      {/* Notes */}
      <div className="mt-4">
        <label htmlFor="est-notes" className={labelClass}>
          Additional Notes <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="est-notes"
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
        Or reach us directly on{" "}
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
