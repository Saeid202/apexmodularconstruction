"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export function PrefabHero() {
  return (
    <section 
      className="relative w-full bg-white"
      itemScope
      itemType="https://schema.org/Offer"
      data-ai-context="hero-section"
      data-ai-category="prefabricated-homes"
      data-ai-focus="china-to-canada-delivery"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Offer",
          "name": "Prefabricated Modular Homes from China to Canada",
          "description": "End-to-end design, manufacturing, and installation of certified modular buildings delivered across Canada",
          "category": "Construction Materials",
          "offeredBy": {
            "@type": "Organization",
            "name": "CargoPlus",
            "url": "https://cargoplus.site"
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
          "additionalProperty": [
            {
              "@type": "PropertyValue",
              "name": "Build Time Reduction",
              "value": "50%"
            },
            {
              "@type": "PropertyValue",
              "name": "Cost Savings",
              "value": "30%"
            },
            {
              "@type": "PropertyValue",
              "name": "Compliance",
              "value": "CSA-certified"
            }
          ]
        })
      }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-64px)] py-12 lg:py-0">
          
          {/* Left Column - Content */}
          <div className="order-2 lg:order-1 space-y-6 lg:space-y-8" itemProp="description">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold"
              data-ai-tag="value-proposition"
              data-ai-label="direct-factory-delivery"
            >
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" aria-hidden="true" />
              Direct from Factory to Your Site
            </div>

            {/* H1 Headline */}
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight"
              itemProp="name"
              data-ai-tag="main-headline"
              data-ai-keywords="prefabricated modular homes, china to canada, construction materials"
            >
              Prefabricated Modular Homes from China to Canada
            </h1>

            {/* Subtext */}
            <p 
              className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl"
              data-ai-tag="value-proposition"
              data-ai-description="end-to-end modular building services with CSA compliance"
            >
              End-to-end design, manufacturing, and installation of certified modular buildings delivered across Canada. CSA-compliant, climate-ready, and built to last.
            </p>

            {/* Key Benefits */}
            <ul 
              className="space-y-4"
              itemProp="additionalProperty"
              data-ai-tag="key-benefits"
            >
              <li 
                className="flex items-start gap-3 text-gray-700"
                data-ai-benefit="canadian-standards-compliance"
                itemProp="name"
                itemScope
                itemType="https://schema.org/PropertyValue"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5" aria-hidden="true">
                  <Check className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-base sm:text-lg">Factory-built precision compliant with Canadian standards</span>
                <meta itemProp="value" content="CSA-compliant manufacturing" />
              </li>
              <li 
                className="flex items-start gap-3 text-gray-700"
                data-ai-benefit="faster-construction"
                itemProp="name"
                itemScope
                itemType="https://schema.org/PropertyValue"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5" aria-hidden="true">
                  <Check className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-base sm:text-lg">Faster construction with reduced cost and on-site time</span>
                <meta itemProp="value" content="50% faster build time" />
              </li>
              <li 
                className="flex items-start gap-3 text-gray-700"
                data-ai-benefit="full-service-delivery"
                itemProp="name"
                itemScope
                itemType="https://schema.org/PropertyValue"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5" aria-hidden="true">
                  <Check className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-base sm:text-lg">Full-service delivery from design to installation</span>
                <meta itemProp="value" content="Turnkey delivery service" />
              </li>
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #4B1D8F, #3a1570)",
                  boxShadow: "0 0 0 2px #D4AF37, 0 8px 32px rgba(75,29,143,0.5)"
                }}
                data-ai-cta="primary"
                data-ai-action="get-quote"
                itemProp="url"
              >
                Get a Quote
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-bold text-gray-900 border-2 border-gray-300 hover:border-purple-500 hover:text-purple-500 transition-all"
                data-ai-cta="secondary"
                data-ai-action="view-products"
              >
                View Products
              </Link>
            </div>

            {/* Trust Line */}
            <div 
              className="pt-4 border-t border-gray-200"
              data-ai-tag="trust-indicators"
              data-ai-trust="csa-compliance, factory-pricing, canadian-climate"
            >
              <p className="text-sm text-gray-500">
                Engineered for Canadian climate • CSA-aligned manufacturing • Direct factory pricing
              </p>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-100">
              {/* Actual image */}
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=800&fit=crop"
                alt="Modern prefabricated modular home construction site showing steel frame structure and building materials for China to Canada delivery"
                className="w-full h-full object-cover"
                itemProp="image"
                data-ai-image="modular-home-construction"
                data-ai-subject="steel-frame-structure"
              />
              
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" aria-hidden="true" />

              {/* Text overlay */}
              <div className="absolute bottom-8 left-0 right-0 text-center px-6">
                <h3 
                  className="text-2xl font-bold mb-2 text-white"
                  data-ai-tag="product-category"
                  data-ai-value="premium-modular-homes"
                >
                  Premium Modular Homes
                </h3>
                <div 
                  className="flex items-center justify-center gap-2 text-white/90 text-sm"
                  data-ai-tag="delivery-route"
                  data-ai-origin="china"
                  data-ai-destination="canada"
                >
                  <span>Built in China</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" aria-hidden="true"></div>
                  <span>Delivered to Canada</span>
                </div>
              </div>
            </div>
            
            {/* Floating stats cards */}
            <div 
              className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-xl p-4 border border-purple-100 hidden lg:block"
              data-ai-metric="build-time-reduction"
              data-ai-value="50%"
              itemScope
              itemType="https://schema.org/PropertyValue"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center" aria-hidden="true">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900" itemProp="value">50%</p>
                  <p className="text-xs text-gray-500" itemProp="name">Faster Build</p>
                </div>
              </div>
            </div>

            <div 
              className="absolute -top-8 -right-8 bg-white rounded-2xl shadow-xl p-4 border border-purple-100 hidden lg:block"
              data-ai-metric="cost-savings"
              data-ai-value="30%"
              itemScope
              itemType="https://schema.org/PropertyValue"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center" aria-hidden="true">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900" itemProp="value">30%</p>
                  <p className="text-xs text-gray-500" itemProp="name">Cost Savings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
