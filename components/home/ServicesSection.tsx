import Link from "next/link";
import { PackageSearch, HardHat, Globe } from "lucide-react";

const services = [
  {
    icon: PackageSearch,
    title: "Multi-Seller Consolidation",
    description:
      "Purchasing from multiple suppliers in China? We consolidate all your orders into a single shipment — reducing freight costs, simplifying customs clearance, and ensuring everything arrives together on time.",
    steps: [
      "Register and log in to your account",
      "Go to your dashboard and submit a consolidation request",
      "Our team coordinates with your suppliers and manages the shipment",
    ],
    cta: "Submit a Consolidation Request",
    href: "/auth/register?redirect=/account/consolidation",
    accent: "#4B1D8F",
  },
  {
    icon: HardHat,
    title: "Light Steel Structure Engineering",
    description:
      "Partner with our certified engineering team based in China to bring your construction project to life. Submit your specifications and receive a detailed, competitive quotation for prefabricated light steel structure buildings — residential, commercial, or industrial.",
    steps: [
      "Register and log in to your account",
      "Navigate to the Engineering section in your dashboard",
      "Upload your project details and receive a factory-direct quotation",
    ],
    cta: "Request a Quotation",
    href: "/auth/register?redirect=/account/engineering",
    accent: "#4B1D8F",
  },
  {
    icon: Globe,
    title: "Sourcing Services",
    description:
      "Can't find what you need in our catalog? Our sourcing team in China will identify qualified manufacturers, verify product quality, and negotiate competitive pricing on your behalf — so you get the right product at the right price.",
    steps: [
      "Register and log in to your account",
      "Submit your sourcing request with product details",
      "We find the supplier, you approve the deal",
    ],
    cta: "Start Sourcing",
    href: "/auth/register?redirect=/contact",
    accent: "#4B1D8F",
  },
];

export function ServicesSection() {
  return (
    <section style={{ backgroundColor: "#F5F4F7" }} className="py-10 md:py-14">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mb-12 flex justify-center">
          <div
            className="relative text-center px-10 py-7 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #4B1D8F 0%, #3a1570 100%)",
              boxShadow: "0 0 0 1px #4B1D8F, 0 0 0 4px #D4AF37, 0 0 0 5px #4B1D8F",
            }}
          >
            {/* Gold corner accents */}
            <span className="absolute top-2 left-2 h-4 w-4 border-t-2 border-l-2 border-yellow-400 rounded-tl-md" />
            <span className="absolute top-2 right-2 h-4 w-4 border-t-2 border-r-2 border-yellow-400 rounded-tr-md" />
            <span className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-yellow-400 rounded-bl-md" />
            <span className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-yellow-400 rounded-br-md" />

            <span className="inline-block mb-2 rounded-full border border-yellow-400/50 bg-yellow-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-yellow-300">
              What We Offer
            </span>
            <h2 className="text-3xl font-extrabold text-white md:text-4xl">
              Our Services
            </h2>
            <p className="mt-2 text-sm text-purple-200 max-w-md mx-auto">
              From procurement to engineering, we connect Canadian businesses with trusted partners in China.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="relative flex flex-col rounded-2xl bg-white overflow-hidden"
                style={{
                  boxShadow: "0 0 0 1px #4B1D8F, 0 0 0 4px #D4AF37, 0 0 0 5px #4B1D8F",
                }}
              >
                {/* Gold corner accents */}
                <span className="absolute top-2 left-2 h-4 w-4 border-t-2 border-l-2 border-yellow-400 rounded-tl-md" />
                <span className="absolute top-2 right-2 h-4 w-4 border-t-2 border-r-2 border-yellow-400 rounded-tr-md" />
                <span className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-yellow-400 rounded-bl-md" />
                <span className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-yellow-400 rounded-br-md" />

                <div className="flex flex-col flex-1 p-7">
                  {/* Icon + Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "#EDE9F6" }}>
                      <Icon className="h-5 w-5" style={{ color: "#4B1D8F" }} />
                    </div>
                    <h3 className="text-lg font-bold text-[#1a1a2e]">{service.title}</h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-5">
                    {service.description}
                  </p>

                  {/* How it works */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                      How it works
                    </p>
                    <ol className="space-y-2">
                      {service.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: "#4B1D8F" }}>
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto">
                    <Link
                      href={service.href}
                      className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
                      style={{ backgroundColor: "#4B1D8F" }}
                    >
                      {service.cta}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
