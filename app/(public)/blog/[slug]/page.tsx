"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Share2, 
  MessageSquare,
  ChevronRight,
  BookOpen,
  ArrowRight
} from "lucide-react";

// Design Tokens
const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

// Mock Data (matches the hub)
const POSTS_DATA = {
  "importing-light-steel-structures-china-to-canada": {
    title: "The Developer's Guide to Importing Light Steel Structures from China",
    category: "Construction",
    date: "May 12, 2026",
    readTime: "8 min read",
    author: "Apex Modular Construction Engineering Team",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80",
    content: `
      <p>The Canadian construction landscape is undergoing a massive shift. As labor costs rise and material availability fluctuates, developers are increasingly looking toward international sourcing to maintain margins. Among the most impactful solutions is <strong>Light Steel Structure (LSS)</strong> systems sourced from high-precision factories in China.</p>

      <h2>Why Light Steel?</h2>
      <p>Unlike traditional wood framing, light steel offers unparalleled dimensional consistency. It doesn't warp, shrink, or rot. In the context of the Canadian climate, steel provides superior resistance to extreme wind and snow loads while being naturally resistant to pests and fire.</p>

      <blockquote>
        "By sourcing precision-engineered steel directly from vetted manufacturers, we've seen developers reduce their structural cost-per-square-meter from $2,000 to as low as $700."
      </blockquote>

      <h2>The Cost Breakdown: China vs. Canada</h2>
      <p>The primary driver for importing is cost-efficiency. A local structural steel package for a mid-scale development in Ontario or BC can easily exceed $2,000 per SQM once fabrication and local delivery are factored in. When sourcing through Apex Modular Construction, the same system—including architectural engineering, fabrication in China, and sea-freight to a Canadian port—typically lands at roughly $700 per SQM.</p>

      <h3>Key Savings Drivers:</h3>
      <ul>
        <li><strong>Scalable Manufacturing:</strong> Chinese factories operate at a volume that local fabricators simply cannot match.</li>
        <li><strong>Labor Arbitrage:</strong> The cost of high-precision factory labor in China is significantly lower than site labor in Canada.</li>
        <li><strong>Reduced Waste:</strong> Every piece is pre-cut to the millimeter, meaning you aren't paying for raw material that ends up in a dumpster on-site.</li>
      </ul>

      <h2>Navigating Compliance</h2>
      <p>The most common concern for Canadian developers is compliance with the National Building Code (NBC) and CSA standards. It is critical to work with a partner that understands <strong>CSA A277</strong> and <strong>CSA Z240</strong> requirements. At Apex Modular Construction, we ensure every structural plan is reviewed by a Canadian P.Eng (Professional Engineer) to ensure that the imported components meet or exceed local requirements.</p>

      <h2>Conclusion</h2>
      <p>Importing light steel structures isn't just about saving money—it's about building faster, more accurately, and with a more durable material. As the modular industry continues to grow, those who master the international supply chain will have a significant competitive advantage.</p>
    `
  },
  "csa-a277-vs-z240-compliance-guide": {
    title: "CSA A277 vs. Z240.10: Which Standard Does Your Prefab Project Need?",
    category: "Compliance",
    date: "May 10, 2026",
    readTime: "12 min read",
    author: "Saeid Shabani",
    image: "https://images.unsplash.com/photo-1503387762-592dee58c160?w=1200&q=80",
    content: `
      <p>Understanding the difference between CSA A277 and CSA Z240.10 is essential for anyone importing prefabricated buildings or modular homes into Canada. These standards govern how buildings are constructed, inspected, and certified.</p>
      <h2>What is CSA A277?</h2>
      <p>CSA A277 is the "Procedure for Certification of Prefabricated Buildings, Modules, and Panels." It is not a building code itself, but a process that ensures the factory building the structures is following a quality control program that meets the building code of the final destination (e.g., BC Building Code or Ontario Building Code).</p>
      <h2>What is CSA Z240.10?</h2>
      <p>Specifically designed for mobile homes and manufactured homes, Z240.10 is a more prescriptive standard. It is typically used for structures that remain on a chassis or are designed to be moved more frequently than a standard modular building.</p>
    `
  }
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = POSTS_DATA[slug as keyof typeof POSTS_DATA];

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-4">Post Not Found</h1>
        <p className="text-gray-500 mb-8">The article you are looking for doesn't exist or has been moved.</p>
        <Link href="/blog" className="px-8 py-4 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest text-xs">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen pb-24">
      {/* Progress Bar (Visual Only) */}
      <div className="fixed top-0 left-0 h-1 bg-yellow-400 z-50 w-1/3" />

      {/* Article Header */}
      <header className="pt-24 pb-12 px-6 bg-[#F8F6FC]">
        <div className="max-w-4xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-purple-700 transition-colors mb-12">
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
             <span className="px-4 py-1.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-widest border border-purple-200">
               {post.category}
             </span>
             <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
               <Calendar className="w-3.5 h-3.5" />
               {post.date}
               <span className="w-1 h-1 rounded-full bg-gray-300 mx-1" />
               <Clock className="w-3.5 h-3.5" />
               {post.readTime}
             </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-[1000] text-gray-900 tracking-tighter leading-tight mb-8">
            {post.title}
          </h1>
          
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-black">
                {post.author.charAt(0)}
             </div>
             <div>
                <p className="text-sm font-black text-gray-900 leading-none mb-1">{post.author}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Apex Modular Construction Authority</p>
             </div>
             
             <div className="ml-auto flex items-center gap-2">
                <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all">
                  <Share2 className="w-4 h-4 text-gray-600" />
                </button>
             </div>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="px-6 -mt-8">
        <div className="max-w-6xl mx-auto h-[400px] md:h-[600px] rounded-[48px] overflow-hidden shadow-2xl">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Article Content */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Content Render */}
          <div 
            className="prose prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:text-gray-600 prose-p:leading-relaxed prose-blockquote:border-l-4 prose-blockquote:border-yellow-400 prose-blockquote:bg-gray-50 prose-blockquote:p-8 prose-blockquote:rounded-r-2xl prose-blockquote:font-bold prose-blockquote:text-gray-900 prose-blockquote:italic prose-li:text-gray-600"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          {/* Tags */}
          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
             {["Modular", "Light Steel", "Construction", "Canada", "Importing"].map(tag => (
               <span key={tag} className="px-4 py-2 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                 #{tag}
               </span>
             ))}
          </div>
          
          {/* Author Bio Card */}
          <div className="mt-16 p-10 rounded-[40px] bg-[#F8F6FC] border border-purple-100 flex flex-col md:flex-row items-center gap-8">
             <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-3xl font-black text-white shrink-0">
                {post.author.charAt(0)}
             </div>
             <div>
                <h4 className="text-xl font-black text-gray-900 mb-2">Written by {post.author}</h4>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Expert in international construction supply chains and modular systems. Specializing in 
                  bridging Chinese manufacturing excellence with Canadian building standards.
                </p>
                <div className="flex gap-4">
                   <Link href="/contact" className="text-xs font-black uppercase tracking-widest" style={{ color: PURPLE }}>
                     Request Consultation
                   </Link>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Post-Article CTA */}
      <section className="py-12 px-6">
         <div className="max-w-4xl mx-auto p-12 rounded-[48px] bg-gray-900 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
               <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-4">Need a Structural Estimate?</h3>
               <p className="text-gray-400 mb-8 max-w-lg mx-auto">Get a detailed cost breakdown for your light steel or modular project in Canada.</p>
               <Link href="/contact?subject=Structural Estimate Request" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-yellow-400 text-gray-900 font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform">
                  Request Free Estimate <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
         </div>
      </section>
    </main>
  );
}
