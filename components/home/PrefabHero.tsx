"use client";

import Link from "next/link";
import { ArrowRight, ArrowDown, MessageCircle } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform } from "motion/react";

type SlideData = {
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
};

interface PrefabHeroProps {
  slides?: SlideData[];
  autoplay?: boolean;
  autoplayInterval?: number;
  /** @deprecated pass slides array instead */
  slide?: SlideData | null;
}

const EASE = [0.22, 1, 0.36, 1] as const;

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function PrefabHero({ slides = [], autoplay = false, autoplayInterval = 5, slide }: PrefabHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // Normalise: support legacy single-slide prop
  const allSlides = slides.length > 0 ? slides : slide ? [slide] : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fading, setFading] = useState(false);

  const advance = useCallback(() => {
    if (allSlides.length <= 1) return;
    setFading(true);
    setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % allSlides.length);
      setFading(false);
    }, 400);
  }, [allSlides.length]);

  useEffect(() => {
    if (!autoplay || allSlides.length <= 1) return;
    const t = setInterval(advance, autoplayInterval * 1000);
    return () => clearInterval(t);
  }, [autoplay, autoplayInterval, advance, allSlides.length]);

  const activeSlide = allSlides[currentIndex] ?? null;

  const headline = activeSlide?.headline || activeSlide?.title || "Prefabricated Modular Homes from China to Canada";
  const subtext = activeSlide?.subtext || activeSlide?.subtitle || "End-to-end design, manufacturing, and installation of certified modular buildings delivered across Canada. CSA-compliant, climate-ready, and built to last.";
  const imageUrl = activeSlide?.image_url || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop";

  const ctaText = activeSlide?.cta_text || "Get a Quote";
  const ctaLink = activeSlide?.cta_link || "/contact";
  const ctaEnabled = activeSlide?.cta_enabled ?? true;

  const ctaSecondaryText = activeSlide?.cta_secondary_text || "View Products";
  const ctaSecondaryLink = activeSlide?.cta_secondary_link || "/products";

  const defaultBenefits = [
    "Factory-built precision compliant with Canadian standards",
    "Faster construction with reduced cost and on-site time",
    "Full-service delivery from design to installation",
  ];
  const benefits = activeSlide?.benefits && Array.isArray(activeSlide.benefits) && activeSlide.benefits.length > 0
    ? activeSlide.benefits
    : defaultBenefits;

  // Parallax
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Split headline into 3 lines for display
  const words = headline.split(" ");
  const third = Math.ceil(words.length / 3);
  const line1 = words.slice(0, third).join(" ");
  const line2 = words.slice(third, third * 2).join(" ");
  const line3 = words.slice(third * 2).join(" ");

  return (
    <section
      ref={sectionRef}
      className="h-screen w-full relative overflow-hidden"
      itemScope
      itemType="https://schema.org/Offer"
      data-ai-context="hero-section"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Offer",
          "name": headline,
          "description": subtext,
          "category": "Construction Materials",
          "offeredBy": {
            "@type": "Organization",
            "name": "Apex Modular Construction",
            "url": "https://apexmodularconstruction.com"
          },
          "areaServed": { "@type": "Country", "name": "Canada" },
        })
      }} />

      {/* Background image with parallax */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{ y: bgY, scale: bgScale }}
      >
        <img
          src={imageUrl}
          alt="Apex Modular Construction project"
          className={`w-full h-full object-cover transition-opacity duration-400 ${fading ? "opacity-0" : "opacity-100"}`}
          itemProp="image"
        />
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0" style={{ background: "var(--gradient-radial)" }} />

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col justify-start sm:justify-center px-6 sm:px-12 lg:px-24 xl:px-32 pt-28 sm:pt-32 pb-8"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        {/* Eyebrow pill */}
        <FadeUp delay={0}>
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/30 backdrop-blur-md text-white text-xs font-semibold tracking-[0.2em] uppercase w-fit mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
            </span>
            Direct from Factory to Your Site
          </div>
        </FadeUp>

        {/* H1 — three lines, middle line gold gradient */}
        <FadeUp delay={0.15}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-white mb-6" itemProp="name">
            <span className="block">{line1}</span>
            <span className="block text-gradient">{line2}</span>
            <span className="block">{line3}</span>
          </h1>
        </FadeUp>

        {/* Subheading */}
        <FadeUp delay={0.35}>
          <p className="text-lg text-white/75 max-w-xl mb-10 leading-relaxed" itemProp="description">
            {subtext}
          </p>
        </FadeUp>

        {/* CTA row */}
        <FadeUp delay={0.55}>
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            {ctaEnabled && (
              <Link
                href={ctaLink}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-base font-bold text-white bg-gradient-primary shadow-glow transition-all duration-300 hover:scale-105 active:scale-95"
                data-ai-cta="primary"
              >
                {ctaText}
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
            <a
              href={`https://wa.me/16047128018?text=${encodeURIComponent("Hi Apex Modular Construction! I have a construction project in Canada and would like a free consultation.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-base font-bold text-white backdrop-blur-md bg-white/10 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95"
              data-ai-cta="whatsapp"
            >
              <MessageCircle className="h-5 w-5" />
              Contact Us
            </a>
            <Link
              href={ctaSecondaryLink}
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-bold text-white backdrop-blur-md bg-white/10 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95"
              data-ai-cta="secondary"
            >
              {ctaSecondaryText}
            </Link>
          </div>
        </FadeUp>

        {/* Stats strip */}
        <FadeUp delay={1.0}>
          <div className="grid grid-cols-3 gap-0 max-w-lg">
            {benefits.slice(0, 3).map((benefit, i) => (
              <div
                key={i}
                className={`${i > 0 ? "border-l border-white/20" : ""} pl-${i > 0 ? "6" : "0"} pr-6`}
              >
                <p className="text-3xl font-black text-white leading-none mb-1">
                  {i === 0 ? "50%" : i === 1 ? "30%" : "100%"}
                </p>
                <p className="text-xs text-white/60 font-medium leading-snug">{benefit}</p>
              </div>
            ))}
          </div>
        </FadeUp>
      </motion.div>

      {/* Slide indicator dots */}
      {allSlides.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {allSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setFading(true); setTimeout(() => { setCurrentIndex(i); setFading(false); }, 400); }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      )}

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        style={{ opacity: contentOpacity }}
      >
        <span className="text-white/50 text-xs font-semibold tracking-[0.15em] uppercase">Scroll</span>
        <ArrowDown className="h-5 w-5 text-white/50 animate-bounce" />
      </motion.div>
    </section>
  );
}
