"use client";

import { useState, useEffect } from "react";
import { VideoItem } from "@/app/actions/video-centre";
import { PageHeader } from "@/components/ui/PageHeader";
import { 
  Play, 
  X, 
  Video, 
  Compass, 
  Clock, 
  ArrowRight,
} from "lucide-react";

// Local inline YouTube SVG icon to prevent compile failures due to Lucide package discrepancies
const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

interface VideoCentreClientProps {
  initialVideos: VideoItem[];
}

const GOLD = "#D4AF37";
const PURPLE = "#4B1D8F";

export function VideoCentreClient({ initialVideos }: VideoCentreClientProps) {
  const [videos] = useState<VideoItem[]>(initialVideos);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Keyboard escape key trigger to close the Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideoId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (videos.length === 0) {
    return (
      <main className="bg-[#FAF9FC] min-h-screen py-24 flex items-center justify-center">
        <div className="text-center p-8 bg-white border border-gray-100 rounded-3xl max-w-md mx-auto shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 mb-6 border border-purple-100 text-[#4B1D8F]">
            <Video className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Portfolio Showroom Offline</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            We are currently curating and uploading dynamic footage of our completed modular assemblies and structure testing. Please check back shortly.
          </p>
          <a
            href="/contact"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 hover:bg-gray-800 text-white px-6 text-sm font-extrabold uppercase tracking-widest transition-transform hover:scale-105 active:scale-95"
          >
            Contact Sourcing Desk
          </a>
        </div>
      </main>
    );
  }

  // Determine which video is highlighted in the cinematic Spotlight slot
  const spotlightVideo = videos.find((v) => v.is_featured) || videos[0];
  
  // The rest of the videos populate the interactive grid below
  const gridVideos = videos.filter((v) => v.id !== spotlightVideo.id);

  const handleOpenLightbox = (youtubeId: string) => {
    setActiveVideoId(youtubeId);
  };

  const handleCloseLightbox = () => {
    setActiveVideoId(null);
  };

  return (
    <main className="bg-[#FAF9FC] min-h-screen text-gray-900 relative">
      
      {/* Background Blueprint Grid Effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay z-0" 
        style={{
          backgroundImage: `
            radial-gradient(circle, ${PURPLE} 1px, transparent 1px),
            linear-gradient(to right, ${PURPLE} 1px, transparent 1px),
            linear-gradient(to bottom, ${PURPLE} 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px, 40px 40px, 40px 40px"
        }}
      />

      <PageHeader
        eyebrow="Dynamic Modular Portfolio"
        title={<>Our Capabilities <span style={{ color: PURPLE }}>In Motion</span></>}
        subtitle="Experience the speed, precision, and engineering capacity of Apex Modular — live timelapses and custom structural setups."
      />

      {/* Theater Centerpiece Card */}
      <section className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Theater Centerpiece Card */}
          <div
            className="rounded-2xl overflow-hidden bg-[#130728] border border-white/10 shadow-xl relative max-w-3xl mx-auto group"
            style={{ boxShadow: "0 16px 40px rgba(0, 0, 0, 0.4)" }}
          >
            <div className="grid md:grid-cols-12 items-stretch">

              {/* Widescreen Cover & Play trigger */}
              <div
                onClick={() => handleOpenLightbox(spotlightVideo.youtube_id)}
                className="md:col-span-7 aspect-video relative overflow-hidden bg-black cursor-pointer group-hover:opacity-95 transition-all"
              >
                <img
                  src={`https://img.youtube.com/vi/${spotlightVideo.youtube_id}/maxresdefault.jpg`}
                  alt={spotlightVideo.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${spotlightVideo.youtube_id}/hqdefault.jpg`;
                  }}
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-[#1D0A3A] transition-all duration-300 scale-95 group-hover:scale-110 shadow-lg"
                    style={{ backgroundColor: GOLD }}
                  >
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/15">
                  <YoutubeIcon className="h-3.5 w-3.5 text-red-500" />
                  Spotlight Video
                </div>
              </div>

              {/* Briefing sidebar info */}
              <div className="md:col-span-5 p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 bg-gradient-to-br from-[#1A0A33] to-[#120524]">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-2 block">Featured Project</span>
                  <h3 className="text-base font-black tracking-tight leading-snug mb-2">{spotlightVideo.title}</h3>
                  {spotlightVideo.description && (
                    <p className="text-purple-200 text-xs leading-relaxed line-clamp-3">
                      {spotlightVideo.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleOpenLightbox(spotlightVideo.youtube_id)}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-widest text-[#1D0A3A] hover:opacity-90 transition-all cursor-pointer shadow-md"
                  style={{ backgroundColor: GOLD }}
                >
                  Watch Video
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          </div>

      </section>

      {/* Grid List of Other Construction Showcases */}
      {gridVideos.length > 0 && (
        <section className="container mx-auto px-6 py-24 max-w-7xl relative z-10">
          
          <div className="border-b border-gray-200 pb-6 mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Active Construction Portfolio</h2>
              <p className="text-sm text-gray-400 mt-1">Select any case below to watch the modular construction workflow.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <Clock className="h-4 w-4" />
              {gridVideos.length} Showcases Available
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gridVideos.map((video) => (
              <div 
                key={video.id} 
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:border-[#D4AF37]/35 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                style={{ boxShadow: "0 10px 30px rgba(0, 0, 0, 0.02)" }}
              >
                {/* Widescreen Thumbnail with Play Overlay */}
                <div 
                  onClick={() => handleOpenLightbox(video.youtube_id)}
                  className="aspect-video relative overflow-hidden bg-gray-950 cursor-pointer"
                >
                  <img
                    src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-white/90 group-hover:bg-[#D4AF37] group-hover:text-gray-950 text-[#4B1D8F] flex items-center justify-center shadow-lg transition-all scale-90 group-hover:scale-100">
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Core description text and explanation */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-gray-950 tracking-tight leading-snug mb-3 group-hover:text-[#4B1D8F] transition-colors text-base">
                      {video.title}
                    </h3>
                    
                    {video.description && (
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-4">
                        {video.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-6 mt-6 border-t border-gray-50 flex items-center justify-between">
                    <button 
                      onClick={() => handleOpenLightbox(video.youtube_id)}
                      className="text-xs font-black uppercase tracking-widest text-[#4B1D8F] flex items-center gap-1 hover:text-[#b8960f] transition-colors cursor-pointer"
                    >
                      Launch Theater
                      <ArrowRight className="h-3 w-3" />
                    </button>
                    <YoutubeIcon className="h-4 w-4 text-gray-300" />
                  </div>
                </div>

              </div>
            ))}
          </div>

        </section>
      )}

      {/* Global Sourcing Info Bar */}
      <section className="bg-white border-t border-gray-100 py-16 text-center">
        <div className="container mx-auto px-6 max-w-4xl">
          <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2">Want to build something similar?</h3>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto mb-6">
            Get in touch with our corporate sourcing desk to request volume quotes, custom structural calibrations, or regulatory assistance.
          </p>
          <a
            href="/contact?subject=Modular Project Inquiry"
            className="inline-flex h-11 items-center justify-center rounded-xl text-white px-6 text-xs font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 shadow-md"
            style={{ 
              background: `linear-gradient(135deg, ${PURPLE} 0%, #351368 100%)`,
              boxShadow: "0 10px 20px -5px rgba(75, 29, 143, 0.3)"
            }}
          >
            Request Project Consultation
          </a>
        </div>
      </section>

      {/* Dark Theater Mode Lightbox Overlay */}
      {activeVideoId && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={handleCloseLightbox}
        >
          {/* Close button */}
          <button 
            onClick={handleCloseLightbox}
            className="absolute top-4 right-4 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 cursor-pointer transition-colors shadow-lg active:scale-95"
            aria-label="Close video player"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Video Iframe Container */}
          <div 
            className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black relative animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()} // Prevent closing when iframe wrapper is clicked
          >
            <iframe
              src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
              title="Project video playback"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

    </main>
  );
}
