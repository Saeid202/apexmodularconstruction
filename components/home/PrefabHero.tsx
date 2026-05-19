"use client";

import Link from "next/link";
import { Check, ArrowRight, Building2, MessageCircle } from "lucide-react";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

interface PrefabHeroProps {
  slide?: {
    title?: string;
    subtitle?: string | null;
    image_url?: string;
    cta_text?: string | null;
    cta_link?: string | null;
    cta_enabled?: boolean;
    headline?: string | null;
    subtext?: string | null;
    benefits?: string[] | null;
    cta_secondary_text?: string | null;
    cta_secondary_link?: string | null;
    trust_line?: string | null;
  } | null;
}

export function PrefabHero({ slide }: PrefabHeroProps) {
  // Extract values dynamically with elegant, robust fallbacks to our designed defaults:
  const headline = slide?.headline || slide?.title || "Prefabricated Modular Homes from China to Canada";
  const subtext = slide?.subtext || slide?.subtitle || "End-to-end design, manufacturing, and installation of certified modular buildings delivered across Canada. CSA-compliant, climate-ready, and built to last.";
  const imageUrl = slide?.image_url || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&h=1000&fit=crop";
  
  const ctaText = slide?.cta_text || "Get a Quote";
  const ctaLink = slide?.cta_link || "/contact";
  const ctaEnabled = slide?.cta_enabled ?? true;
  
  const ctaSecondaryText = slide?.cta_secondary_text || "View Products";
  const ctaSecondaryLink = slide?.cta_secondary_link || "/products";
  
  const trustLine = slide?.trust_line || "Engineered for Canadian climates • CSA-aligned manufacturing • Direct factory pricing";

  const defaultBenefits = [
    "Factory-built precision compliant with Canadian standards",
    "Faster construction with reduced cost and on-site time",
    "Full-service delivery from design to installation"
  ];
  const benefits = slide?.benefits && Array.isArray(slide.benefits) && slide.benefits.length > 0
    ? slide.benefits
    : defaultBenefits;

  // Dynamic brand keyword highlighting (preserves purple brand color for key terms)
  const renderHeadline = () => {
    const highlightPhrases = [
      "Modular Homes",
      "Robots & Automation",
      "Industrial Robots",
      "Prefabricated Modular Homes",
      "Prefabricated",
      "Construction Solutions"
    ];

    for (const phrase of highlightPhrases) {
      if (headline.includes(phrase)) {
        const parts = headline.split(phrase);
        return (
          <>
            {parts[0]}
            <span className="text-[#4B1D8F] bg-gradient-to-r from-[#4B1D8F] to-[#7c3aed] bg-clip-text text-transparent font-black relative inline-block">
              {phrase}
              <span className="absolute left-0 bottom-1.5 w-full h-[3px] bg-[#D4AF37]/80 rounded-full" />
            </span>
            {parts[1]}
          </>
        );
      }
    }

    return headline;
  };

  return (
    <section 
      className="relative w-full bg-white flex flex-col lg:flex-row min-h-[calc(100vh-80px)] border-b border-purple-900/10 overflow-hidden"
      itemScope
      itemType="https://schema.org/Offer"
      data-ai-context="hero-section"
      data-ai-category="prefabricated-homes"
      data-ai-focus="china-to-canada-delivery"
    >
      {/* Self-contained CSS Animations */}
      <style>{`
        @keyframes shimmer-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer-slide {
          animation: shimmer-slide 2.8s infinite linear;
        }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Offer",
          "name": "Prefabricated Modular Homes from China to Canada",
          "description": "End-to-end design, manufacturing, and installation of certified modular buildings delivered across Canada",
          "category": "Construction Materials",
          "offeredBy": {
            "@type": "Organization",
            "name": "Apex Modular Construction",
            "url": "https://apexmodularconstruction.com"
          },
          "areaServed": {
            "@type": "Country",
            "name": "Canada"
          },
          "priceSpecification": {
            "@type": "PriceSpecification",
            "priceCurrency": "CAD",
            "price": "Contact for Quote"
          },
          "additionalProperty": benefits.map((b, idx) => ({
            "@type": "PropertyValue",
            "name": `Benefit ${idx + 1}`,
            "value": b
          }))
        })
      }} />
      
      {/* Left Side - Left-Aligned Content positioned totally to the left edge of the page */}
      <div 
        className="w-full lg:w-1/2 p-6 sm:p-12 lg:pl-16 lg:pr-12 lg:py-16 xl:py-24 xl:pl-20 flex flex-col justify-center space-y-8 lg:space-y-10 order-2 lg:order-1 relative overflow-hidden" 
        style={{
          background: "radial-gradient(circle at 10% 20%, rgba(253, 252, 255, 1) 0%, rgba(244, 241, 251, 0.7) 100%)",
        }}
        itemProp="description"
      >
        {/* Subtle grid pattern overlay for architectural aesthetic */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #4B1D8F 1px, transparent 1px),
              linear-gradient(to bottom, #4B1D8F 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Value Badge */}
        <div 
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-[#D4AF37]/35 shadow-sm text-[#4B1D8F] text-xs sm:text-sm font-bold w-fit relative z-10 hover:border-[#D4AF37] transition-colors"
          data-ai-tag="value-proposition"
          data-ai-label="direct-factory-delivery"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
          </span>
          <span className="tracking-wider uppercase text-[10px] sm:text-xs">Direct from Factory to Your Site</span>
        </div>

        {/* H1 Heading */}
        <h1 
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight relative z-10"
          itemProp="name"
          data-ai-tag="main-headline"
          data-ai-keywords="prefabricated modular homes, china to canada, construction materials"
        >
          {renderHeadline()}
        </h1>

        {/* Subtext description */}
        <p 
          className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl relative z-10 font-normal"
          data-ai-tag="value-proposition"
          data-ai-description="end-to-end modular building services with CSA compliance"
        >
          {subtext}
        </p>

        {/* Key Benefits - Vertical Checklist */}
        <ul 
          className="space-y-5 max-w-2xl relative z-10"
          itemProp="additionalProperty"
          data-ai-tag="key-benefits"
        >
          {benefits.map((benefit, idx) => (
            <li 
              key={idx}
              className="flex items-start gap-4 text-gray-800 group"
              itemProp="name"
              itemScope
              itemType="https://schema.org/PropertyValue"
            >
              <div 
                className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-[#4B1D8F] to-[#7c3aed] flex items-center justify-center mt-0.5 shadow-md shadow-purple-900/10 group-hover:scale-110 transition-transform duration-200" 
                aria-hidden="true"
                style={{ border: `1.5px solid ${GOLD}` }}
              >
                <Check className="h-4 w-4 text-white" strokeWidth={3} />
              </div>
              <span className="text-base sm:text-lg font-semibold text-gray-800 tracking-tight leading-snug">{benefit}</span>
              <meta itemProp="value" content={benefit} />
            </li>
          ))}
        </ul>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 relative z-10">
          {ctaEnabled && (
            <Link
              href={ctaLink}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, #4B1D8F, #321163)",
                border: `2px solid ${GOLD}`,
                boxShadow: "0 12px 30px rgba(75,29,143,0.25)"
              }}
              data-ai-cta="primary"
              data-ai-action="get-quote"
            >
              {/* Shimmer effect */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer-slide" style={{ animationDuration: '2.5s' }} />
              
              <span>{ctaText}</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          )}

          {/* WhatsApp Contact Us Button */}
          <a
            href={`https://wa.me/16047128018?text=${encodeURIComponent("Hi Apex Modular Construction! I have a construction project in Canada and would like a free consultation.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg relative overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, #4B1D8F, #321163)",
              border: `2px solid ${GOLD}`,
              boxShadow: "0 12px 30px rgba(75,29,143,0.25)"
            }}
            data-ai-cta="whatsapp"
            data-ai-action="whatsapp-contact"
          >
            {/* Shimmer effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer-slide" style={{ animationDuration: '2.5s' }} />
            
            <MessageCircle className="h-5 w-5 relative z-10" aria-hidden="true" />
            <span className="relative z-10">Contact Us</span>
          </a>
          
          <Link
            href={ctaSecondaryLink}
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-bold text-gray-800 border-2 border-gray-300 hover:border-[#4B1D8F] hover:text-[#4B1D8F] hover:bg-[#4B1D8F]/5 transition-all duration-300 bg-white/70 backdrop-blur-sm"
            data-ai-cta="secondary"
            data-ai-action="view-products"
          >
            {ctaSecondaryText}
          </Link>
        </div>

        {/* Trust Indicator Line */}
        <div 
          className="pt-8 border-t border-gray-200/80 relative z-10"
          data-ai-tag="trust-indicators"
          data-ai-trust="csa-compliance, factory-pricing, canadian-climate"
        >
          <div className="flex flex-wrap items-center gap-y-2 text-xs sm:text-sm text-gray-500 font-semibold tracking-wide">
            {trustLine?.split("•").map((item, index, arr) => (
              <span key={index} className="flex items-center">
                {item.trim()}
                {index < arr.length - 1 && (
                  <span className="mx-3 text-[#D4AF37] font-bold" aria-hidden="true">◆</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Visual Framed Card on the Right 50% split screen */}
      <div 
        className="w-full lg:w-1/2 p-6 sm:p-12 lg:p-16 xl:p-20 flex items-center justify-center order-1 lg:order-2 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #F3F1F9 0%, #FAFAFA 50%, #FFFFFF 100%)",
        }}
      >
        {/* Grid pattern overlay (same pattern but lighter, mirroring the left column for visual cohesion) */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #4B1D8F 1px, transparent 1px),
              linear-gradient(to bottom, #4B1D8F 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Structural Blueprint Crosshairs (Fine Details) */}
        <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-[#D4AF37]/30 pointer-events-none" />
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-[#D4AF37]/30 pointer-events-none" />

        {/* Visual Architectural Frame Container */}
        <div className="relative w-full h-full min-h-[420px] sm:min-h-[500px] lg:min-h-[550px] flex items-stretch">
          {/* Decorative Blueprint Outline (Golden Offset Frame) */}
          <div 
            className="absolute -inset-3 rounded-[3rem] border border-[#D4AF37]/40 pointer-events-none transform translate-x-2 translate-y-2" 
            style={{
              backgroundImage: "radial-gradient(circle, #D4AF37 1px, transparent 1px)",
              backgroundSize: "16px 16px",
              opacity: 0.3
            }}
          />

          {/* Main Visual Card */}
          <div 
            className="relative w-full rounded-[2.8rem] overflow-hidden border-2 border-white/80 shadow-[0_30px_70px_rgba(75,29,143,0.18)] flex flex-col justify-end group transition-transform duration-500 hover:scale-[1.01]"
          >
            {/* Visual Cover Image with slow-zoom hover effect */}
            <img
              src={imageUrl}
              alt="Modern prefabricated modular construction project site from China to Canada"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              itemProp="image"
              data-ai-image="modular-home-construction"
              data-ai-subject="steel-frame-structure"
            />
            
            {/* Dark luxury overlay for strong contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" aria-hidden="true" />

            {/* Frosted Glass Overlay Card with luxury metrics */}
            <div 
              className="absolute bottom-6 left-6 right-6 backdrop-blur-xl bg-white/90 rounded-2xl p-6 border border-white/50 shadow-2xl space-y-4 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-purple-900/10"
              style={{
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)"
              }}
            >
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#D4AF37] block mb-1">Apex Modular Construction</span>
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Building2 className="h-5.5 w-5.5 text-[#4B1D8F] flex-shrink-0" />
                  Premium Modular Solutions
                </h3>
                <p className="text-xs text-gray-600 mt-1 font-medium leading-relaxed">
                  Engineered to strict CSA standards & optimized for Canadian climates.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200/60">
                {/* Metric 1 */}
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 border border-purple-100"
                    style={{ color: "#4B1D8F" }}
                  >
                    <svg className="w-5 h-5 text-[#4B1D8F]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-black text-gray-900 leading-none">50% Faster</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Build Time</p>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0 border border-yellow-100"
                    style={{ color: "#D4AF37" }}
                  >
                    <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-black text-gray-900 leading-none">30% Savings</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Direct Sourcing</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
    </section>
  );
}
