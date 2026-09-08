"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";
import { Check, ShieldAlert, Award, FileText, Globe, Mail, Bell } from "lucide-react";
import { fetchPageContent } from "@/lib/content";

type Spec = { label: string; value: string };

type AboutBookContent = {
  intro_heading: string;
  paragraphs: string[];
  should_read: string[];
  should_not_read: string[];
  specifications: Spec[];
};

const DEFAULT_ABOUT_BOOK_CONTENT: AboutBookContent = {
  intro_heading: "A Modern Guide to an Ancient Battlefield",
  paragraphs: [
    "We live in an age of constant speed — bombarded by notifications, overwhelmed by choices, and quietly afraid of falling behind. Five thousand years ago, on the battlefield of Kurukshetra, the warrior Arjuna froze in that exact same way: paralyzed by doubt, grief, and the noise of conflicting duties. In response, Krishna delivered 700 verses of the Bhagavad Gita — not as an escape from life, but as a way to stand steady in the center of it. The Unshaken Self takes KETUL SHAH's years of scriptural research and turns those ancient verses into a modern mental toolkit: how to act without burning out, how to carry stress without being crushed by it, and how to meet each day from a place of quiet strength rather than reactive panic.",
    "The book is structured as a chapter-by-chapter journey through the Gita's core teachings, pairing each idea with a real, usable practice — like the Three-Breath Pause you can try right now in the free Chapter 1 preview — so the wisdom never just stays on the page. Exactly how those 18 chapters build on one another into a complete framework for an unshaken mind is something we're keeping under wraps until closer to launch. Subscribe or join the pre-order waitlist below, and you'll be the first to see the full chapter map, early excerpts, and launch-week bonuses before anyone else."
  ],
  should_read: [
    "Professionals facing extreme stress and burnout who need a mental anchor.",
    "Students struggling with uncertainty, career anxiety, and self-doubt.",
    "Seekers looking for a non-dogmatic, practical guide to Eastern philosophy.",
    "Leaders wanting to make decisions with absolute clarity and equanimity.",
    "Anyone who has tried meditation but struggles to stay calm in real-world situations."
  ],
  should_not_read: [
    "Those looking for a theological or dogmatic religious treatise.",
    "People seeking 'get rich quick' hacks or simple self-help platitudes.",
    "Anyone unwilling to reflect honestly and implement daily mindfulness practices.",
    "Those who prefer escaping reality over facing actions directly in daily life."
  ],
  specifications: [
    { label: "Book Title", value: "The Unshaken Self: Key Lessons from the Gita for a Life Without Doubt, Worry, and Fear" },
    { label: "Author Name", value: "KETUL SHAH" },
    { label: "Format", value: "Hardcover, Paperback, Kindle, Audiobook" },
    { label: "Page Count", value: "320 pages" },
    { label: "Publisher", value: "Vedic Wisdom Press (International)" },
    { label: "ISBN-13", value: "978-93-6068-721-2" },
    { label: "Dimensions", value: "6.0 x 9.0 inches" },
    { label: "Release Date", value: "September 4, 2026 (Krishna Janmashtami)" }
  ]
};

