import { getArchitectProfileBySubdomain } from "@/app/actions/architect";
import { notFound } from "next/navigation";
import { Compass, Mail, Phone, MapPin, Globe, Award, Send, ArrowRight } from "lucide-react";
import Link from "next/link";
import HeroBackgroundSlider from "./HeroBackgroundSlider";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Custom SVG Social Icons to prevent package discrepancies
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  );
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicArchitectStudioPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { profile, error } = await getArchitectProfileBySubdomain(resolvedParams.slug);

  if (!profile || error) {
    notFound();
  }

  // Setup branding fallback
  const branding = profile.branding || {};
  const primaryColor = branding.primaryColor || "#10B981"; // default emerald
  const secondaryColor = branding.secondaryColor || "#0F172A"; // default dark slate
  const title = branding.title || profile.firm_name || profile.full_name;
  const tagline = branding.tagline || "Apex Authorized Architect Studio";

  // Hero section custom config
  const heroConfig = branding.heroConfig || {};
  const bgType = heroConfig.bgType || "color";
  const singleImageUrl = heroConfig.singleImageUrl || "";
  const sliderImages = heroConfig.sliderImages || [];
  const textAlignment = heroConfig.textAlignment || "left";
  const textOverlayOpacity = heroConfig.textOverlayOpacity !== undefined ? heroConfig.textOverlayOpacity : 0.4;
  const ctaText = heroConfig.ctaButton?.text || "Browse Catalog";
  const ctaLink = heroConfig.ctaButton?.link || "#portfolio";

  // Mock projects/designs to represent their modular templates (Shopify catalog style)
  const mockTemplates = [
    {
      id: "t1",
      title: "The Nordic Canopy",
      category: "Residential Cabin",
      area: "850 sq ft",
      bedrooms: 2,
      bathrooms: 1,
      image: "https://images.unsplash.com/photo-1549517045-bc93de075e53?auto=format&fit=crop&q=80&w=800",
      description: "A minimalist modular cabin designed for high snow loads and premium thermal insulation."
    },
    {
      id: "t2",
      title: "Vanguard Studio Suite",
      category: "ADU / Garden Suite",
      area: "420 sq ft",
      bedrooms: 1,
      bathrooms: 1,
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
      description: "Modern, open-plan accessory dwelling unit ideal for home offices or guest cottages."
    },
    {
      id: "t3",
      title: "Solace Double Bay",
      category: "Multi-Family Modular",
      area: "1,600 sq ft",
      bedrooms: 3,
      bathrooms: 2.5,
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
      description: "A modular family home utilizing passive solar heating and modular steel-frame design."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ "--primary": primaryColor } as React.CSSProperties}>
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={`${title} Logo`} className="h-8 w-auto max-w-[150px] object-contain" />
          ) : (
            <>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                <Compass className="h-4.5 w-4.5" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">{title}</span>
            </>
          )}
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
          <a href="#portfolio" className="hover:text-slate-900 transition-colors">Modular Designs</a>
          <a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a>
        </nav>
        <div>
          <a
            href="#contact"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            Consultation Inquiry
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white py-24 md:py-32 px-6 overflow-hidden">
        {/* Dynamic Background Rendering */}
        {bgType === "color" ? (
          <>
            {/* Abstract background gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.08),transparent)] z-0" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 z-0" />
          </>
        ) : bgType === "image" && singleImageUrl ? (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div 
              className="absolute inset-0 bg-slate-950 z-10" 
              style={{ opacity: textOverlayOpacity }} 
            />
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: `url(${singleImageUrl})` }} 
            />
          </div>
        ) : bgType === "slider" && sliderImages.length > 0 ? (
          <HeroBackgroundSlider 
            images={sliderImages} 
            overlayOpacity={textOverlayOpacity} 
          />
        ) : (
          <>
            {/* Fallback to default gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.08),transparent)] z-0" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 z-0" />
          </>
        )}

        <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className={`space-y-6 ${textAlignment === "center" ? "md:col-span-12 flex flex-col items-center text-center mx-auto" : "md:col-span-8"}`}>
            {textAlignment === "center" && branding.logoUrl && (
              <div className="relative w-24 h-24 mb-2 rounded-xl border border-white/10 bg-white shadow-lg flex items-center justify-center p-2 overflow-hidden mx-auto">
                <img src={branding.logoUrl} alt={`${title} Logo`} className="max-w-full max-h-full object-contain" />
              </div>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold" style={{ color: primaryColor }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              Certified Apex Architect Partner
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-white">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-xl font-normal leading-relaxed">
              {tagline}
            </p>
            <div className={`flex flex-wrap gap-4 pt-4 ${textAlignment === "center" ? "justify-center" : ""}`}>
              <a
                href={ctaLink}
                className="px-6 py-3 rounded-xl font-bold text-sm text-slate-900 bg-white hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                {ctaText} <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#contact"
                className="px-6 py-3 rounded-xl font-bold text-sm text-white border border-white/20 hover:bg-white/5 transition-all"
              >
                Contact Studio
              </a>
            </div>
          </div>
          {textAlignment !== "center" && (
            <div className="md:col-span-4 flex justify-center md:justify-end">
              {branding.logoUrl ? (
                <div className="relative w-48 h-48 rounded-2xl border-4 border-white/10 bg-white shadow-2xl flex items-center justify-center p-4 overflow-hidden">
                  <img src={branding.logoUrl} alt={`${title} Logo`} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="relative w-48 h-48 rounded-full border-4 border-white/10 bg-slate-900 shadow-2xl flex items-center justify-center text-4xl font-black" style={{ color: primaryColor }}>
                  {(profile.firm_name || profile.full_name).substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-5 space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900">About the Studio</h2>
          <div className="h-1.5 w-16 rounded-full" style={{ backgroundColor: primaryColor }} />
          <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
            <p className="font-medium text-slate-900 text-base">
              Specializing in {profile.specialization || "Modular Construction"}
            </p>
            <p>
              {profile.bio || "We design modern architectural structures that push the boundaries of modularity, ecological sustainability, and structural excellence."}
            </p>
          </div>
        </div>

        <div className="md:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-lg">Studio Profile & Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500 h-10 w-10 shrink-0 flex items-center justify-center">
                <Award className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Experience</p>
                <p className="text-sm font-bold text-slate-800">{profile.experience_years || "5+"} Years Active</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500 h-10 w-10 shrink-0 flex items-center justify-center">
                <MapPin className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Address</p>
                <p className="text-sm font-bold text-slate-800">{profile.address || "Apex Modular Registered Partner"}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500 h-10 w-10 shrink-0 flex items-center justify-center">
                <Globe className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Website</p>
                <a href={profile.website || "#"} target="_blank" rel="noopener noreferrer" className="text-sm font-bold hover:underline" style={{ color: primaryColor }}>
                  {profile.website ? profile.website.replace("https://", "") : "Visit Official Website"}
                </a>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500 h-10 w-10 shrink-0 flex items-center justify-center">
                <Phone className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Phone</p>
                <p className="text-sm font-bold text-slate-800">{profile.phone || "Request via Contact Form"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog / Portfolio Section */}
      <section id="portfolio" className="bg-slate-100 py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900">Modular Design Catalog</h2>
            <p className="text-slate-500 max-w-md mx-auto text-sm">
              Explore customizable building plans designed for Apex Modular construction standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all flex flex-col">
                <div className="h-48 overflow-hidden relative">
                  <img src={template.image} alt={template.title} className="w-full h-full object-cover hover:scale-105 transition-all duration-500" />
                  <span className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {template.category}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 text-lg leading-snug">{template.title}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase">{template.area} | {template.bedrooms} Bed | {template.bathrooms} Bath</p>
                    <p className="text-slate-600 text-xs leading-relaxed">{template.description}</p>
                  </div>
                  <button
                    className="w-full py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-all border text-slate-800 border-gray-200 bg-slate-50 hover:bg-slate-100"
                  >
                    View Architectural Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead generation contact section */}
      <section id="contact" className="py-20 px-6 max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-extrabold text-slate-900">Request Custom Collaboration</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Get in touch with us to customize one of our modular home templates or design a new structural geometry.
          </p>
        </div>

        <form className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Your Name</label>
              <input type="text" required placeholder="Enter full name" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": primaryColor } as React.CSSProperties} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Email Address</label>
              <input type="email" required placeholder="name@example.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": primaryColor } as React.CSSProperties} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Design Interest</label>
            <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2" style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}>
              <option>Nordic Canopy (850 sq ft)</option>
              <option>Vanguard Studio Suite (420 sq ft)</option>
              <option>Solace Double Bay (1,600 sq ft)</option>
              <option>Fully Custom Architectural Concept</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Project Message</label>
            <textarea required rows={4} placeholder="Describe your land details, location, zoning requirements, or design vision..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 resize-none" style={{ "--tw-ring-color": primaryColor } as React.CSSProperties} />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 hover:opacity-95 transition-all"
            style={{ backgroundColor: primaryColor }}
          >
            <Send className="h-4.5 w-4.5" /> Submit Request
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-white border-t border-slate-800 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
              <Compass className="h-4.5 w-4.5" />
            </div>
            <span className="font-bold text-base tracking-tight">{title}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a href={profile.branding?.instagram || "#"} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><InstagramIcon className="h-5 w-5" /></a>
            <a href={profile.branding?.linkedin || "#"} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><LinkedinIcon className="h-5 w-5" /></a>
            <a href={profile.branding?.twitter || "#"} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><TwitterIcon className="h-5 w-5" /></a>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {title}. Powered by Apex Modular Construction.
          </p>
        </div>
      </footer>
    </div>
  );
}
