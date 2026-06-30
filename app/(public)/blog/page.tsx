"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  User,
  ArrowRight,
  Tag,
  Search,
  ChevronRight,
  Clock,
  BookOpen
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

// Design Tokens
const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

// Mock Blog Data
const BLOG_POSTS = [
  {
    slug: "importing-light-steel-structures-china-to-canada",
    title: "The Developer's Guide to Importing Light Steel Structures from China",
    excerpt: "Learn how to save up to 65% on structural costs by sourcing precision-engineered steel directly from Chinese manufacturers while ensuring full compliance with Canadian building codes.",
    category: "Construction",
    date: "May 12, 2026",
    readTime: "8 min read",
    author: "Apex Modular Construction Engineering Team",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80",
    featured: true
  },
  {
    slug: "csa-a277-vs-z240-compliance-guide",
    title: "CSA A277 vs. Z240.10: Which Standard Does Your Prefab Project Need?",
    excerpt: "Navigating Canadian compliance can be confusing. We break down the differences between modular building standards and how to ensure your import is permitted.",
    category: "Compliance",
    date: "May 10, 2026",
    readTime: "12 min read",
    author: "Saeid Shabani",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    featured: false
  },
  {
    slug: "top-5-modular-home-trends-2026",
    title: "Top 5 Modular Home Trends Shaping the Canadian Market in 2026",
    excerpt: "From sustainable garden suites to high-tech industrial prefab, explore the trends driving the modular revolution in Canada.",
    category: "Trends",
    date: "May 05, 2026",
    readTime: "6 min read",
    author: "Marketing Team",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80",
    featured: false
  },
  {
    slug: "shipping-logistics-large-scale-prefab",
    title: "Logistics Masterclass: Shipping Large-Scale Prefab Components Internationally",
    excerpt: "How we manage ocean freight, customs clearance, and last-mile delivery for oversized construction components.",
    category: "Logistics",
    date: "April 28, 2026",
    readTime: "10 min read",
    author: "Logistics Dept",
    image: "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=800&q=80",
    featured: false
  }
];

const CATEGORIES = ["All Posts", "Construction", "Compliance", "Logistics", "Trends", "Case Studies"];

export default function BlogHubPage() {
  const [activeCategory, setActiveCategory] = useState("All Posts");

  const featuredPost = BLOG_POSTS.find(p => p.featured) || BLOG_POSTS[0];
  const allRecent = BLOG_POSTS.filter(p => !p.featured);
  const recentPosts = activeCategory === "All Posts"
    ? allRecent
    : allRecent.filter(p => p.category === activeCategory);

  return (
    <main className="bg-white min-h-screen">
      <PageHeader
        eyebrow="Knowledge Base & Insights"
        title={<>The Apex Modular <span style={{ color: PURPLE }}>Journal</span></>}
        subtitle="Guides, standards, and industry insights for the Canadian modular construction market."
      >
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
          />
        </div>
      </PageHeader>

      {/* Featured Post */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href={`/blog/${featuredPost.slug}`} className="group block relative rounded-3xl overflow-hidden bg-gray-900 text-white shadow-xl">
            <div className="grid lg:grid-cols-2">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                />
                <div className="absolute top-5 left-5">
                  <span className="px-3 py-1.5 rounded-full bg-white text-gray-900 text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Featured Article
                  </span>
                </div>
              </div>

              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-purple-300 text-xs font-bold mb-4">
                  <span className="uppercase tracking-widest px-2 py-1 rounded bg-purple-500/20 border border-purple-500/30">
                    {featuredPost.category}
                  </span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {featuredPost.readTime}</span>
                </div>

                <h2 className="text-xl md:text-2xl font-black tracking-tight leading-snug mb-4 group-hover:text-[#D4AF37] transition-colors">
                  {featuredPost.title}
                </h2>

                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                  {featuredPost.excerpt}
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {featuredPost.author.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{featuredPost.author}</p>
                    <p className="text-xs text-gray-500">{featuredPost.date}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-[#D4AF37] font-black uppercase tracking-widest text-[10px] shrink-0">
                    Read <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="py-6 px-6 border-y border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center justify-center md:justify-start">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mr-2">Topics:</p>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeCategory === cat
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-purple-200 hover:bg-purple-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Recent Posts Grid */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {recentPosts.length === 0 ? (
            <p className="text-center text-gray-400 py-16 text-sm">No articles in this category yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-gray-900 text-[9px] font-black uppercase tracking-widest">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                      <span>{post.date}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>{post.readTime}</span>
                    </div>

                    <h3 className="text-base font-black text-gray-900 leading-tight mb-3 group-hover:text-purple-700 transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] truncate mr-2" style={{ color: GOLD }}>
                        By {post.author}
                      </span>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all group-hover:bg-purple-100 group-hover:translate-x-0.5" style={{ color: PURPLE }}>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Load More */}
          <div className="mt-10 text-center">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-900 hover:border-purple-200 hover:bg-purple-50 transition-all shadow-sm">
              Show More Articles
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-3xl mx-auto rounded-2xl p-8 md:p-12 bg-gray-900 text-white text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] mb-3 text-[#D4AF37]">
            Expert Insights Delivered
          </p>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight mb-4">
            Stay Ahead of the Modular Revolution
          </h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            Get exclusive market analysis, compliance updates, and factory-direct sourcing strategies in your inbox.
          </p>

          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Your professional email"
              className="flex-1 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all"
            />
            <button className="px-6 py-3 rounded-xl bg-[#D4AF37] text-gray-900 font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all shadow-md">
              Subscribe
            </button>
          </form>
          <p className="mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Join 500+ Developers & Contractors
          </p>
        </div>
      </section>
    </main>
  );
}
