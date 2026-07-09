"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  User,
  ArrowRight,
  Tag,
  Search,
  Clock,
  BookOpen
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section, SectionHeader, SectionEyebrow, SectionHeading } from "@/components/ui/Section";

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
    <main className="bg-background min-h-screen">
      <PageHeader
        eyebrow="Knowledge Base & Insights"
        title={<>The Apex Modular <span className="text-primary">Journal</span></>}
        subtitle="Guides, standards, and industry insights for the Canadian modular construction market."
      >
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
      </PageHeader>

      <Section background="white" padding="md">
        <Link href={`/blog/${featuredPost.slug}`} className="group block relative rounded-3xl overflow-hidden bg-primary-900 text-white shadow-elevation-medium">
          <div className="grid lg:grid-cols-2">
            <div className="relative aspect-video overflow-hidden">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
              />
              <div className="absolute top-5 left-5">
                <span className="px-3 py-1.5 rounded-full bg-white text-primary-900 text-[10px] font-black uppercase tracking-widest shadow-elevation-low">
                  Featured Article
                </span>
              </div>
            </div>

            <div className="p-8 md:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-primary-300 text-xs font-bold mb-4">
                <span className="uppercase tracking-widest px-2 py-1 rounded bg-primary-500/20 border border-primary-500/30">
                  {featuredPost.category}
                </span>
                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {featuredPost.readTime}</span>
              </div>

              <h2 className="text-xl md:text-2xl font-black tracking-tight leading-snug mb-4 group-hover:text-secondary-500 transition-colors">
                {featuredPost.title}
              </h2>

              <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
                {featuredPost.excerpt}
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-xs shrink-0 text-white">
                  {featuredPost.author.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate text-white">{featuredPost.author}</p>
                  <p className="text-xs text-gray-500">{featuredPost.date}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-secondary-500 font-black uppercase tracking-widest text-[10px] shrink-0">
                  Read <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </Section>

      <Section background="muted" padding="sm">
        <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mr-2">Topics:</p>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeCategory === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:bg-primary/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Section>

      <Section background="muted" padding="md">
        <SectionHeader
          heading="Latest Articles & Insights"
          subheading="Stay informed with the latest modular construction knowledge."
        />

        <div>
          {recentPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-16 text-sm">No articles in this category yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-background rounded-2xl overflow-hidden border border-border shadow-elevation-low transition-all hover:shadow-elevation-medium hover:-translate-y-1"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-background/90 backdrop-blur-sm text-primary text-[9px] font-black uppercase tracking-widest">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-3">
                      <span>{post.date}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>{post.readTime}</span>
                    </div>

                    <h3 className="text-base font-black text-foreground leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] truncate mr-2 text-secondary-500">
                        By {post.author}
                      </span>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all group-hover:bg-primary/10 group-hover:translate-x-0.5 text-primary">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-elevation-low"
            >
              Get Expert Insights Directly
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Section>

      <Section background="dark" padding="md">
        <div className="max-w-3xl mx-auto text-center">
          <SectionEyebrow className="text-secondary-500">
            Expert Insights Delivered
          </SectionEyebrow>
          <SectionHeading className="text-white">
            Stay Ahead of the Modular Revolution
          </SectionHeading>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6 leading-relaxed mt-4">
            Get exclusive market analysis, compliance updates, and factory-direct sourcing strategies in your inbox.
          </p>

          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Your professional email"
              className="flex-1 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-all"
            />
            <button className="px-6 py-3 rounded-xl bg-secondary-500 text-primary-900 font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all shadow-elevation-low">
              Subscribe
            </button>
          </form>
          <p className="mt-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            Join 500+ Developers & Contractors
          </p>
        </div>
      </Section>
    </main>
  );
}