export default function AboutBook() {
  const [activeTab, setActiveTab] = useState<"overview" | "specs">("overview");
  const [content, setContent] = useState<AboutBookContent>(DEFAULT_ABOUT_BOOK_CONTENT);

  useEffect(() => {
    fetchPageContent("about-book", DEFAULT_ABOUT_BOOK_CONTENT).then(setContent);
  }, []);

  const targetAudience = {
    shouldRead: content.should_read,
    shouldNotRead: content.should_not_read
  };

  const specifications = content.specifications;

  return (
    <div className="flex-1 flex flex-col pt-16 bg-[#faf8f5] dark:bg-[#070b09]">
      <Navbar />

      {/* Page Header */}
      <header className="py-20 px-4 text-center border-b border-border-custom bg-white dark:bg-[#050806] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(223,177,91,0.03)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="text-[10px] tracking-[0.3em] text-[#b5924b] dark:text-[#dfb15b] uppercase font-bold">
            The Literary Blueprint
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-foreground leading-tight">
            About the Book
          </h1>
          <p className="text-xs sm:text-sm font-light text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
            Discover the story, structure, and promise of *The Unshaken Self* — a modern guide built from the Bhagavad Gita's 18 chapters.
          </p>
        </div>
      </header>

      {/* Interactive Tabs Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="flex justify-center space-x-6 border-b border-border-custom pb-4 mb-12">
          <button
            onClick={() => setActiveTab("overview")}
            className={`text-xs uppercase tracking-widest pb-2 font-semibold transition-all cursor-pointer ${
              activeTab === "overview"
                ? "text-[#dfb15b] border-b-2 border-[#dfb15b]"
                : "text-muted-text hover:text-foreground"
            }`}
          >
            About the Book
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`text-xs uppercase tracking-widest pb-2 font-semibold transition-all cursor-pointer ${
              activeTab === "specs"
                ? "text-[#dfb15b] border-b-2 border-[#dfb15b]"
                : "text-muted-text hover:text-foreground"
            }`}
          >
            Specifications & Editions
          </button>
        </div>

        {activeTab === "overview" ? (
          /* BOOK INTRODUCTION TEASER */
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="font-serif text-2xl text-foreground mb-2">{content.intro_heading}</h2>
            </div>

            <div className="space-y-6 text-sm sm:text-base font-light text-stone-600 dark:text-stone-300 leading-relaxed text-justify sm:text-center">
              {content.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/#newsletter"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-[#1e3f20] hover:bg-[#142a15] dark:bg-[#dfb15b] dark:hover:bg-[#c49945] text-white dark:text-black text-xs uppercase tracking-widest font-bold shadow-md transition-all hover:scale-105"
              >
                <Mail className="w-4 h-4" />
                <span>Subscribe for Updates</span>
              </Link>
              <Link
                href="/preorder"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-full border border-border-custom hover:bg-black/5 dark:hover:bg-white/5 text-foreground text-xs uppercase tracking-widest font-semibold transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span>Join the Pre-Order Waitlist</span>
              </Link>
            </div>
          </div>
        ) : (
          /* SPECIFICATIONS & EDITIONS */
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Book specs table */}
            <div className="space-y-6">
              <h2 className="font-serif text-xl text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#dfb15b]" />
                <span>Technical Specifications</span>
              </h2>
              <div className="border border-border-custom rounded-2xl overflow-hidden bg-white dark:bg-[#101614]">
                {specifications.map((spec, idx) => (
                  <div
                    key={spec.label}
                    className={`flex justify-between items-center p-4 text-xs ${
                      idx !== specifications.length - 1 ? "border-b border-border-custom" : ""
                    } ${idx % 2 === 0 ? "bg-stone-50/50 dark:bg-black/20" : ""}`}
                  >
                    <span className="font-mono text-muted-text uppercase tracking-wider">{spec.label}</span>
                    <span className="font-sans font-medium text-foreground text-right max-w-[200px] sm:max-w-xs">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Book editions details */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="font-serif text-xl text-foreground flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#dfb15b]" />
                  <span>Available Editions</span>
                </h2>
                <div className="space-y-4">
                  <div className="p-5 border border-border-custom rounded-2xl bg-white dark:bg-[#101614]">
                    <h4 className="font-serif text-sm font-semibold">Deluxe Collector's Hardcover</h4>
                    <p className="text-[10px] text-muted-text mt-1">Smyth-sewn, gold-foil stamping, premium paper.</p>
                  </div>
                  <div className="p-5 border border-border-custom rounded-2xl bg-white dark:bg-[#101614]">
                    <h4 className="font-serif text-sm font-semibold">Standard Paperback</h4>
                    <p className="text-[10px] text-muted-text mt-1">Lightweight, recycled acid-free cream paper.</p>
                  </div>
                  <div className="p-5 border border-border-custom rounded-2xl bg-white dark:bg-[#101614]">
                    <h4 className="font-serif text-sm font-semibold">Digital Edition (Kindle / ePub)</h4>
                    <p className="text-[10px] text-muted-text mt-1">Full bookmarks, adjustable typography, interactive index.</p>
                  </div>
                  <p className="text-[10px] text-muted-text italic pt-1">Final pricing for each edition will be announced closer to launch.</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#1e3f20]/5 dark:bg-[#dfb15b]/5 border border-primary/10 dark:border-accent/10">
                <h3 className="font-serif text-sm text-foreground flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-[#dfb15b]" />
                  <span>Global Availability</span>
                </h3>
                <p className="text-xs font-light text-stone-500 dark:text-stone-400 leading-relaxed">
                  Published in English and Hindi simultaneously, with translations in German, Spanish, and Sanskrit Commentary scheduled for late 2026.
                </p>
              </div>
            </div>

          </div>
        )}
      </section>

      {/* Target Audience Comparative Section */}
      <section className="py-20 px-4 bg-white dark:bg-[#050806] border-t border-border-custom">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs uppercase tracking-[0.25em] text-[#b5924b] dark:text-[#dfb15b] font-semibold">
              Readership Alignment
            </h2>
            <h3 className="text-2xl sm:text-3xl font-serif text-foreground">
              Is This Book for You?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Who should read */}
            <div className="p-8 border border-green-200/40 dark:border-green-950/20 rounded-2xl bg-green-50/10 dark:bg-green-950/5 space-y-6">
              <h4 className="font-serif text-base text-green-700 dark:text-green-400 flex items-center gap-2 font-semibold">
                <Check className="w-5 h-5" />
                <span>Who Should Read This</span>
              </h4>
              <ul className="space-y-4">
                {targetAudience.shouldRead.map((text, idx) => (
                  <li key={idx} className="flex space-x-3 text-xs sm:text-sm font-light text-stone-600 dark:text-stone-300">
                    <span className="text-green-500 flex-shrink-0">•</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Who should NOT read */}
            <div className="p-8 border border-red-200/40 dark:border-red-950/20 rounded-2xl bg-red-50/10 dark:bg-red-950/5 space-y-6">
              <h4 className="font-serif text-base text-red-700 dark:text-red-400 flex items-center gap-2 font-semibold">
                <ShieldAlert className="w-5 h-5" />
                <span>Who Should Avoid This</span>
              </h4>
              <ul className="space-y-4">
                {targetAudience.shouldNotRead.map((text, idx) => (
                  <li key={idx} className="flex space-x-3 text-xs sm:text-sm font-light text-stone-600 dark:text-stone-300">
                    <span className="text-red-400 flex-shrink-0">•</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 px-4 text-center border-t border-border-custom bg-[#faf8f5] dark:bg-[#070b09]">
        <div className="max-w-xl mx-auto space-y-6">
          <h3 className="font-serif text-xl sm:text-2xl text-foreground">
            Experience the First Chapter Today
          </h3>
          <p className="text-xs font-light text-stone-500 max-w-sm mx-auto leading-relaxed">
            Read the Chapter 1 draft and download the printable sample PDF on our interactive preview page.
          </p>
          <Link
            href="/preview"
            className="inline-block px-8 py-3 rounded-full bg-[#1e3f20] hover:bg-[#142a15] dark:bg-[#dfb15b] dark:hover:bg-[#c49945] text-white dark:text-black text-xs uppercase tracking-widest font-bold shadow-md transition-all hover:scale-105"
          >
            Access Book Preview
          </Link>
        </div>
      </section>

      <AIChatbot />
      <Footer />
    </div>
  );
}
