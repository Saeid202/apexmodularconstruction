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

// Design Tokens
const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

export default function ServicesHubPage() {
  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden bg-[#F8F6FC]">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] mb-4" style={{ color: GOLD }}>
            Expertise & Infrastructure
          </p>
          <h1 className="text-4xl md:text-6xl font-[1000] text-gray-900 tracking-tighter leading-tight mb-8">
            Global Sourcing & <br />
            <span style={{ color: PURPLE }}>Construction Solutions</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Apex Modular Construction bridges the gap between high-scale Chinese manufacturing and the Canadian construction market. 
            Explore our specialized services designed for developers, builders, and investors.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Service Card 1: Construction Solutions */}
            <Link 
              href="/services/construction-solutions"
              className="group relative flex flex-col p-10 rounded-[40px] bg-white border border-gray-100 shadow-sm transition-all hover:shadow-2xl hover:border-purple-100 hover:-translate-y-2 overflow-hidden"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl mb-8 flex items-center justify-center transition-transform group-hover:scale-110 duration-500" style={{ backgroundColor: `${PURPLE}10` }}>
                <Building2 className="w-8 h-8" style={{ color: PURPLE }} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                  Construction Solutions & Prefab
                </h2>
                <p className="text-gray-500 leading-relaxed mb-8">
                  End-to-end delivery of prefabricated buildings, light steel structures, and EPC industrial solutions. 
                  Save up to 65% on structural costs through direct factory sourcing.
                </p>
                
                <ul className="space-y-3 mb-10">
                  {["Light Steel Structure Systems", "Prefabricated ADUs & Modular", "EPC Project Management", "Direct Factory Sourcing"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GOLD }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all group-hover:gap-4" style={{ color: PURPLE }}>
                Explore Solutions
                <ArrowRight className="w-4 h-4" />
              </div>

              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            {/* Service Card 2: CSA Certification */}
            <Link 
              href="/services/csa-certification"
              className="group relative flex flex-col p-10 rounded-[40px] bg-white border border-gray-100 shadow-sm transition-all hover:shadow-2xl hover:border-yellow-100 hover:-translate-y-2 overflow-hidden"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl mb-8 flex items-center justify-center transition-transform group-hover:scale-110 duration-500" style={{ backgroundColor: `${GOLD}10` }}>
                <ShieldCheck className="w-8 h-8" style={{ color: GOLD }} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                  Compliance & Certification
                </h2>
                <p className="text-gray-500 leading-relaxed mb-8">
                  Navigate the complexities of Canadian building codes and CSA certification. 
                  We ensure your imported structures meet all provincial standards and approvals.
                </p>
                
                <ul className="space-y-3 mb-10">
                  {["CSA A277 & Z240 Compliance", "Engineering Alignment", "Material Certification", "Permit & Zoning Guidance"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PURPLE }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all group-hover:gap-4" style={{ color: GOLD }}>
                View Certification Guide
                <ArrowRight className="w-4 h-4" />
              </div>

              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

          </div>

          {/* Third Category: Supply Chain & Logistics */}
          <div className="mt-8">
            <div className="p-12 rounded-[48px] bg-gray-900 text-white relative overflow-hidden">
               <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                      <Globe className="w-3 h-3 text-yellow-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">Logistics & Supply Chain</span>
                    </div>
                    <h3 className="text-3xl font-black tracking-tight leading-tight">
                      Seamless Cross-Border <br /> Procurement
                    </h3>
                    <p className="text-gray-400 text-lg">
                      We don't just find suppliers; we manage the entire movement of goods from 
                      Chinese factory floors to Canadian construction sites.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                        <Truck className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold">Ocean & Inland Freight</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                        <Settings className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs font-bold">Quality Control (QC)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="aspect-square rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between">
                        <HardHat className="w-8 h-8 text-yellow-400" />
                        <p className="text-sm font-bold leading-snug tracking-tight">On-Site <br />Support</p>
                     </div>
                     <div className="aspect-square rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between">
                        <Factory className="w-8 h-8 text-purple-400" />
                        <p className="text-sm font-bold leading-snug tracking-tight">Vetted <br />Factories</p>
                     </div>
                  </div>
               </div>

               {/* Background abstract circles */}
               <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Stats Section */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Cost Reduction", value: "Up to 65%" },
              { label: "Delivery Network", value: "Coast-to-Coast" },
              { label: "Manufacturing Partners", value: "50+ Vetted" },
              { label: "Projects Completed", value: "Industrial Scale" }
            ].map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900 tracking-tighter" style={{ color: stat.value.includes("%") ? PURPLE : "inherit" }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto rounded-[64px] p-12 md:p-24 text-center bg-gray-50 border border-gray-100 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-[1000] text-gray-900 tracking-tighter leading-tight mb-8">
              Ready to Optimize Your <br />Construction Supply Chain?
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/contact"
                className="px-8 py-4 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-xl"
              >
                Contact Our Team
              </Link>
              <Link 
                href="/products"
                className="px-8 py-4 rounded-2xl border-2 border-gray-900 text-gray-900 font-black uppercase tracking-widest text-xs hover:bg-gray-900 hover:text-white transition-all"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
