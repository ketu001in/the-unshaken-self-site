"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight, Sparkles, BookOpen, Quote, Shield, Compass, Brain, Feather, ChevronDown, X,
  Award, Heart, Star, Sun, Moon, Flame, Anchor, Target
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Book3D from "@/components/Book3D";
import Countdown from "@/components/Countdown";
import AIChatbot from "@/components/AIChatbot";
import { createClient } from "@/lib/supabase/client";
import { fetchPageContent } from "@/lib/content";
import { useSiteSettings } from "@/context/SiteSettingsContext";

// Chapter icons are stored as string keys in content (JSON can't hold a
// component reference), then resolved to a real icon here at render time.
const CHAPTER_ICON_MAP: Record<string, LucideIcon> = {
  Shield, Compass, Brain, Feather, Sparkles, BookOpen, Award, Heart, Star, Sun, Moon, Flame, Anchor, Target
};

type Testimonial = { quote: string; author: string; role: string; rating: number };
type Chapter = { num: number; title: string; theme: string; desc: string; icon: string };
type Faq = { q: string; a: string };

type HomepageContent = {
  hero_badge: string;
  hero_headline_line1: string;
  hero_headline_accent: string;
  hero_headline_line2: string;
  hero_subtext: string;
  why_kicker: string;
  why_heading: string;
  why_paragraphs: string[];
  why_quote: string;
  author_badge_title: string;
  author_badge_tags: string;
  author_brief: string;
  testimonials: Testimonial[];
  chapters: Chapter[];
  faqs: Faq[];
};

