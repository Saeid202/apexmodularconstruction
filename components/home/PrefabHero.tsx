'use client'

import Link from 'next/link'
import { ArrowRight, MessageCircle, Check } from 'lucide-react'
import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'

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
  const sectionRef = useRef<HTMLElement>(null)

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
      ref={sectionRef}
      className="relative w-full h-screen flex items-center overflow-hidden"
      itemScope
      itemType="https://schema.org/Offer"
      data-ai-context="hero-section"
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

      {/* Background Image - Modern Modular House */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=1080&fit=crop&q=80"
          alt="Modern Modular House"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dark Overlay (40-50%) */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Gradient Overlay (purple to transparent) */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-950/60 via-transparent to-transparent" />

      {/* Content - Left Aligned */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-20">
        <div className="max-w-2xl">
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 w-fit"
          >
            <span className="w-2 h-2 bg-amber-400 rounded-full" />
            <span className="text-sm font-semibold text-white tracking-wide">
              Industry Leading Partner
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.1]"
            itemProp="name"
          >
            {headline}
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-100 max-w-xl mb-12 leading-relaxed font-light"
            itemProp="description"
          >
            {subtext}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            {ctaEnabled && (
              <Link
                href={ctaLink}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-950 font-bold rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-2xl active:scale-95"
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
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-lg transition-all duration-300 hover:bg-white/10 active:scale-95"
              data-ai-cta="whatsapp"
            >
              <MessageCircle className="h-5 w-5" />
              Contact Us
            </a>
          </motion.div>

          {/* Trust Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 max-w-xl border-t border-white/20 pt-8"
          >
            {trustStats.map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-black text-white mb-2">{stat.number}</div>
                <p className="text-sm text-gray-200 font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-xs text-white/70 font-medium tracking-widest uppercase">Scroll</span>
        <svg
          className="h-5 w-5 text-white/70"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </motion.div>

      {/* Slide Indicators */}
      {allSlides.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {allSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`transition-all duration-300 h-1 rounded-full ${
                i === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
