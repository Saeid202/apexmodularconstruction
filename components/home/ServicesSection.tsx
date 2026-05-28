"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { PackageSearch, HardHat, Globe, ArrowUpRight } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const services = [
  {
    icon: PackageSearch,
    title: "Design and Manufacturing Container Houses",
    description:
      "Transform shipping containers into modern, sustainable living spaces. We design and manufacture custom container homes, offices, and commercial buildings — cost-effective, durable, and ready for rapid deployment.",
    steps: [
      "Register and log in to your account",
      "Submit your container house requirements and design preferences",
      "Our team creates custom designs and manufactures your container structure",
    ],
    cta: "Start Your Project",
    href: "/auth/register?redirect=/account/engineering",
  },
  {
    icon: HardHat,
    title: "Light Steel Structure Engineering",
    description:
      "Partner with our certified engineering team based in China to bring your construction project to life. Submit your specifications and receive a detailed, competitive quotation for prefabricated light steel structure buildings.",
    steps: [
      "Register and log in to your account",
      "Navigate to the Engineering section in your dashboard",
      "Upload your project details and receive a factory-direct quotation",
    ],
    cta: "Request a Quotation",
    href: "/auth/register?redirect=/account/engineering",
  },
  {
    icon: Globe,
    title: "Building Permit and Installation",
    description:
      "Navigate the complex world of construction permits and installation with ease. We handle all regulatory approvals, permit applications, and professional installation services — ensuring your project meets all local building codes.",
    steps: [
      "Register and log in to your account",
      "Submit your project details and location",
      "Our team handles permits and coordinates professional installation",
    ],
    cta: "Get Started",
    href: "/auth/register?redirect=/contact",
  },
];

export function ServicesSection() {
  return (
    <section className="relative py-24 bg-[#F5F4F7]">
      <div className="container mx-auto px-6">

        {/* Header row */}
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] font-bold mb-3" style={{ color: '#D4AF37' }}>
              What We Offer
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1a1a2e] max-w-2xl leading-tight">
              Our <span style={{ color: '#4B1D8F' }}>Services</span>
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-0.5 w-6 shrink-0 rounded-full" style={{ background: '#D4AF37' }} />
              <p className="text-base text-gray-500">
                From procurement to engineering, we connect Canadian businesses with trusted partners in China.
              </p>
            </div>
          </div>
          <Link
            href="/services"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all duration-200"
            style={{ color: '#4B1D8F' }}
          >
            All services <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                className="group flex flex-col rounded-3xl bg-card border border-border shadow-soft hover:shadow-elegant hover:border-[#D4AF37]/30 transition-all duration-500 overflow-hidden"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
              >
                {/* Icon banner */}
                <div className="bg-gradient-primary px-7 pt-8 pb-6 relative overflow-hidden">
                  {/* Decorative gold circle */}
                  <div className="absolute -top-6 -right-6 h-28 w-28 rounded-full opacity-10" style={{ background: '#D4AF37' }} />
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white leading-snug">
                    {service.title}
                  </h3>
                  {/* Gold accent line */}
                  <div className="mt-4 h-0.5 w-10 rounded-full" style={{ background: '#D4AF37' }} />
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-7">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* How it works */}
                  <div className="mb-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#D4AF37' }}>
                      How it works
                    </p>
                    <ol className="space-y-3">
                      {service.steps.map((step, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-foreground/80">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold border" style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', borderColor: 'rgba(212,175,55,0.35)' }}>
                            {j + 1}
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
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {service.cta}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