const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  hero_badge: "Upcoming Book Launch",
  hero_headline_line1: "The",
  hero_headline_accent: "Unshaken",
  hero_headline_line2: "Self",
  hero_subtext: "Key Lessons from the Gita for a Life Without Doubt, Worry, and Fear. A modern blueprint to conquer anxiety and unlock absolute focus.",
  why_kicker: "The Modern Dilemma",
  why_heading: "Finding Stillness in a Hyper-Active World",
  why_paragraphs: [
    "We live in an age of constant speed. We are bombarded with notifications, overwhelmed by choices, and plagued by the fear of falling behind. Yet, the anxiety we feel today is not new.",
    "Five thousand years ago, on the battlefield of Kurukshetra, the warrior Arjuna suffered a severe panic attack. He was paralyzed by doubt, fear, and grief. In response, Krishna spoke the 700 verses of the Bhagavad Gita—not to teach escape, but to show how to stand firm in the center of life's battle.",
    "*The Unshaken Self* takes KETUL SHAH's years of scriptural study and converts the Gita's 18 chapters into a mental toolkit. It details how to perform action without burnouts, handle stress with grace, and live a life grounded in presence."
  ],
  why_quote: "An unshaken self is not one that avoids the storm, but one that remains still at the center of it.",
  author_badge_title: "Author - The Unshaken Self",
  author_badge_tags: "Spiritual Curious / Avid Reader / Writer",
  author_brief: "Ketul Shah is a dedicated Vedic philosophy explorer and professional counselor. Driven by a mission to bridge traditional Eastern spirituality with contemporary cognitive therapy, Ketul spent the last seven years studying the Bhagavad Gita's psychological implications. His upcoming book, *The Unshaken Self*, translates Vedic insights into practical mental exercises tailored for people working under extreme pressure.",
  testimonials: [
    { quote: "Ketul Shah has achieved something remarkable—taking a 5,000-year-old dialogue and showing exactly how it can save you from burnout at work. Essential reading for the modern professional.", author: "Dr. Ananya Rao", role: "Mindfulness Researcher & Psychologist", rating: 5 },
    { quote: "The Unshaken Self is an anchor. In a world full of noise, this book offers the precise psychological framework needed to stay calm, focused, and steady.", author: "Vikram Malhotra", role: "Founder, Peak Performance Labs", rating: 5 },
    { quote: "Brilliant, practical, and deeply moving. The chapter on Karma Yoga alone completely altered how I approach product launches and failure.", author: "Siddharth Mehta", role: "Tech Entrepreneur & Book Club Host", rating: 5 }
  ],
  chapters: [
    { num: 1, title: "Mastering Inner Doubt", theme: "Arjuna Vishada Yoga", desc: "How to face anxiety and imposter syndrome when standing before major life transitions.", icon: "Shield" },
    { num: 2, title: "The Unshaken Center", theme: "Sankhya Yoga", desc: "Cultivating intellectual stability and recognizing the permanent self within.", icon: "Compass" },
    { num: 3, title: "Action without Anxiety", theme: "Karma Yoga", desc: "The art of performing work with 100% effort while detaching from expectations and results.", icon: "Brain" },
    { num: 6, title: "Calming the Mental Storm", theme: "Dhyana Yoga", desc: "Practical breathwork and mindfulness guidelines for training a hyper-active mind.", icon: "Feather" },
    { num: 12, title: "Accepting Life's Rhythm", theme: "Bhakti Yoga", desc: "Developing emotional resilience and surrender in the face of uncontrollable events.", icon: "Sparkles" },
    { num: 16, title: "Cultivating Divine Habit", theme: "Daivasura Sampad Yoga", desc: "Establishing integrity, self-discipline, and wisdom in everyday actions.", icon: "BookOpen" }
  ],
  faqs: [
    { q: "What makes this book different from traditional translations of the Bhagavad Gita?", a: "Rather than focusing purely on literal translation or theological debates, *The Unshaken Self* acts as a practical handbook. It takes the philosophical essence of all 18 chapters and translates them into actionable exercises—like morning journaling, breath practices, and detached goal planning—built specifically for 2026's busy, high-stress lifestyle." },
    { q: "When is the launch date and what are the launch phases?", a: "The planned launch is on the eve of Krishna Janmashtami (September 4–5, 2026). Currently, we are in the Pre-Launch phase. Pre-ordering grants you immediate access to Chapter 1, workbook PDFs, and an invite to a private Q&A session with KETUL SHAH. The Launch phase will release the full book/audiobook, followed by Post-Launch workshops." },
    { q: "Where will the book be available to purchase?", a: "The book will be available globally in hardcover, paperback, kindle, and audiobook formats. Direct links will include Amazon, Flipkart, and leading local bookstore platforms. You can check our preorder page for live price comparisons." },
    { q: "How does the AI Gita Companion work?", a: "The floating widget at the bottom right represents the AI Gita Companion. It acts as an interactive assistant trained on the chapters of the book. You can query it on topics like 'handling work stress' or 'finding focus', and it will retrieve practical counsel matching the Gita's teachings." }
  ]
};

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [content, setContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE_CONTENT);
  const { settings } = useSiteSettings();

  useEffect(() => {
    fetchPageContent("homepage", DEFAULT_HOMEPAGE_CONTENT).then(setContent);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const gitaChapters = content.chapters;
  const faqs = content.faqs;

  return (
    <div className="flex-1 flex flex-col pt-16">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-16 px-4 overflow-hidden bg-gradient-to-b from-[#faf8f5] via-[#faf8f5] to-[#f2ede4] dark:from-[#070b09] dark:via-[#070b09] dark:to-[#0d1612]">
        
        {/* Soft Background Mandala Circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#dfb15b]/10 rounded-full pointer-events-none dark:opacity-20" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-dashed border-[#dfb15b]/15 rounded-full pointer-events-none dark:opacity-20 animate-[spin_100s_linear_infinite]" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          
          {/* Left: Headline & Callouts */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#1e3f20]/5 dark:bg-[#dfb15b]/10 border border-[#1e3f20]/10 dark:border-[#dfb15b]/20">
              <Sparkles className="w-4.5 h-4.5 text-[#dfb15b]" />
              <span className="text-[11px] tracking-[0.2em] uppercase font-semibold text-primary dark:text-[#dfb15b]">
                {content.hero_badge}
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif tracking-wide leading-tight text-foreground">
                {content.hero_headline_line1}
                <br className="hidden sm:inline" />
                <span className="text-[#b5924b] dark:text-[#dfb15b] font-medium">{content.hero_headline_accent}</span> {content.hero_headline_line2}
              </h1>
              <p className="text-sm sm:text-base md:text-lg font-sans font-light text-stone-600 dark:text-stone-300 max-w-xl leading-relaxed tracking-wide">
                {content.hero_subtext}
              </p>
            </div>

            {/* Countdown Component */}
            {settings.section_visibility.show_countdown && (
              <div className="py-4 w-full">
                <Countdown />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/preorder"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#1e3f20] hover:bg-[#142a15] dark:bg-[#dfb15b] dark:hover:bg-[#c49945] text-white dark:text-black text-xs uppercase tracking-widest font-bold shadow-lg transition-transform hover:scale-105"
              >
                Pre-Order Book
              </Link>
              <Link
                href="/preview"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-border-custom hover:bg-black/5 dark:hover:bg-white/5 text-foreground text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <span>Read First Chapter</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

          {/* Right: 3D Book Graphic */}
          <div className="lg:col-span-5 flex justify-center py-8">
            <Book3D
              coverImageUrl={settings.book_cover_front_url}
              wrapUrl={settings.book_cover_wrap_url}
              spinePct={settings.book_cover_spine_pct}
              backPct={settings.book_cover_back_pct}
              layout={settings.book_cover_layout}
            />
          </div>

        </div>

      </section>

      {/* 2. WHY THIS BOOK */}
      <section className="py-24 px-4 bg-white dark:bg-[#070b09] border-t border-border-custom">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-[0.25em] text-[#b5924b] dark:text-[#dfb15b] font-semibold">
              {content.why_kicker}
            </h2>
            <h3 className="text-3xl sm:text-4xl font-serif text-foreground leading-snug">
              {content.why_heading}
            </h3>
          </div>

          {/* Core premise text */}
          <div className="space-y-6 text-stone-600 dark:text-stone-300 font-light leading-relaxed text-sm sm:text-base max-w-3xl mx-auto text-justify sm:text-center">
            {content.why_paragraphs[0] && <p>{content.why_paragraphs[0]}</p>}
            {content.why_paragraphs[1] && <p>{content.why_paragraphs[1]}</p>}
            <p className="font-medium text-foreground dark:text-[#dfb15b] italic font-serif text-lg sm:text-xl py-4">
              &ldquo;{content.why_quote}&rdquo;
            </p>
            {content.why_paragraphs[2] && <p>{content.why_paragraphs[2]}</p>}
          </div>

        </div>
      </section>

      {/* 3. THE 18 CHAPTERS (PREVIEW GRID) */}
      <section className="py-24 px-4 bg-[#faf8f5] dark:bg-[#050806] border-t border-border-custom">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-xs uppercase tracking-[0.25em] text-[#b5924b] dark:text-[#dfb15b] font-semibold">
                Inside the Pages
              </h2>
              <h3 className="text-3xl sm:text-4xl font-serif text-foreground">
                18 Chapters of Real-World Blueprint
              </h3>
              <p className="text-sm font-light text-stone-500 dark:text-stone-400">
                Explore how the ancient yogic steps map to our contemporary psychological hurdles. Here is a preview of the core chapters:
              </p>
            </div>
            <Link
              href="/about-book"
              className="group inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold text-[#b5924b] dark:text-[#dfb15b] hover:text-[#9c7b3b] dark:hover:text-[#c49945] transition-colors"
            >
              <span>View All 18 Chapters</span>
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gitaChapters.map((ch) => {
              const ChapterIcon = CHAPTER_ICON_MAP[ch.icon] || BookOpen;
              return (
              <div
                key={ch.num}
                className="bg-white dark:bg-[#101614] rounded-3xl p-8 border border-border-custom flex flex-col justify-between premium-card-hover shadow-sm"
              >
                <div className="space-y-6">
                  {/* Icon & Chapter Number */}
                  <div className="flex justify-between items-center">
                    <div className="w-12 h-12 rounded-xl bg-[#1e3f20]/5 dark:bg-[#dfb15b]/10 flex items-center justify-center text-primary dark:text-[#dfb15b]">
                      <ChapterIcon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs text-muted-text font-bold uppercase tracking-widest">
                      Ch. {ch.num}
                    </span>
                  </div>
                  
                  {/* Titles */}
                  <div className="space-y-2">
                    <h4 className="text-lg font-serif text-foreground tracking-wide font-semibold">
                      {ch.title}
                    </h4>
                    <p className="text-[10px] tracking-widest font-mono text-[#b5924b] dark:text-[#dfb15b] uppercase font-light">
                      {ch.theme}
                    </p>
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs sm:text-sm font-light text-stone-500 dark:text-stone-400 leading-relaxed">
                    {ch.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-border-custom/50 flex justify-end">
                  <Link 
                    href="/preview"
                    className="text-[10px] uppercase tracking-widest font-semibold text-muted-text hover:text-foreground transition-colors"
                  >
                    Read Chapter Draft
                  </Link>
                </div>
              </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. CINEMATIC TRAILER PLACEHOLDER */}
      <section className="py-24 px-4 bg-white dark:bg-[#070b09] border-t border-border-custom flex justify-center">
        <div className="max-w-5xl w-full">
          <div className="space-y-8 text-center mb-12">
            <h2 className="text-xs uppercase tracking-[0.25em] text-[#b5924b] dark:text-[#dfb15b] font-semibold">
              The Experience
            </h2>
            <h3 className="text-3xl font-serif text-foreground">
              Official Book Cinematic Trailer
            </h3>
          </div>

          {/* Interactive Player Mockup */}
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-border-custom group">
            {!videoPlaying ? (
              <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-6 bg-gradient-to-t from-black/85 via-black/45 to-black/30">
                {settings.trailer_video_url && (
                  <video
                    src={settings.trailer_video_url}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                )}
                {/* Visual Cover/Overlay */}
                <div className="absolute inset-0 bg-stone-900/60 mix-blend-overlay group-hover:scale-105 transition-transform duration-700 pointer-events-none" />

                {/* Serene Nature Background Concept (Simulated) */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,63,32,0.4)_0%,transparent_70%)] pointer-events-none" />

                {/* Big wise quotes */}
                <div className="relative max-w-xl text-center space-y-3 mb-8 animate-pulse">
                  <Quote className="w-8 h-8 text-[#dfb15b] mx-auto opacity-75" />
                  <p className="font-serif italic text-base sm:text-xl text-stone-200">
                    "Perform your duty with absolute focus. The results will take care of themselves."
                  </p>
                </div>

                {/* Play Button Trigger */}
                <button
                  onClick={() => setVideoPlaying(true)}
                  className="relative w-16 h-16 rounded-full bg-white dark:bg-[#dfb15b] text-black dark:text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                  aria-label="Play Cinematic Book Trailer"
                >
                  <svg className="w-6 h-6 ml-1 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <span className="relative text-[10px] tracking-widest text-stone-400 mt-4 uppercase font-semibold">
                  Click to play 1-minute intro preview
                </span>
              </div>
            ) : settings.trailer_video_url ? (
              <div className="absolute inset-0 z-10 bg-black">
                <video
                  src={settings.trailer_video_url}
                  className="w-full h-full"
                  controls
                  autoPlay
                  playsInline
                />
                <button
                  onClick={() => setVideoPlaying(false)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close Video Player"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 z-10 bg-black flex flex-col items-center justify-center gap-4 text-center px-6">
                {/* No trailer has been uploaded yet — show an honest "coming soon" state.
                    The admin can upload a trailer from Site Editor -> General & Contact. */}
                <Quote className="w-8 h-8 text-[#dfb15b] opacity-75" />
                <p className="font-serif italic text-base sm:text-xl text-stone-200 max-w-md">
                  The cinematic trailer is still in production.
                </p>
                <span className="text-[10px] tracking-widest text-stone-400 uppercase font-semibold">
                  Check back closer to launch
                </span>

                {/* Close Overlay button */}
                <button
                  onClick={() => setVideoPlaying(false)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close Video Player"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Simulated text transitions overlay */}
                <div className="absolute bottom-6 inset-x-6 z-20 text-center pointer-events-none">
                  <span className="bg-black/60 px-4 py-1.5 rounded-full text-[11px] tracking-widest text-[#dfb15b] uppercase font-mono">
                    The Unshaken Self — Coming Krishna Janmashtami 2026
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      {settings.section_visibility.show_testimonials && (
      <section className="py-24 px-4 bg-[#faf8f5] dark:bg-[#050806] border-t border-border-custom">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-xs uppercase tracking-[0.25em] text-[#b5924b] dark:text-[#dfb15b] font-semibold">
              Endorsements
            </h2>
            <h3 className="text-3xl font-serif text-foreground">
              What Early Readers Say
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.testimonials.map((t, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-[#101614] rounded-3xl p-8 border border-border-custom flex flex-col justify-between premium-card-hover shadow-sm"
              >
                <div className="space-y-6">
                  {/* Star Ratings */}
                  <div className="flex space-x-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <span key={i} className="text-[#dfb15b] text-base">★</span>
                    ))}
                  </div>
                  
                  {/* Quote content */}
                  <p className="text-stone-600 dark:text-stone-300 font-light text-xs sm:text-sm leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="mt-8 pt-4 border-t border-border-custom/50">
                  <h4 className="font-sans text-xs uppercase tracking-widest text-foreground font-bold">
                    {t.author}
                  </h4>
                  <p className="text-[10px] text-muted-text mt-0.5">
                    {t.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* 6. ABOUT THE AUTHOR BRIEF */}
      <section className="py-24 px-4 bg-white dark:bg-[#070b09] border-t border-border-custom">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Author Portrait Column */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-[280px] h-[360px] md:w-[320px] md:h-[400px] border border-border-custom p-3 rounded-2xl bg-[#faf8f5] dark:bg-[#101614]">
              <div className="w-full h-full rounded-xl overflow-hidden relative bg-stone-100 dark:bg-[#0b100e]">
                <Image
                  src={settings.author_photo_url || "/images/ketul-shah-author.jpg"}
                  alt="Ketul Shah, author of The Unshaken Self"
                  fill
                  sizes="320px"
                  className="object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 text-center pointer-events-none space-y-0.5">
                  <p className="text-[10px] tracking-widest text-white uppercase font-bold">
                    Ketul Shah
                  </p>
                  <p className="text-[9px] text-white/90 uppercase font-mono">
                    {content.author_badge_title}
                  </p>
                  <p className="text-[8px] text-white/75 uppercase font-mono tracking-wide">
                    {content.author_badge_tags}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Details Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            <h2 className="text-xs uppercase tracking-[0.25em] text-[#b5924b] dark:text-[#dfb15b] font-semibold">
              Meet the Author
            </h2>
            <h3 className="text-3xl sm:text-4xl font-serif text-foreground">
              KETUL SHAH
            </h3>
            
            <p className="text-xs sm:text-sm font-light text-stone-600 dark:text-stone-300 leading-relaxed max-w-xl text-justify sm:text-center lg:text-left">
              {content.author_brief}
            </p>

            <div className="flex gap-4">
              <Link
                href="/about-author"
                className="px-6 py-2.5 rounded-full bg-[#1e3f20] hover:bg-[#142a15] dark:bg-[#dfb15b] dark:hover:bg-[#c49945] text-white dark:text-black text-xs uppercase tracking-widest font-semibold transition-transform hover:scale-105"
              >
                Read Full Journey
              </Link>
              <Link
                href="/about-author#media-kit"
                className="px-6 py-2.5 rounded-full border border-border-custom hover:bg-black/5 dark:hover:bg-white/5 text-foreground text-xs uppercase tracking-widest font-medium transition-colors"
              >
                Download Media Kit
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 7. INTERACTIVE FAQ SECTION */}
      <section className="py-24 px-4 bg-[#faf8f5] dark:bg-[#050806] border-t border-border-custom">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-xs uppercase tracking-[0.25em] text-[#b5924b] dark:text-[#dfb15b] font-semibold">
              Got Questions?
            </h2>
            <h3 className="text-3xl font-serif text-foreground">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-[#101614] border border-border-custom rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                  >
                    <span className="font-serif text-sm sm:text-base text-foreground tracking-wide font-medium">
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-text transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Answer Panel */}
                  <div 
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-60 opacity-100 border-t border-border-custom' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="p-6 text-xs sm:text-sm font-light text-stone-500 dark:text-stone-400 leading-relaxed bg-[#faf8f5]/45 dark:bg-[#090f0c]/30">
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. MAIN NEWSLETTER SIGNUP BANNER */}
      <section id="newsletter" className="py-24 px-4 bg-white dark:bg-[#070b09] border-t border-border-custom flex justify-center">
        <div className="max-w-4xl w-full glassmorphism border border-border-custom rounded-3xl p-12 text-center space-y-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#dfb15b]/5 dark:bg-[#dfb15b]/3 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#1e3f20]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-[0.25em] text-[#b5924b] dark:text-[#dfb15b] font-semibold">
              Gita reflections newsletter
            </h2>
            <h3 className="text-2xl sm:text-3xl font-serif text-foreground">
              Subscribe to the Inner Anchor
            </h3>
            <p className="text-xs sm:text-sm font-light text-stone-500 dark:text-stone-400 max-w-lg mx-auto leading-relaxed">
              Join KETUL SHAH's mailing list and receive weekly practical exercises inspired by the Gita's 18 chapters. Plus, get the preorder bonus packet immediately.
            </p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem("main-email") as HTMLInputElement).value;
              if (!input) return;

              const supabase = createClient();
              const { error } = await supabase
                .from("subscribers")
                .insert({ email: input.trim(), source: "Main Banner Newsletter" });

              if (error && !error.message.includes("duplicate")) {
                alert("Something went wrong — please try again.");
                return;
              }

              e.currentTarget.reset();
              alert("Pranam! Thank you for subscribing to KETUL SHAH's reflections.");
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              name="main-email"
              placeholder="Enter your email address"
              className="flex-1 text-xs bg-stone-50 dark:bg-[#0b100e] border border-border-custom rounded-full px-6 py-3.5 focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 text-foreground"
              required
            />
            <button
              type="submit"
              className="px-6 py-3.5 rounded-full bg-[#1e3f20] hover:bg-[#142a15] dark:bg-[#dfb15b] dark:hover:bg-[#c49945] text-white dark:text-black text-xs uppercase tracking-widest font-bold shadow-md transition-all cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* AIChatbot widget */}
      <AIChatbot />

      <Footer />
    </div>
  );
}
