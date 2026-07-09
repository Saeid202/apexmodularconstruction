'use client'

import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { useRef, useState, useEffect, useCallback } from 'react'

type SlideData = {
  title?: string
  subtitle?: string | null
  image_url?: string
  cta_text?: string | null
  cta_link?: string | null
  cta_enabled?: boolean
  headline?: string | null
  subtext?: string | null
  benefits?: string[] | null
  cta_secondary_text?: string | null
  cta_secondary_link?: string | null
  trust_line?: string | null
}

interface PrefabHeroProps {
  slides?: SlideData[]
  autoplay?: boolean
  autoplayInterval?: number
  slide?: SlideData | null
}

export function PrefabHero({
  slides = [],
  autoplay = false,
  autoplayInterval = 5,
  slide,
}: PrefabHeroProps) {
  const allSlides = slides.length > 0 ? slides : slide ? [slide] : []
  const [currentIndex, setCurrentIndex] = useState(0)

  const slidesLengthRef = useRef(allSlides.length)
  slidesLengthRef.current = allSlides.length

  const advance = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % slidesLengthRef.current)
  }, [])

  useEffect(() => {
    if (!autoplay || allSlides.length <= 1) return
    const t = setInterval(advance, autoplayInterval * 1000)
    return () => clearInterval(t)
  }, [autoplay, autoplayInterval, advance, allSlides.length])

  const activeSlide = allSlides[currentIndex] ?? null

  const headline =
    activeSlide?.headline || activeSlide?.title || 'Premium Prefabricated Modular Homes'
  const subtext =
    activeSlide?.subtext ||
    activeSlide?.subtitle ||
    "Factory-engineered with precision. CSA-certified. Delivered to your site in 8 weeks. Partner with Canada's trusted modular construction leader."

  const ctaText = activeSlide?.cta_text || 'Get a Quote'
  const ctaLink = activeSlide?.cta_link || '/contact'
  const ctaEnabled = activeSlide?.cta_enabled ?? true

  const trustStats = [
    { number: '5,000+', label: 'Units Delivered' },
    { number: '100%', label: 'CSA Certified' },
    { number: '8 weeks', label: 'Average Delivery' },
  ]

  return (
    <section
      className="relative min-h-[85vh] md:min-h-screen flex items-center overflow-hidden bg-primary-900"
      itemScope
      itemType="https://schema.org/Offer"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Offer',
            name: headline,
            description: subtext,
            category: 'Construction Materials',
            offeredBy: {
              '@type': 'Organization',
              name: 'Apex Modular Construction',
              url: 'https://apexmodularconstruction.com',
            },
            areaServed: { '@type': 'Country', name: 'Canada' },
          }),
        }}
      />

      {/* Background image with gradient overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=1080&fit=crop&q=80"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 from-50% via-primary-900/80 to-primary-900/60" />
      </div>

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(212,175,55,0.8) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-secondary-500/20 mb-6 md:mb-8 w-fit">
            <span className="w-1.5 h-1.5 bg-secondary-500 rounded-full" />
            <span className="text-xs font-semibold text-secondary-500 tracking-wide">
              Industry Leading Partner
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4 md:mb-6 leading-[1.05]"
            itemProp="name"
          >
            {headline}
          </h1>

          {/* Subheading */}
          <p
            className="text-base md:text-lg text-primary-100/70 max-w-xl mb-8 md:mb-12 leading-relaxed"
            itemProp="description"
          >
            {subtext}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-12 md:mb-16">
            {ctaEnabled && (
              <Link
                href={ctaLink}
                className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 bg-secondary-500 text-primary-900 font-bold rounded-lg transition-all duration-300 hover:bg-secondary-600 hover:shadow-lg active:scale-[0.98]"
                data-ai-cta="primary"
              >
                {ctaText}
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
            <a
              href={`https://wa.me/16047128018?text=${encodeURIComponent('Hi Apex Modular Construction! I have a construction project in Canada and would like a free consultation.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 border border-white/20 text-white font-medium rounded-lg bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 active:scale-[0.98]"
              data-ai-cta="whatsapp"
            >
              <MessageCircle className="h-5 w-5" />
              Contact Us
            </a>
          </div>

          {/* Trust Stats */}
          <div className="grid grid-cols-3 gap-6 md:gap-8 max-w-xl border-t border-white/10 pt-6 md:pt-8">
            {trustStats.map((stat, i) => (
              <div key={i}>
                <div className="text-2xl md:text-3xl font-bold text-secondary-500 mb-1">{stat.number}</div>
                <p className="text-xs md:text-sm text-primary-100/60 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {allSlides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {allSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`transition-all duration-300 h-1 rounded-full ${
                i === currentIndex ? 'w-8 bg-secondary-500' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}