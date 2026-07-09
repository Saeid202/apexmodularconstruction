"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  ChevronRight,
  Truck,
  Globe,
  Settings,
  ArrowRight,
  HardHat,
  Factory
} from "lucide-react";
import { Section, SectionHeader, SectionEyebrow, SectionHeading } from "@/components/ui/Section";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ServicesHubPage() {
  return (
    <main>
      <PageHeader
        background="muted"
        eyebrow="Expertise & Infrastructure"
        title={
          <>
            Global Sourcing & <br />
            <span className="text-primary">Construction Solutions</span>
          </>
        }
        subtitle="Apex Modular Construction bridges the gap between high-scale Chinese manufacturing and the Canadian construction market. Explore our specialized services designed for developers, builders, and investors."
      />

      <Section background="white" padding="lg">
        <div className="grid md:grid-cols-2 gap-8">

          <Link
            href="/services/construction-solutions"
            className="group relative flex flex-col p-10 rounded-xl bg-background border border-border shadow-elevation-low transition-all hover:shadow-elevation-high hover:border-primary/20 hover:-translate-y-2 overflow-hidden"
          >
            <div className="w-16 h-16 rounded-2xl mb-8 flex items-center justify-center bg-primary/10 transition-transform group-hover:scale-110 duration-500">
              <Building2 className="w-8 h-8 text-primary" />
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-black text-foreground mb-4 tracking-tight">
                Construction Solutions & Prefab
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                End-to-end delivery of prefabricated buildings, light steel structures, and EPC industrial solutions.
                Save up to 65% on structural costs through direct factory sourcing.
              </p>

              <ul className="space-y-3 mb-10">
                {["Light Steel Structure Systems", "Prefabricated ADUs & Modular", "EPC Project Management", "Direct Factory Sourcing"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all group-hover:gap-4 text-primary">
              Explore Solutions
              <ArrowRight className="w-4 h-4" />
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            href="/services/csa-certification"
            className="group relative flex flex-col p-10 rounded-xl bg-background border border-border shadow-elevation-low transition-all hover:shadow-elevation-high hover:border-secondary-500/20 hover:-translate-y-2 overflow-hidden"
          >
            <div className="w-16 h-16 rounded-2xl mb-8 flex items-center justify-center bg-secondary-500/10 transition-transform group-hover:scale-110 duration-500">
              <ShieldCheck className="w-8 h-8 text-secondary-500" />
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-black text-foreground mb-4 tracking-tight">
                Compliance & Certification
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Navigate the complexities of Canadian building codes and CSA certification.
                We ensure your imported structures meet all provincial standards and approvals.
              </p>

              <ul className="space-y-3 mb-10">
                {["CSA A277 & Z240 Compliance", "Engineering Alignment", "Material Certification", "Permit & Zoning Guidance"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all group-hover:gap-4 text-secondary-500">
              View Certification Guide
              <ArrowRight className="w-4 h-4" />
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-secondary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        <div className="mt-8">
          <div className="p-12 rounded-xl bg-primary-900 text-white relative overflow-hidden">
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                  <Globe className="w-3 h-3 text-secondary-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary-500">Logistics & Supply Chain</span>
                </div>
                <h3 className="text-3xl font-black tracking-tight leading-tight">
                  Seamless Cross-Border <br /> Procurement
                </h3>
                <p className="text-white/60 text-lg">
                  We don't just find suppliers; we manage the entire movement of goods from
                  Chinese factory floors to Canadian construction sites.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                    <Truck className="w-4 h-4 text-secondary-500" />
                    <span className="text-xs font-bold">Ocean & Inland Freight</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                    <Settings className="w-4 h-4 text-secondary-500" />
                    <span className="text-xs font-bold">Quality Control (QC)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between">
                  <HardHat className="w-8 h-8 text-secondary-500" />
                  <p className="text-sm font-bold leading-snug tracking-tight">On-Site <br />Support</p>
                </div>
                <div className="aspect-square rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between">
                  <Factory className="w-8 h-8 text-secondary-500" />
                  <p className="text-sm font-bold leading-snug tracking-tight">Vetted <br />Factories</p>
                </div>
              </div>
            </div>

            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-secondary-500/10 to-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>
        </div>
      </Section>

      <Section background="white" padding="lg" className="border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: "Cost Reduction", value: "Up to 65%" },
            { label: "Delivery Network", value: "Coast-to-Coast" },
            { label: "Manufacturing Partners", value: "50+ Vetted" },
            { label: "Projects Completed", value: "Industrial Scale" }
          ].map((stat) => (
            <div key={stat.label} className="text-center md:text-left">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">{stat.label}</p>
              <p className={`text-3xl font-black tracking-tighter ${stat.value.includes("%") ? "text-primary" : "text-foreground"}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section background="muted" padding="lg" containerClassName="text-center">
        <div className="max-w-4xl mx-auto rounded-2xl p-12 md:p-24 bg-background border border-border relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter leading-tight mb-8">
              Ready to Optimize Your <br />Construction Supply Chain?
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-elevation-high"
              >
                Contact Our Team
              </Link>
              <Link
                href="/products"
                className="px-8 py-4 rounded-xl border-2 border-border text-foreground font-black uppercase tracking-widest text-xs hover:bg-foreground hover:text-background transition-all"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}