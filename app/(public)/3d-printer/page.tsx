import { Metadata } from "next";
import { 
  Wrench, 
  Settings, 
  ShieldCheck, 
  Cpu, 
  Maximize, 
  Layers, 
  Gauge, 
  ArrowRight,
  TrendingUp,
  Workflow,
  Radio,
  Database,
  Zap,
  Home,
  Building2,
  Briefcase,
  Heart,
  Shield,
  CheckCircle2
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section, SectionHeader, SectionEyebrow } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Construction 3D Printing Systems - GAUDI Tech",
  description: "Explore our ultra-high capacity robotic and folding gantry 3D printers engineered for decentralized rapid-response modular construction.",
};

export default function Construction3DPrinterPage() {
  return (
    <main className="bg-muted/50 min-h-screen relative">

      {/* Background Blueprint Grid Effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay z-0" 
        style={{
          backgroundImage: `
            radial-gradient(circle, #4B1D8F 1px, transparent 1px),
            linear-gradient(to right, #4B1D8F 1px, transparent 1px),
            linear-gradient(to bottom, #4B1D8F 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px, 40px 40px, 40px 40px"
        }}
      />

      <PageHeader
        eyebrow="Advanced Robotics Division"
        title={<>Construction <span className="text-primary">3D Printing</span> Systems</>}
        subtitle="GAUDI Tech systems support full remote operation, advanced pump automation, and on-site material formulation."
      />

      {/* Intro Overview Section */}
      <Section background="muted" padding="md">
        <div className="bg-background rounded-3xl border border-border shadow-elevation-high p-8 md:p-12">
          <div className="grid lg:grid-cols-12 gap-8 items-center">

            <div className="lg:col-span-7">
              <SectionEyebrow>GAUDI Tech Capabilities</SectionEyebrow>
              <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight leading-tight mb-6">
                Technology – 3D Printing Systems
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6 font-medium">
                Our construction platforms are engineered to support both high-volume urban deployment and decentralized rapid-response construction. GAUDI Tech currently operates two primary system types, each tailored to specific project needs and environments.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                All our Tech systems support both remote and manual operation modes, offer automated pump control, and include on-site ink mixing stations to ensure adaptability and efficiency in diverse construction scenarios.
              </p>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-primary-50/50 border border-primary-100/40">
                <Radio className="h-6 w-6 text-primary mb-3" />
                <h4 className="font-extrabold text-foreground text-xs uppercase tracking-wider mb-1">Dual Control</h4>
                <p className="text-[11px] text-muted-foreground leading-normal">Remote teleoperation and manual override modes.</p>
              </div>
              <div className="p-5 rounded-2xl bg-primary-50/50 border border-primary-100/40">
                <Settings className="h-6 w-6 text-primary mb-3" />
                <h4 className="font-extrabold text-foreground text-xs uppercase tracking-wider mb-1">Automated Pump</h4>
                <p className="text-[11px] text-muted-foreground leading-normal">Real-time pressure adjustments and viscosity control.</p>
              </div>
              <div className="p-5 rounded-2xl bg-primary-50/50 border border-primary-100/40 col-span-2">
                <Workflow className="h-6 w-6 text-primary mb-3" />
                <h4 className="font-extrabold text-foreground text-xs uppercase tracking-wider mb-1">On-Site Ink Mixing</h4>
                <p className="text-[11px] text-muted-foreground leading-normal">Continuous feed mixing stations accommodating geographic aggregate differences.</p>
              </div>
            </div>

          </div>
        </div>
      </Section>

      {/* System 1 Showcase Section: Gantry Printer (2.0) */}
      <Section background="muted" padding="md">

        <div className="border-b border-border pb-4 mb-8">
          <SectionEyebrow>System Type 01</SectionEyebrow>
          <h2 className="text-3xl font-black text-foreground tracking-tight">1. Gantry Printer (2.0)</h2>
          <p className="text-sm text-muted-foreground mt-1">High-volume static structural manufacturing.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Image on a premium dark pedestal */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-3xl bg-gradient-to-b from-primary-900 to-primary-800 p-6 border border-white/10 shadow-elevation-raised flex flex-col justify-between overflow-hidden group">

              {/* Neon Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

              {/* Pedestal Shadow */}
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-36 h-5 rounded-full bg-black/40 blur-md" />

              <div className="z-10 flex justify-between items-start w-full">
                <span className="text-[9px] font-black uppercase tracking-widest text-secondary-500 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                  Apex Exclusive
                </span>
                <span className="text-xs font-bold text-primary-200">Active Blueprint</span>
              </div>

              {/* The Printer Image */}
              <div className="z-10 my-auto flex justify-center transform group-hover:scale-105 transition-transform duration-700">
                <img
                  src="/gaudi-3d-printer.png"
                  alt="GAUDI Gantry 3D Printer 2.0"
                  className="max-h-[220px] w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                />
              </div>

              {/* Pedestal Surface */}
              <div className="absolute bottom-8 left-6 right-6 h-10 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 border border-white/5 flex items-center justify-between px-4 z-10">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase text-gray-300">Ready for Deployment</span>
                </div>
                <span className="text-[10px] font-black tracking-widest text-secondary-500">GAUDI 2.0</span>
              </div>

            </div>
          </div>

          {/* Right Column: Specification metrics and descriptions */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h3 className="text-2xl font-black text-foreground tracking-tight mb-4">
                Large-Format Monolithic Printing
              </h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6 font-medium">
                This large-format system features a printing volume of <span className="font-extrabold text-primary">18.5m x 8.5m x 3.0m</span>. The gantry design enables the printing of full-scale villas, public infrastructure, and multi-unit buildings with reduced reliance on scaffolding or mold systems.
              </p>
            </div>

            {/* Grid metrics cards */}
            <div className="grid sm:grid-cols-2 gap-4">

              <div className="p-6 rounded-2xl bg-background border border-border shadow-elevation-low flex gap-4 items-start hover:border-secondary-500/30 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary shrink-0">
                  <Maximize className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Print Volume</h4>
                  <p className="text-base font-black text-foreground">18.5m x 8.5m x 3.0m</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Continuous monolithic capacity</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-background border border-border shadow-elevation-low flex gap-4 items-start hover:border-secondary-500/30 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary shrink-0">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Extrusion system</h4>
                  <p className="text-base font-black text-foreground">Precision-controlled</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">High-viscosity automated pump</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-background border border-border shadow-elevation-low flex gap-4 items-start hover:border-secondary-500/30 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Layer Thickness</h4>
                  <p className="text-base font-black text-foreground">5mm – 25mm</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Automated thickness stabilization</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-background border border-border shadow-elevation-low flex gap-4 items-start hover:border-secondary-500/30 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary shrink-0">
                  <Gauge className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Printing Speed</h4>
                  <p className="text-base font-black text-foreground">8 to 10 m / min</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Rapid monolithic delivery</p>
                </div>
              </div>

            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/40 text-amber-900 text-xs leading-relaxed flex gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Structural Performance:</strong> Highly suited for printing structurally load-bearing panels, complex retaining walls, and custom modular columns without the requirement of custom mold setups.
              </div>
            </div>

          </div>

        </div>

      </Section>

      {/* System 2 Showcase Section: Mobile Folding Printer (3.0) */}
      <Section background="muted" padding="md">

        <div className="border-b border-border pb-4 mb-8">
          <SectionEyebrow>System Type 02</SectionEyebrow>
          <h2 className="text-3xl font-black text-foreground tracking-tight">2. Mobile Folding Printer (3.0)</h2>
          <p className="text-sm text-muted-foreground mt-1">Decentralized, rapid-response modular construction.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Specifications list */}
          <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">
            <div>
              <h3 className="text-2xl font-black text-foreground tracking-tight mb-4">
                Compact Transportable Building System
              </h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6 font-medium">
                This compact and transportable system is engineered for on-demand setup and remote deployments. It folds down for easy relocation and can print structures up to <span className="font-extrabold text-primary">10.3m wide</span>. Perfect for rapid-response projects and modular installations in remote terrains.
              </p>
            </div>

            {/* Grid metrics cards */}
            <div className="grid sm:grid-cols-2 gap-4">

              <div className="p-6 rounded-2xl bg-background border border-border shadow-elevation-low flex gap-4 items-start hover:border-secondary-500/30 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary shrink-0">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Ink Reservoir</h4>
                  <p className="text-base font-black text-foreground">100L Silo Capacity</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">High-volume continuous reservoir</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-background border border-border shadow-elevation-low flex gap-4 items-start hover:border-secondary-500/30 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary shrink-0">
                  <Workflow className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Flow Delivery</h4>
                  <p className="text-base font-black text-foreground">Variable-Speed Flow</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Integrated precision delivery</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-background border border-border shadow-elevation-low flex gap-4 items-start hover:border-secondary-500/30 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary shrink-0">
                  <Maximize className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Maximum Span</h4>
                  <p className="text-base font-black text-foreground">10.3m Print Width</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Folds compactly for transit</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-background border border-border shadow-elevation-low flex gap-4 items-start hover:border-secondary-500/30 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary shrink-0">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Rapid Deployment</h4>
                  <p className="text-base font-black text-foreground">Folding Setup Mode</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Ideal for disaster relief and housing</p>
                </div>
              </div>

            </div>

            <div className="p-4 rounded-xl bg-primary-50/50 border border-primary-200/40 text-primary-900 text-xs leading-relaxed flex gap-2">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong>Disaster & Modular Alignment:</strong> The fold-out trailer configuration allows rapid deployment directly from highway freight transit to site printing operations, reducing labor overhead by up to 80%.
              </div>
            </div>
          </div>

          {/* Right Column: Mobile Folding Printer Image */}
          <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-3xl bg-gradient-to-b from-gray-900 to-primary-900 p-6 border border-white/5 shadow-elevation-raised flex flex-col justify-between overflow-hidden group">

              {/* Neon Ambient Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-purple-500/5 blur-[80px] pointer-events-none" />

              {/* Pedestal Shadow */}
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-36 h-5 rounded-full bg-black/45 blur-md" />

              <div className="z-10 flex justify-between items-start w-full">
                <span className="text-[9px] font-black uppercase tracking-widest text-secondary-500 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                  Trailer Folding
                </span>
                <span className="text-xs font-bold text-primary-200">System 3.0</span>
              </div>

              {/* Mobile Printer Image */}
              <div className="z-10 my-auto flex justify-center transform group-hover:scale-105 transition-transform duration-700">
                <img
                  src="/gaudi-mobile-printer.png"
                  alt="GAUDI Mobile Folding Printer 3.0"
                  className="max-h-[220px] w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                />
              </div>

              <div className="absolute bottom-8 left-6 right-6 h-10 rounded-2xl bg-gradient-to-r from-gray-950 to-gray-900 border border-white/5 flex items-center justify-between px-4 z-10">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase text-gray-400">Mobile Unit Active</span>
                </div>
                <span className="text-[10px] font-black tracking-widest text-emerald-500">GAUDI 3.0</span>
              </div>

            </div>
          </div>

        </div>

      </Section>

      {/* Use Cases & Sector Applications Section */}
      <Section background="muted" padding="lg">

        <SectionHeader
          center
          eyebrow="Global Deployment"
          heading="Use Cases & Sector Applications"
          subheading="GAUDI's technology supports a wide variety of applications across private and public sectors. It enables the creation of structures that are resilient, adaptable, and aesthetically customizable."
        />

        {/* 5-Column Grid Card Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Card 1: Residential */}
          <div className="bg-background rounded-3xl p-8 border border-border shadow-elevation-low hover:border-secondary-500/35 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Home className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-foreground mb-4 tracking-tight">Residential Construction</h3>
              <ul className="space-y-3.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-secondary-500 shrink-0 mt-0.5" />
                  <span>High-performance villas, duplexes, and single-family homes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-secondary-500 shrink-0 mt-0.5" />
                  <span>Multi-unit low-rise housing with integrated energy efficiency.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Commercial */}
          <div className="bg-background rounded-3xl p-8 border border-border shadow-elevation-low hover:border-secondary-500/35 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-foreground mb-4 tracking-tight">Commercial & Mixed Use</h3>
              <ul className="space-y-3.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-secondary-500 shrink-0 mt-0.5" />
                  <span>Customized office buildings and corporate business centers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-secondary-500 shrink-0 mt-0.5" />
                  <span>High-end media hubs, event pavilions, and custom retail spaces.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Infrastructure */}
          <div className="bg-background rounded-3xl p-8 border border-border shadow-elevation-low hover:border-secondary-500/35 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-foreground mb-4 tracking-tight">Infrastructure & Civil Engineering</h3>
              <ul className="space-y-3.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-secondary-500 shrink-0 mt-0.5" />
                  <span>Riverbanks, revetments, sound barriers, and structural bridge panels.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-secondary-500 shrink-0 mt-0.5" />
                  <span>Modular drainage channels, retaining walls, and slope stabilizers.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 4: Public Amenities */}
          <div className="bg-background rounded-3xl p-8 border border-border shadow-elevation-low hover:border-secondary-500/35 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-foreground mb-4 tracking-tight">Public Amenities & Urban Furniture</h3>
              <ul className="space-y-3.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-secondary-500 shrink-0 mt-0.5" />
                  <span>Architectural bus shelters, smart public toilets, and community kiosks.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-secondary-500 shrink-0 mt-0.5" />
                  <span>Exhibition pavilions, public libraries, and tourist visitor hubs.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 5: Emergency & Humanitarian */}
          <div className="bg-background rounded-3xl p-8 border border-border shadow-elevation-low hover:border-secondary-500/35 transition-all duration-300 flex flex-col justify-between group lg:col-span-1 md:col-span-2 hover:-translate-y-1">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-foreground mb-4 tracking-tight">Emergency & Humanitarian Housing</h3>
              <ul className="space-y-3.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-secondary-500 shrink-0 mt-0.5" />
                  <span>High-efficiency tiny homes, pop-up shelters, and modular units.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-secondary-500 shrink-0 mt-0.5" />
                  <span>Perfect for post-disaster recovery zones and refugee humanitarian shelter setup.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Global Impact Summary Bar */}
        <div
          className="mt-16 rounded-3xl p-8 md:p-10 border border-white/10 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gradient-to-br from-[#1A0A33] to-[#301066]"
        >
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`, backgroundSize: "20px 20px" }} />

          <div className="max-w-xl relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary-500 mb-2.5 block">Apex-GAUDI Efficiency Standard</span>
            <h3 className="text-2xl font-black tracking-tight leading-snug">Continuous Material Optimization</h3>
            <p className="text-primary-100 text-xs mt-2 leading-relaxed">
              In all scenarios, GAUDI reduces the build time by more than 50%, cuts material waste, and improves structural consistency.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 shrink-0 relative z-10 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-10">
            <div>
              <div className="text-3xl font-black text-secondary-500 leading-none mb-1">&gt; 50%</div>
              <div className="text-[9px] uppercase tracking-wider text-primary-200 font-extrabold">Build Time Saved</div>
            </div>
            <div>
              <div className="text-3xl font-black text-secondary-500 leading-none mb-1">0%</div>
              <div className="text-[9px] uppercase tracking-wider text-primary-200 font-extrabold">Material Waste</div>
            </div>
            <div>
              <div className="text-3xl font-black text-secondary-500 leading-none mb-1">100%</div>
              <div className="text-[9px] uppercase tracking-wider text-primary-200 font-extrabold">Monolithic Unity</div>
            </div>
          </div>

        </div>

      </Section>

      {/* Global B2B Sourcing Call to Action */}
      <Section background="muted" padding="lg">
        <div className="bg-background rounded-3xl border border-border shadow-elevation-high p-8 md:p-12 relative overflow-hidden text-center">

          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-secondary-500/5 blur-3xl pointer-events-none" />

          <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">Request Technical Specifications</h3>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-lg mx-auto mb-8">
            Contact our engineering division to request system dimensions, hydraulic tolerances, local aggregate mix calculations, or site lease rates.
          </p>
          <a
            href="/contact?subject=3D Printing System Inquiry"
            className="inline-flex h-12 items-center justify-center rounded-xl text-white px-8 text-xs font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 shadow-elevation-high bg-gradient-to-br from-primary to-primary-700"
          >
            Consult Sourcing Engineer
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </Section>

    </main>
  );
}
