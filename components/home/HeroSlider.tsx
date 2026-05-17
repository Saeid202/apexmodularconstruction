"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import type { HeroSlideData } from "@/types";

interface HeroSliderProps {
  slides: HeroSlideData[];
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setImgError(false);
  }, [current]);

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, slides.length]);

  if (!slides.length) return null;
  const slide = slides[current];
  const layoutType = slide.layoutType || 'split';

  // Render split layout (two-column)
  if (layoutType === 'split') {
    return (
      <section data-testid="hero-slider" className="w-full bg-white">
        <div className="relative w-full overflow-hidden min-h-[500px] lg:min-h-[calc(100vh-64px)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[500px] lg:min-h-[calc(100vh-64px)] py-12 lg:py-0">
              
              {/* Left Column - Content */}
              <div className="order-2 lg:order-1 space-y-6 lg:space-y-8">
                {/* H1 Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                  {slide.headline || slide.title}
                </h1>

                {/* Subtext */}
                {slide.subtext && (
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
                    {slide.subtext}
                  </p>
                )}

                {/* Key Benefits */}
                {slide.benefits && slide.benefits.length > 0 && (
                  <ul className="space-y-3">
                    {slide.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-700">
                        <Check className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  {slide.ctaEnabled && slide.ctaText && slide.ctaLink && (
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                      style={{
                        background: "linear-gradient(135deg, #4B1D8F, #3a1570)",
                        boxShadow: "0 0 0 2px #D4AF37, 0 8px 32px rgba(75,29,143,0.5)"
                      }}
                    >
                      {slide.ctaText}
                    </Link>
                  )}
                  {slide.ctaSecondaryText && slide.ctaSecondaryLink && (
                    <Link
                      href={slide.ctaSecondaryLink}
                      className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-bold text-gray-900 border-2 border-gray-300 hover:border-orange-500 hover:text-orange-500 transition-all"
                    >
                      {slide.ctaSecondaryText}
                    </Link>
                  )}
                </div>

                {/* Trust Line */}
                {slide.trustLine && (
                  <p className="text-xs sm:text-sm text-gray-500 pt-2">
                    {slide.trustLine}
                  </p>
                )}
              </div>

              {/* Right Column - Visual */}
              <div className="order-1 lg:order-2 relative">
                <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  {!imgError ? (
                    <Image
                      src={slide.imageUrl}
                      alt={slide.headline || slide.title}
                      fill
                      className="object-cover"
                      priority
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 50vw"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                      Image unavailable
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          {slides.length > 1 && mounted && (
            <>
              <button 
                onClick={prev} 
                aria-label="Previous slide" 
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-gray-900 hover:bg-white shadow-lg transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                onClick={next} 
                aria-label="Next slide" 
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-gray-900 hover:bg-white shadow-lg transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Indicator Dots */}
          {slides.length > 1 && mounted && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 z-20">
              {slides.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrent(i)} 
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-orange-500" : "w-2 bg-gray-300 hover:bg-gray-400"}`} 
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Render centered overlay layout (original style)
  return (
    <section data-testid="hero-slider" className="w-full">
      <div className="relative w-full overflow-hidden bg-gray-900 h-[300px] sm:h-[400px] md:h-[500px] lg:h-[calc(100vh-64px)]">
        {!imgError ? (
          <Image
            src={slide.imageUrl}
            alt={slide.title}
            fill
            className="object-cover"
            priority
            unoptimized
            sizes="100vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">
            Image unavailable
          </div>
        )}

        {/* Background Overlay */}
        {slide.backgroundOverlay !== false && (
          <div className="absolute inset-0 bg-black/40" />
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="text-center text-white max-w-4xl space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              {slide.headline || slide.title}
            </h1>
            {slide.subtext && (
              <p className="text-base sm:text-lg text-gray-200">
                {slide.subtext}
              </p>
            )}
            {slide.benefits && slide.benefits.length > 0 && (
              <ul className="space-y-2 text-left max-w-md mx-auto">
                {slide.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-orange-400" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {slide.ctaEnabled && slide.ctaText && slide.ctaLink && (
                <Link
                  href={slide.ctaLink}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #4B1D8F, #3a1570)",
                    boxShadow: "0 0 0 2px #D4AF37, 0 8px 32px rgba(75,29,143,0.5)"
                  }}
                >
                  {slide.ctaText}
                </Link>
              )}
              {slide.ctaSecondaryText && slide.ctaSecondaryLink && (
                <Link
                  href={slide.ctaSecondaryLink}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-bold text-white border-2 border-white hover:bg-white hover:text-gray-900 transition-all"
                >
                  {slide.ctaSecondaryText}
                </Link>
              )}
            </div>
            {slide.trustLine && (
              <p className="text-xs text-gray-300 pt-2">
                {slide.trustLine}
              </p>
            )}
          </div>
        </div>

        {/* Navigation Controls */}
        {slides.length > 1 && mounted && (
          <>
            <button 
              onClick={prev} 
              aria-label="Previous slide" 
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={next} 
              aria-label="Next slide" 
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Indicator Dots */}
        {slides.length > 1 && mounted && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 z-20">
            {slides.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrent(i)} 
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
